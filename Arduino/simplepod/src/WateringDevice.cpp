#include "WateringDevice.h"

#include <Arduino.h>
#include <ESP8266HTTPClient.h>
#include <ESP8266WiFi.h>
#include <ESP8266mDNS.h>
#include <WiFiClient.h>
#include <WiFiClientSecureBearSSL.h>
#include <ArduinoJson.h>
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
const size_t kDateHeaderCount = 1;
const char *kCollectedHeaders[kDateHeaderCount] = {"Date"};
const size_t kJsonBufferSize = 1024;

WebServer webServer;
DeviceState deviceState = {0, 0};
DoubleResetGuard doubleResetGuard(10000);
bool manualWateringRequested = false;
bool webServerEnabled = false;
uint64_t sleepIntervalMicros = SLEEP_TIMEOUT;

#define USE_SERIAL Serial
#define LOGF(tag, fmt, ...) USE_SERIAL.printf("[" tag "] " fmt "\n", ##__VA_ARGS__)

Timer sleepingTimer(WEB_SERVER_AWAKE_MS, []() {
    doubleResetGuard.disarm();
    delay(1000);
    LOGF("SLEEP", "intervalMicros=%llu", sleepIntervalMicros);
    ESP.deepSleep(sleepIntervalMicros);
    ESP.restart();
});

struct RemoteScheduleConfig
{
    bool enabled = false;
    int32_t timezoneOffsetSec = 0;
    uint32_t wakeupIntervalSec = DEFAULT_WAKEUP_INTERVAL_SEC;
    uint16_t wateringDurationSec = 0;
    uint32_t wateringTimes[kMaxWateringSlots] = {0};
    size_t wateringTimesCount = 0;
};

void applySleepIntervalSec(uint32_t intervalSec)
{
    uint32_t safeIntervalSec = intervalSec == 0 ? DEFAULT_WAKEUP_INTERVAL_SEC : intervalSec;
    sleepIntervalMicros = static_cast<uint64_t>(safeIntervalSec) * 1000000ULL;
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

void wifiSetup()
{
    LOGF("BOOT", "starting device");
    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_NAME, WIFI_PASSWORD);
    LOGF("WIFI", "connecting to %s", WIFI_NAME);
    while (WiFi.status() != WL_CONNECTED)
    {
        delay(500);
        USE_SERIAL.print(".");
    }
    USE_SERIAL.println();
    LOGF("WIFI", "connected ip=%s", WiFi.localIP().toString().c_str());
}

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

    if (!root.containsKey("wateringTimes"))
    {
        LOGF("CONFIG", "wateringTimes missing");
        return false;
    }

    JsonArray &times = root["wateringTimes"].as<JsonArray &>();
    if (!parseWateringTimes(times, config))
    {
        LOGF("CONFIG", "no valid watering times");
        return false;
    }

    LOGF(
        "CONFIG",
        "enabled=%s timezoneOffsetSec=%ld wakeupIntervalSec=%lu wateringDurationSec=%u slots=%u",
        config.enabled ? "true" : "false",
        static_cast<long>(config.timezoneOffsetSec),
        static_cast<unsigned long>(config.wakeupIntervalSec),
        config.wateringDurationSec,
        static_cast<unsigned>(config.wateringTimesCount));

    return true;
}

bool fetchRemoteSchedule(RemoteScheduleConfig &config, ParsedHttpDate &dateHeader)
{
    HTTPClient http;
    std::unique_ptr<BearSSL::WiFiClientSecure> client(new BearSSL::WiFiClientSecure);
    client->setInsecure();
    http.collectHeaders(kCollectedHeaders, kDateHeaderCount);

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

void runRemoteScheduleCycle()
{
    readDeviceState();
    applySleepIntervalSec(DEFAULT_WAKEUP_INTERVAL_SEC);

    RemoteScheduleConfig config;
    ParsedHttpDate dateHeader = {};
    if (!fetchRemoteSchedule(config, dateHeader))
    {
        LOGF("SLEEP", "using fallback wakeupIntervalSec=%u", DEFAULT_WAKEUP_INTERVAL_SEC);
        return;
    }

    applySleepIntervalSec(config.wakeupIntervalSec);
    if (!config.enabled)
    {
        LOGF("SCHEDULE", "disabled by remote config");
        return;
    }

    uint32_t currentLocalSecondOfDay = 0;
    if (!localSecondOfDay(&dateHeader, config.timezoneOffsetSec, &currentLocalSecondOfDay))
    {
        LOGF("TIME", "failed to compute local second-of-day");
        return;
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
    }
    else
    {
        LOGF("SCHEDULE", "no slot due in current wake window");
    }
}
} // namespace

void WateringDevice::setup()
{
    USE_SERIAL.begin(115200);
    USE_SERIAL.println();
    USE_SERIAL.println();
    USE_SERIAL.println();

    wateringSetup();
    doubleResetGuard.begin();
    wifiSetup();

    if (doubleResetGuard.detected())
    {
        LOGF("BOOT", "double reset detected, starting temporary web server");
        if (MDNS.begin("esp8266"))
        {
            LOGF("WEB", "mDNS responder started");
        }

        webServerEnabled = true;
        webServer.setup();
        webServer.setOnClickWatering([]() {
            manualWateringRequested = true;
        });
        webServer.setOnMainPageLoad([]() {
            sleepingTimer.restart();
            return deviceState;
        });
        webServer.setOnKeepAlive([]() {
            sleepingTimer.restart();
        });
        sleepingTimer.setMilliseconds(WEB_SERVER_AWAKE_MS);
        sleepingTimer.start();
        return;
    }

#if WORK_OFFLINE
    runLegacyOfflineCycle();
#elif LEGACY_SERVER_POST_ENABLED
    runLegacyServerControlledCycle();
#else
    runRemoteScheduleCycle();
#endif

    doubleResetGuard.disarm();
    delay(1000);
    LOGF("SLEEP", "intervalMicros=%llu", sleepIntervalMicros);
    ESP.deepSleep(sleepIntervalMicros);
    ESP.restart();
}

void WateringDevice::loop()
{
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
}
