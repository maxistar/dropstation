#include "WateringDevice.h"
#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <ArduinoJson.h>

#include <ESP8266mDNS.h>
#include <StreamString.h>

#include <NTPClient.h>

#include "config.h"

#include "WebServer.h"
#include "Timer.h"

#include "DeviceState.h"

#include "DoubleResetGuard.h"

// struct {
//     char mySSID[MAX_STRING_LENGTH] = "";
//     char myPW[MAX_STRING_LENGTH] = "";
// } settings;

WebServer webServer;

uint64_t interval = SLEEP_TIMEOUT;
#define USE_SERIAL Serial

DoubleResetGuard drg(10000); // таймаут 10 секунд

Timer sleepingTimer(60000, []()
    {
      drg.disarm();
      delay(1000);
      USE_SERIAL.printf("sleep for: %llu\n", interval);
      ESP.deepSleep(interval);
      ESP.restart(); 
    }
);

#define JSON_BUFFER_SIZE 500

DeviceState deviceState = {0, 0};
int t = 0;
long int jsonInterval = 0;
bool watering = false;

const long utcOffsetInSeconds = 7200;

char daysOfTheWeek[7][12] = {"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"};
// Define NTP Client to get time
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", utcOffsetInSeconds);

int normaliseHumidityValue(int rawData)
{
    double value = rawData;
    value = value * HUMIDITY_K + HUMIDITY_V0;
    return (int)value;
}

int normaliseVoltageValue(int rawData)
{
    double value = rawData;
    value = value * VOLTAGE_K + VOLTAGE_V0;
    return (int)value;
}

void wifiSetup()
{
    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_NAME, WIFI_PASSWORD);
    Serial.println("");
    // Wait for connection
    while (WiFi.status() != WL_CONNECTED)
    {
        delay(500);
        Serial.print(".");
    }
    Serial.println("");
    Serial.print("Connected to ");
    Serial.println(WIFI_NAME);
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
    // WiFi.mode(WIFI_ON);

    if (MDNS.begin("esp8266"))
    {
        Serial.println("MDNS responder started");
    }

    timeClient.begin();
}

void wateringSetup()
{
    pinMode(PUMP_PIN, OUTPUT);
    pinMode(POWER_PIN, OUTPUT);
    pinMode(HUMIDITY_PIN, OUTPUT);
    digitalWrite(PUMP_PIN, PUMP_OFF); // turn the LED on (HIGH is the voltage level)
    digitalWrite(POWER_PIN, POWER_SENSOR_OFF);
    digitalWrite(HUMIDITY_PIN, HUMIDITY_SENSOR_OFF);
}

void wateringLoop()
{

    digitalWrite(PUMP_PIN, PUMP_OFF);

    USE_SERIAL.print("read power");
    digitalWrite(POWER_PIN, POWER_SENSOR_ON);
    delay(1000);
    deviceState.powerValue = analogRead(A0);
    int powerValuePercent = normaliseVoltageValue(deviceState.powerValue);
    digitalWrite(POWER_PIN, POWER_SENSOR_OFF);

    USE_SERIAL.print("read humidity");
    digitalWrite(HUMIDITY_PIN, HUMIDITY_SENSOR_ON);
    delay(1000);
    deviceState.humidityValue = normaliseHumidityValue(analogRead(A0));
    digitalWrite(HUMIDITY_PIN, HUMIDITY_SENSOR_OFF);

    String postString = String(
                            "{\"nextCall\":") +
                        String((int)(SLEEP_TIMEOUT / 1000000)) +
                        String(", \"battery\": ") + String(deviceState.powerValue) +
                        String(", \"batteryNorm\": ") + String(powerValuePercent) +
                        String(", \"humidity\": ") + String(deviceState.humidityValue) +
                        String("}");

    if (WORK_OFFLINE)
    {
        t = 10;
        USE_SERIAL.printf("watering for %d seconds\n", t);
        digitalWrite(PUMP_PIN, PUMP_ON);
        Serial.print("pump stared\n");
        delay(1000 * t);
        digitalWrite(PUMP_PIN, PUMP_OFF);
        Serial.print("pump stopped\n");
        Serial.print(postString);

        return;
    }

    // send state to server
    StaticJsonBuffer<JSON_BUFFER_SIZE> jsonBuffer;

    USE_SERIAL.printf("loop");

    HTTPClient http;
    WiFiClient client;

    USE_SERIAL.print("[HTTP] begin...\n");
    // configure traged server and url
    // http.begin("https://192.168.1.12/test.html", "7a 9c f4 db 40 d3 62 5a 6e 21 bc 5c cc 66 c8 3e a1 45 59 38"); //HTTPS
    http.begin(client, SERVER_ADDRESS); // HTTP

    USE_SERIAL.print("[HTTP] GET...\n");
    http.addHeader("Content-Type", "application/json");
    // start connection and send HTTP header
    // int httpCode = http.GET();
    int httpCode = http.POST(postString);

    // httpCode will be negative on error
    if (httpCode > 0)
    {
        // HTTP header has been send and Server response header has been handled
        USE_SERIAL.printf("[HTTP] GET... code: %d\n", httpCode);

        // file found at server
        if (httpCode == HTTP_CODE_OK)
        {
            String payload = http.getString();
            USE_SERIAL.println(payload);

            JsonObject &root = jsonBuffer.parseObject(payload);

            if (root.success())
            {
                Serial.println("parseObject() succeed");
                root.printTo(Serial);
                Serial.println("size:");
                Serial.println(root.size());

                t = root["watering"];
                jsonInterval = root["interval"];
                interval = jsonInterval;
                interval = interval * 1000000;
            }
            else
            {
                Serial.println("parseObject() failed");
            }

            if (t > 0)
            {
                USE_SERIAL.printf("watering for %d seconds\n", t);
                digitalWrite(PUMP_PIN, PUMP_ON);
                Serial.print("pump stared\n");
                delay(1000 * t);
                digitalWrite(PUMP_PIN, PUMP_OFF);
                Serial.print("pump stopped\n");
            }
        }
    }
    else
    {
        USE_SERIAL.printf("[HTTP] GET... failed, error: %s\n", http.errorToString(httpCode).c_str());
    }

    http.end();
}

void WateringDevice::setup()
{
    // Serial.begin(115200);
    USE_SERIAL.begin(115200);
    // USE_SERIAL.setDebugOutput(true);
    USE_SERIAL.println();
    USE_SERIAL.println();
    USE_SERIAL.println();

    drg.begin();

    wifiSetup();

    if (drg.detected())
    {
        Serial.println("Double reset detected, starting config web server...");
        webServer.setup();

        webServer.setOnClickWatering([]()
            { 
                watering = true; 
            }
        );

        webServer.setOnMainPageLoad([]()
            {
                sleepingTimer.restart();
                return deviceState; 
            }
        );

        // Keepalive endpoint extends awake time while the UI is open.
        webServer.setOnKeepAlive([]()
            { 
                sleepingTimer.restart(); 
            }
        );
    }
    else
    {
        Serial.println("Normal boot, regular work mode");
        // обычный режим: синхронизация времени, работа, подготовка к sleep
        // syncTimeFromNtp();
    }

    wateringSetup();
    sleepingTimer.start();

    timeClient.update();

    Serial.print(daysOfTheWeek[timeClient.getDay()]);
    Serial.print(", ");
    Serial.print(timeClient.getHours());
    Serial.print(":");
    Serial.print(timeClient.getMinutes());
    Serial.print(":");
    Serial.println(timeClient.getSeconds());
    Serial.print("  ");
    Serial.println(timeClient.getEpochTime());
}

void WateringDevice::loop()
{
    if (watering)
    {
        USE_SERIAL.printf("start watering\n");
        sleepingTimer.cancel();
        wateringLoop();
        watering = false;
        sleepingTimer.start();
    }
    drg.loop();
    webServer.loop();
    MDNS.update();
    sleepingTimer.loop();
}
