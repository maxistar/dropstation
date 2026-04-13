#include "WateringDevice.h"

#include <Arduino.h>
#include <ESP8266HTTPClient.h>
#include <ESP8266WiFi.h>
#include <ESP8266mDNS.h>
#include <WiFiClient.h>
#include <WiFiClientSecureBearSSL.h>
#include <ArduinoJson.h>
#ifdef LED_ENABLED
#include <FastLED.h>
#endif
#include <memory>

#include "config.h"
#include "DeviceState.h"
#include "DoubleResetGuard.h"
#include "ScheduleLogic.h"
#include "Timer.h"
#include "WebServer.h"

namespace
{
const uint32_t kSecondsPerDay = 86400UL;
const size_t kMaxWateringSlots = 8;
const size_t kMaxLightingSlots = 8;
const size_t kDateHeaderCount = 1;
const char *kCollectedHeaders[kDateHeaderCount] = {"Date"};
const size_t kJsonBufferSize = 1024;
const uint32_t kMinCycleIntervalSec = 60UL;
const uint32_t kMaxCycleIntervalSec = 86400UL;
#ifdef LED_ENABLED
const uint8_t kLedShowDelayMs = 10;
#endif

WebServer webServer;
DeviceState deviceState = {0, 0};
DoubleResetGuard doubleResetGuard(10000);
bool manualWateringRequested = false;
bool webServerEnabled = false;
uint64_t sleepIntervalMicros = SLEEP_TIMEOUT;
uint32_t cycleIntervalMs = DEFAULT_WAKEUP_INTERVAL_SEC * 1000UL;
#ifdef SLEEP_DISABLED
uint32_t lastCycleMs = 0;
#endif

#define USE_SERIAL Serial
#define LOGF(tag, fmt, ...) USE_SERIAL.printf("[" tag "] " fmt "\n", ##__VA_ARGS__)

#ifdef LED_ENABLED

#ifndef LED_PIN
#define LED_PIN 5
#endif

#ifndef LED_COUNT
#define LED_COUNT 24
#endif

#ifndef LED_R
#define LED_R 255
#endif

#ifndef LED_G
#define LED_G 180
#endif

#ifndef LED_B
#define LED_B 100
#endif

CRGB leds[LED_COUNT];

#endif // LED_ENABLED

#ifndef SLEEP_DISABLED
Timer sleepingTimer(WEB_SERVER_AWAKE_MS, []() {
    doubleResetGuard.disarm();
    delay(1000);
    LOGF("SLEEP", "intervalMicros=%llu", sleepIntervalMicros);
    ESP.deepSleep(sleepIntervalMicros);
    ESP.restart();
});
#endif

struct TelemetryPayload
{
    bool ready = false;
    bool watered = false;
    bool lightingOn = false;
    uint16_t wateringDurationSec = 0;
    String timestampUtc;
};

struct RemoteScheduleConfig
{
    bool enabled = false;
    int32_t timezoneOffsetSec = 0;
    uint32_t wakeupIntervalSec = DEFAULT_WAKEUP_INTERVAL_SEC;
    uint16_t wateringDurationSec = 0;
    uint32_t wateringTimes[kMaxWateringSlots] = {0};
    size_t wateringTimesCount = 0;
    bool lightingEnabled = false;
    uint16_t lightingDurationSec = 0;
    uint32_t lightingTimes[kMaxLightingSlots] = {0};
    size_t lightingTimesCount = 0;
};

struct CycleResult
{
    TelemetryPayload telemetry;
    uint32_t nextIntervalSec = DEFAULT_WAKEUP_INTERVAL_SEC;
};

bool connectToConfiguredWifi(bool logConnect);
void maybeStartMdns();

uint32_t clampIntervalSec(uint32_t intervalSec)
{
    uint32_t candidateSec = intervalSec == 0 ? DEFAULT_WAKEUP_INTERVAL_SEC : intervalSec;
    uint32_t clampedSec = candidateSec;

    if (clampedSec < kMinCycleIntervalSec)
    {
        clampedSec = kMinCycleIntervalSec;
    }

    if (clampedSec > kMaxCycleIntervalSec)
    {
        clampedSec = kMaxCycleIntervalSec;
    }

    if (clampedSec != candidateSec)
    {
        LOGF(
            "SCHEDULE",
            "clamped wakeupIntervalSec from %lu to %lu",
            static_cast<unsigned long>(candidateSec),
            static_cast<unsigned long>(clampedSec));
    }

    return clampedSec;
}

void applyIntervalSec(uint32_t intervalSec)
{
    uint32_t safeIntervalSec = clampIntervalSec(intervalSec);
    sleepIntervalMicros = static_cast<uint64_t>(safeIntervalSec) * 1000000ULL;
    cycleIntervalMs = safeIntervalSec * 1000UL;
}

int normaliseHumidityValue(int rawData)
{
    double value = rawData;
    value = value * HUMIDITY_K + HUMIDITY_V0;
    return static_cast<int>(value);
}

void performWatering(uint16_t durationSec)
{
    if (durationSec == 0)
    {
        LOGF("WATER", "skipped because duration=0");
        return;
    }

    LOGF("WATER", "start durationSec=%u", durationSec);
    digitalWrite(PUMP_PIN, PUMP_ON);
    delay(1000UL * durationSec);
    digitalWrite(PUMP_PIN, PUMP_OFF);
    LOGF("WATER", "done");
}

#ifdef LED_ENABLED
void ledSetup()
{
    FastLED.addLeds<WS2812B, LED_PIN, GRB>(leds, LED_COUNT);
    FastLED.clear(true);
    LOGF("LIGHT", "configured pin=%d count=%d rgb=(%d,%d,%d)", LED_PIN, LED_COUNT, LED_R, LED_G, LED_B);
}

void setLeds(bool on)
{
    fill_solid(leds, LED_COUNT, on ? CRGB(LED_R, LED_G, LED_B) : CRGB::Black);
    FastLED.show();
    FastLED.delay(kLedShowDelayMs);
    LOGF("LIGHT", "state=%s", on ? "on" : "off");
}
#else
void ledSetup() {}
void setLeds(bool on) { (void)on; }
#endif // LED_ENABLED

void readDeviceState()
{
    digitalWrite(PUMP_PIN, PUMP_OFF);

    digitalWrite(POWER_PIN, POWER_SENSOR_ON);
    delay(1000);
    deviceState.powerValue = analogRead(A0);
    digitalWrite(POWER_PIN, POWER_SENSOR_OFF);

    digitalWrite(HUMIDITY_PIN, HUMIDITY_SENSOR_ON);
    delay(1000);
    deviceState.humidityValue = normaliseHumidityValue(analogRead(A0));
    digitalWrite(HUMIDITY_PIN, HUMIDITY_SENSOR_OFF);

    LOGF("STATE", "batteryRaw=%d soilMoisture=%d", deviceState.powerValue, deviceState.humidityValue);
}

void wateringSetup()
{
    pinMode(PUMP_PIN, OUTPUT);
    pinMode(POWER_PIN, OUTPUT);
    pinMode(HUMIDITY_PIN, OUTPUT);
    digitalWrite(PUMP_PIN, PUMP_OFF);
    digitalWrite(POWER_PIN, POWER_SENSOR_OFF);
    digitalWrite(HUMIDITY_PIN, HUMIDITY_SENSOR_OFF);
}

bool connectToConfiguredWifi(bool logConnect)
{
#ifdef WIFI_NAME
    if (logConnect)
    {
        LOGF("WIFI", "connecting to %s", WIFI_NAME);
    }

    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_NAME, WIFI_PASSWORD);
    while (WiFi.status() != WL_CONNECTED)
    {
        delay(500);
        USE_SERIAL.print(".");
    }
    USE_SERIAL.println();
    LOGF("WIFI", "connected ip=%s", WiFi.localIP().toString().c_str());
    return true;
#else
    (void)logConnect;
    LOGF("WIFI", "WIFI_NAME/WIFI_PASSWORD not defined");
    return false;
#endif
}

bool ensureWifiConnected()
{
    if (WiFi.status() == WL_CONNECTED)
    {
        return true;
    }

    LOGF("WIFI", "disconnected, attempting reconnect");
    return connectToConfiguredWifi(false);
}

void wifiSetup()
{
    LOGF("BOOT", "starting device");
    connectToConfiguredWifi(true);
}

void maybeStartMdns()
{
    if (MDNS.begin("esp8266"))
    {
        LOGF("WEB", "mDNS responder started");
    }
}

void configureCommonWebServerCallbacks()
{
    webServer.setOnClickWatering([]() {
        manualWateringRequested = true;
    });
    webServer.setOnMainPageLoad([]() {
        return deviceState;
    });
}

#ifndef SLEEP_DISABLED
void startTemporaryWebServer()
{
    LOGF("BOOT", "double reset detected, starting temporary web server");
    maybeStartMdns();

    webServerEnabled = true;
    configureCommonWebServerCallbacks();
    webServer.setOnMainPageLoad([]() {
        sleepingTimer.restart();
        return deviceState;
    });
    webServer.setOnKeepAlive([]() {
        sleepingTimer.restart();
    });
    webServer.setup();
    sleepingTimer.setMilliseconds(WEB_SERVER_AWAKE_MS);
    sleepingTimer.start();
}
#endif

#ifdef SLEEP_DISABLED
void startAlwaysOnWebServer()
{
    LOGF("WEB", "starting always-on web server");
    maybeStartMdns();

    webServerEnabled = true;
    configureCommonWebServerCallbacks();
    webServer.setup();
}
#endif

bool parseWateringTimes(JsonArray &times, RemoteScheduleConfig &config)
{
    config.wateringTimesCount = 0;

    for (JsonArray::iterator it = times.begin(); it != times.end() && config.wateringTimesCount < kMaxWateringSlots; ++it)
    {
        const char *timeText = it->as<const char *>();
        if (timeText == NULL)
        {
            continue;
        }

        uint32_t slotSecondOfDay = 0;
        if (parseTimeOfDay(timeText, &slotSecondOfDay))
        {
            config.wateringTimes[config.wateringTimesCount] = slotSecondOfDay;
            LOGF("CONFIG", "slot[%u]=%s", static_cast<unsigned>(config.wateringTimesCount), timeText);
            config.wateringTimesCount += 1;
        }
        else
        {
            LOGF("CONFIG", "ignored invalid slot=%s", timeText);
        }
    }

    return config.wateringTimesCount > 0;
}

bool parseLightingTimes(JsonArray &times, RemoteScheduleConfig &config)
{
    config.lightingTimesCount = 0;

    for (JsonArray::iterator it = times.begin(); it != times.end() && config.lightingTimesCount < kMaxLightingSlots; ++it)
    {
        const char *timeText = it->as<const char *>();
        if (timeText == NULL)
        {
            continue;
        }

        uint32_t slotSecondOfDay = 0;
        if (parseTimeOfDay(timeText, &slotSecondOfDay))
        {
            config.lightingTimes[config.lightingTimesCount] = slotSecondOfDay;
            LOGF("CONFIG", "lightingSlot[%u]=%s", static_cast<unsigned>(config.lightingTimesCount), timeText);
            config.lightingTimesCount += 1;
        }
        else
        {
            LOGF("CONFIG", "ignored invalid lighting slot=%s", timeText);
        }
    }

    return config.lightingTimesCount > 0;
}

bool parseRemoteConfigJson(const String &payload, RemoteScheduleConfig &config)
{
    StaticJsonBuffer<kJsonBufferSize> jsonBuffer;
    JsonObject &root = jsonBuffer.parseObject(payload);
    if (!root.success())
    {
        LOGF("CONFIG", "json parse failed");
        return false;
    }

    config.enabled = root.containsKey("enabled") ? root["enabled"].as<bool>() : false;
    config.timezoneOffsetSec = root.containsKey("timezoneOffsetSec") ? root["timezoneOffsetSec"].as<long>() : 0;
    config.wakeupIntervalSec = root.containsKey("wakeupIntervalSec") ? root["wakeupIntervalSec"].as<unsigned long>() : DEFAULT_WAKEUP_INTERVAL_SEC;
    config.wateringDurationSec = root.containsKey("wateringDurationSec") ? root["wateringDurationSec"].as<unsigned int>() : 0;
    config.lightingEnabled = root.containsKey("lightingEnabled") ? root["lightingEnabled"].as<bool>() : false;
    config.lightingDurationSec = root.containsKey("lightingDurationSec") ? root["lightingDurationSec"].as<unsigned int>() : 0;

    if (root.containsKey("wateringTimes"))
    {
        JsonArray &times = root["wateringTimes"].as<JsonArray &>();
        if (!parseWateringTimes(times, config))
        {
            LOGF("CONFIG", "no valid watering times");
        }
    }
    else
    {
        LOGF("CONFIG", "wateringTimes missing");
    }

    if (root.containsKey("lightingTimes"))
    {
        JsonArray &lightingTimes = root["lightingTimes"].as<JsonArray &>();
        if (!parseLightingTimes(lightingTimes, config))
        {
            LOGF("CONFIG", "no valid lighting times");
        }
    }

    LOGF(
        "CONFIG",
        "enabled=%s timezoneOffsetSec=%ld wakeupIntervalSec=%lu wateringDurationSec=%u slots=%u lightingEnabled=%s lightingDurationSec=%u lightingSlots=%u",
        config.enabled ? "true" : "false",
        static_cast<long>(config.timezoneOffsetSec),
        static_cast<unsigned long>(config.wakeupIntervalSec),
        config.wateringDurationSec,
        static_cast<unsigned>(config.wateringTimesCount),
        config.lightingEnabled ? "true" : "false",
        config.lightingDurationSec,
        static_cast<unsigned>(config.lightingTimesCount));

    // Return true as long as JSON is valid — wakeupIntervalSec must always be applied
    // even if no schedules are configured yet.
    return true;
}

bool fetchRemoteSchedule(RemoteScheduleConfig &config, ParsedHttpDate &dateHeader)
{
    HTTPClient http;
    std::unique_ptr<BearSSL::WiFiClientSecure> client(new BearSSL::WiFiClientSecure);
    client->setInsecure();
    http.collectHeaders(kCollectedHeaders, kDateHeaderCount);

    http.setTimeout(3000);
    LOGF("HTTP", "requesting %s", REMOTE_CONFIG_URL);
    if (!http.begin(*client, REMOTE_CONFIG_URL))
    {
        LOGF("HTTP", "begin failed");
        return false;
    }

    int httpCode = http.GET();
    if (httpCode <= 0)
    {
        LOGF("HTTP", "request failed error=%s", http.errorToString(httpCode).c_str());
        http.end();
        return false;
    }

    LOGF("HTTP", "status=%d", httpCode);
    if (httpCode != HTTP_CODE_OK)
    {
        http.end();
        return false;
    }

    String dateHeaderText = http.header("Date");
    LOGF("TIME", "dateHeader=%s", dateHeaderText.c_str());
    if (!parseHttpDateHeader(dateHeaderText.c_str(), &dateHeader))
    {
        LOGF("TIME", "failed to parse Date header");
        http.end();
        return false;
    }

    String payload = http.getString();
    bool parsed = parseRemoteConfigJson(payload, config);
    http.end();
    return parsed;
}

void postTelemetry(const TelemetryPayload &telemetry)
{
#ifdef TELEMETRY_URL
    if (!telemetry.ready)
    {
        LOGF("TELEMETRY", "payload not ready, skipping");
        return;
    }

    HTTPClient http;
    std::unique_ptr<BearSSL::WiFiClientSecure> client(new BearSSL::WiFiClientSecure);
    client->setInsecure();

    if (!http.begin(*client, TELEMETRY_URL))
    {
        LOGF("TELEMETRY", "begin failed");
        return;
    }

    http.addHeader("Content-Type", "application/json");

    StaticJsonBuffer<512> jsonBuffer;
    JsonObject &root = jsonBuffer.createObject();
    root["deviceKey"] = DEVICE_KEY;
    root["humidity"] = deviceState.humidityValue;
    root["battery"] = deviceState.powerValue;
    root["watered"] = telemetry.watered;
    root["lightingOn"] = telemetry.lightingOn;
    root["wateringDurationSec"] = static_cast<int>(telemetry.wateringDurationSec);
    root["timestampUtc"] = telemetry.timestampUtc;
#ifdef FIRMWARE_VERSION
    root["firmwareVersion"] = FIRMWARE_VERSION;
#endif

    String body;
    root.printTo(body);

    LOGF("TELEMETRY", "posting to %s payload=%s", TELEMETRY_URL, body.c_str());
    int httpCode = http.POST(body);
    LOGF("TELEMETRY", "status=%d", httpCode);
    http.end();
#else
    (void)telemetry;
    LOGF("TELEMETRY", "disabled (TELEMETRY_URL not defined)");
#endif
}

#if WORK_OFFLINE
void runLegacyOfflineCycle()
{
    LOGF("LEGACY", "offline cycle enabled");
    readDeviceState();
    performWatering(MANUAL_WATERING_DURATION_SEC);
}
#endif

#if LEGACY_SERVER_POST_ENABLED
void runLegacyServerControlledCycle()
{
    LOGF("LEGACY", "server-controlled cycle is still disabled in MVP");
}
#endif

CycleResult runScheduleCycle()
{
    CycleResult result;

    readDeviceState();
    applyIntervalSec(DEFAULT_WAKEUP_INTERVAL_SEC);
    result.nextIntervalSec = clampIntervalSec(DEFAULT_WAKEUP_INTERVAL_SEC);

    if (!ensureWifiConnected())
    {
        LOGF("SCHEDULE", "wifi unavailable, using fallback wakeupIntervalSec=%u", DEFAULT_WAKEUP_INTERVAL_SEC);
        return result;
    }

    RemoteScheduleConfig config;
    ParsedHttpDate dateHeader = {};
    if (!fetchRemoteSchedule(config, dateHeader))
    {
        LOGF("SCHEDULE", "using fallback wakeupIntervalSec=%u", DEFAULT_WAKEUP_INTERVAL_SEC);
        return result;
    }

    // Build UTC timestamp string from parsed header for telemetry.
    char tsBuf[32] = {0};
    snprintf(tsBuf, sizeof(tsBuf), "%04d-%02d-%02dT%02d:%02d:%02dZ",
             dateHeader.year, dateHeader.month, dateHeader.day,
             dateHeader.hour, dateHeader.minute, dateHeader.second);
    result.telemetry.timestampUtc = String(tsBuf);
    result.telemetry.ready = true;

    result.nextIntervalSec = clampIntervalSec(config.wakeupIntervalSec);
    applyIntervalSec(result.nextIntervalSec);
    uint32_t currentLocalSecondOfDay = 0;
    if (!localSecondOfDay(&dateHeader, config.timezoneOffsetSec, &currentLocalSecondOfDay))
    {
        LOGF("TIME", "failed to compute local second-of-day");
        return result;
    }

    LOGF("TIME", "localSecondOfDay=%lu", static_cast<unsigned long>(currentLocalSecondOfDay));

    ScheduleDecision decision = decideWatering(
        config.enabled,
        currentLocalSecondOfDay,
        config.wateringTimes,
        config.wateringTimesCount,
        config.wakeupIntervalSec,
        config.wateringDurationSec);

    if (decision.shouldWater)
    {
        LOGF("SCHEDULE", "due slotIndex=%d", decision.matchedSlotIndex);
        performWatering(decision.durationSec);
        result.telemetry.watered = true;
        result.telemetry.wateringDurationSec = decision.durationSec;
    }
    else
    {
        LOGF("SCHEDULE", "no slot due in current wake window");
    }

    LightingDecision lightingDecision = decideLighting(
        config.lightingEnabled,
        currentLocalSecondOfDay,
        config.lightingTimes,
        config.lightingTimesCount,
        config.lightingDurationSec);
    setLeds(lightingDecision.lightsOn);
    result.telemetry.lightingOn = lightingDecision.lightsOn;

    return result;
}
} // namespace

void WateringDevice::setup()
{
    USE_SERIAL.begin(115200);
    USE_SERIAL.println();
    USE_SERIAL.println();
    USE_SERIAL.println();

    wateringSetup();
    ledSetup();
    doubleResetGuard.begin();
    applyIntervalSec(DEFAULT_WAKEUP_INTERVAL_SEC);

#ifdef SLEEP_DISABLED
    LOGF("BOOT", "mode=always-on");
#else
    LOGF("BOOT", "mode=sleepy");
#endif

    wifiSetup();

#ifndef SLEEP_DISABLED
    if (doubleResetGuard.detected())
    {
        startTemporaryWebServer();
        return;
    }
#else
    startAlwaysOnWebServer();
    lastCycleMs = millis() - cycleIntervalMs;
    return;
#endif

#if WORK_OFFLINE
    runLegacyOfflineCycle();
    postTelemetry(TelemetryPayload{});
#elif LEGACY_SERVER_POST_ENABLED
    runLegacyServerControlledCycle();
    postTelemetry(TelemetryPayload{});
#else
    {
        CycleResult cycleResult = runScheduleCycle();
        postTelemetry(cycleResult.telemetry);
    }
#endif

    doubleResetGuard.disarm();
    delay(1000);
    LOGF("SLEEP", "intervalMicros=%llu", sleepIntervalMicros);
    ESP.deepSleep(sleepIntervalMicros);
    ESP.restart();
}

void WateringDevice::loop()
{
#ifdef SLEEP_DISABLED
    if (manualWateringRequested)
    {
        manualWateringRequested = false;
        performWatering(MANUAL_WATERING_DURATION_SEC);
    }

    if (millis() - lastCycleMs >= cycleIntervalMs)
    {
#if WORK_OFFLINE
        runLegacyOfflineCycle();
        postTelemetry(TelemetryPayload{});
#elif LEGACY_SERVER_POST_ENABLED
        runLegacyServerControlledCycle();
        postTelemetry(TelemetryPayload{});
#else
        CycleResult cycleResult = runScheduleCycle();
        postTelemetry(cycleResult.telemetry);
#endif
        lastCycleMs = millis();
    }

    if (webServerEnabled)
    {
        webServer.loop();
        MDNS.update();
    }
    return;
#else
    if (!webServerEnabled)
    {
        return;
    }

    if (manualWateringRequested)
    {
        manualWateringRequested = false;
        sleepingTimer.cancel();
        performWatering(MANUAL_WATERING_DURATION_SEC);
        sleepingTimer.start();
    }

    doubleResetGuard.loop();
    webServer.loop();
    MDNS.update();
    sleepingTimer.loop();
#endif
}
