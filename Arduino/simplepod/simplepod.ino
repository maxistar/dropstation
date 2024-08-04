/**
 * Esp8266_Polyvalka.ino
 *
 *  Created on: 24.05.2015
 *
 */

#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <ArduinoJson.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>
#include <StreamString.h>
#include "controller01.h"

#define USE_SERIAL Serial
#define JSON_BUFFER_SIZE 500

int powerValue = 0;    // value read from the pot
int humidityValue = 0; // value read from the pot
int t = 0;
uint64_t interval = SLEEP_TIMEOUT;
long int jsonInterval = 0;
bool watering = false;

ESP8266WebServer server(80);

void handleRoot()
{
    int sec = millis() / 1000;
    int min = sec / 60;
    int hr = min / 60;

    StreamString temp;
    temp.reserve(500); // Preallocate a large chunk to avoid memory fragmentation
    temp.printf("\
<html>\
  <head>\
    <meta http-equiv='refresh' content='5'/>\
    <title>ESP8266 Demo</title>\
    <style>\
      body { background-color: #cccccc; font-family: Arial, Helvetica, Sans-Serif; Color: #000088; }\
    </style>\
  </head>\
  <body>\
    <h1>Hello from ESP8266!</h1>\
    <p>Uptime: %02d:%02d:%02d</p>\
    <img src=\"/test.svg\" />\
    <a href\"/water\">water</a>\
  </body>\
</html>",
                hr, min % 60, sec % 60);
    server.send(200, "text/html", temp.c_str());
}

void handleWatering()
{
    watering = true;
}

void handleNotFound()
{
    String message = "File Not Found\n\n";
    message += "URI: ";
    message += server.uri();
    message += "\nMethod: ";
    message += (server.method() == HTTP_GET) ? "GET" : "POST";
    message += "\nArguments: ";
    message += server.args();
    message += "\n";

    for (uint8_t i = 0; i < server.args(); i++)
    {
        message += " " + server.argName(i) + ": " + server.arg(i) + "\n";
    }

    server.send(404, "text/plain", message);
}

void drawGraph()
{
    String out;
    out.reserve(2600);
    char temp[70];
    out += "<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" width=\"400\" height=\"150\">\n";
    out += "<rect width=\"400\" height=\"150\" fill=\"rgb(250, 230, 210)\" stroke-width=\"1\" stroke=\"rgb(0, 0, 0)\" />\n";
    out += "<g stroke=\"black\">\n";
    int y = rand() % 130;
    for (int x = 10; x < 390; x += 10)
    {
        int y2 = rand() % 130;
        sprintf(temp, "<line x1=\"%d\" y1=\"%d\" x2=\"%d\" y2=\"%d\" stroke-width=\"1\" />\n", x, 140 - y, x + 10, 140 - y2);
        out += temp;
        y = y2;
    }
    out += "</g>\n</svg>\n";

    server.send(200, "image/svg+xml", out);
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
}

void webServerSetup()
{
    if (MDNS.begin("esp8266"))
    {
        Serial.println("MDNS responder started");
    }

    server.on("/", handleRoot);
    server.on("/test.svg", drawGraph);
    server.on("/water", handleWatering);
    server.on("/inline", []()
              { server.send(200, "text/plain", "this works as well"); });
    server.onNotFound(handleNotFound);
    server.begin();
    Serial.println("HTTP server started");
}

void wateringSetup()
{
    pinMode(PUMP_PIN, OUTPUT);
    pinMode(POWER_PIN, OUTPUT);
    pinMode(HUMIDITY_PIN, OUTPUT);
    digitalWrite(PUMP_PIN, PUMP_OFF); // turn the LED on (HIGH is the voltage level)
    digitalWrite(POWER_PIN, LOW);
    digitalWrite(HUMIDITY_PIN, LOW);
}

void setup()
{
    // Serial.begin(115200);
    USE_SERIAL.begin(115200);
    // USE_SERIAL.setDebugOutput(true);
    USE_SERIAL.println();
    USE_SERIAL.println();
    USE_SERIAL.println();
    wifiSetup();
    wateringSetup();
    webServerSetup();
}

void wateringLoop()
{
    digitalWrite(PUMP_PIN, PUMP_OFF);

    USE_SERIAL.print("read power");
    digitalWrite(POWER_PIN, HIGH);
    delay(1000);
    powerValue = analogRead(A0);
    digitalWrite(POWER_PIN, LOW);

    USE_SERIAL.print("read humidity");
    digitalWrite(HUMIDITY_PIN, HIGH);
    delay(1000);
    humidityValue = analogRead(A0);
    digitalWrite(HUMIDITY_PIN, LOW);

    bool ok = false;
    StaticJsonBuffer<JSON_BUFFER_SIZE> jsonBuffer;

    USE_SERIAL.printf("loop");

    HTTPClient http;
    WiFiClient client;
    int i;

    USE_SERIAL.print("[HTTP] begin...\n");
    // configure traged server and url
    // http.begin("https://192.168.1.12/test.html", "7a 9c f4 db 40 d3 62 5a 6e 21 bc 5c cc 66 c8 3e a1 45 59 38"); //HTTPS
    http.begin(client, SERVER_ADDRESS); // HTTP

    USE_SERIAL.print("[HTTP] GET...\n");
    http.addHeader("Content-Type", "application/json");
    // start connection and send HTTP header
    // int httpCode = http.GET();
    int httpCode = http.POST(
        String(
            "{\"nextCall\":") +
        String((int)(SLEEP_TIMEOUT / 1000000)) + String(", \"battery\": ") + String(powerValue) + String(", \"humidity\": ") + String(humidityValue) + String("}"));

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

    // digitalWrite(LED_PIN, LED_OFF);   // turn the LED on (HIGH is the voltage level)

    // WiFi.mode(WIFI_OFF);
    digitalWrite(PUMP_PIN, PUMP_OFF);
    digitalWrite(POWER_PIN, LOW);
    digitalWrite(HUMIDITY_PIN, LOW);
    //goSleeping();
}

void goSleeping() {
    delay(1000);
    USE_SERIAL.printf("sleep for: %llu\n", interval);
    ESP.deepSleep(interval);
    ESP.restart();
}

void webServerLoop()
{
    server.handleClient();
    MDNS.update();
}

void loop()
{
    if (watering) {
      wateringLoop();
      watering = false;
    }
    webServerLoop();
}
