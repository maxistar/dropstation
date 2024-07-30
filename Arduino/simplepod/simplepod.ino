/**
 * Esp8266_Polyvalka.ino
 *
 *  Created on: 24.05.2015
 *
 */

#include <Arduino.h>

#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <ArduinoJson.h>
#include "controller01.h"

#define USE_SERIAL Serial
#define JSON_BUFFER_SIZE 500

ESP8266WiFiMulti WiFiMulti;

int powerValue = 0;  // value read from the pot
int humidityValue = 0;  // value read from the pot
int t = 0;
uint64_t interval = SLEEP_TIMEOUT;
long int jsonInterval = 0;

void setup() {
    pinMode(PUMP_PIN, OUTPUT);
    pinMode(POWER_PIN, OUTPUT);
    pinMode(HUMIDITY_PIN, OUTPUT);
    digitalWrite(PUMP_PIN, PUMP_OFF);   // turn the LED on (HIGH is the voltage level)
    digitalWrite(POWER_PIN, LOW);
    digitalWrite(HUMIDITY_PIN, LOW);

    USE_SERIAL.begin(115200);
   // USE_SERIAL.setDebugOutput(true);

    USE_SERIAL.println();
    USE_SERIAL.println();
    USE_SERIAL.println();
    delay(10000);
    for(uint8_t t = 4; t > 0; t--) {
        USE_SERIAL.printf("[SETUP] WAIT %d...\n", t);
        USE_SERIAL.flush();
        delay(1000);
    }
    // WiFi.mode(WIFI_ON);
    WiFiMulti.addAP(WIFI_NAME, WIFI_PASSWORD);
}

void loop() {
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
    StaticJsonBuffer < JSON_BUFFER_SIZE> jsonBuffer;

    USE_SERIAL.printf("loop");

    if((WiFiMulti.run() == WL_CONNECTED)) {

        HTTPClient http;
        WiFiClient client;
        int i;

        USE_SERIAL.print("[HTTP] begin...\n");
        // configure traged server and url
        //http.begin("https://192.168.1.12/test.html", "7a 9c f4 db 40 d3 62 5a 6e 21 bc 5c cc 66 c8 3e a1 45 59 38"); //HTTPS
        http.begin(client, SERVER_ADDRESS); //HTTP

        USE_SERIAL.print("[HTTP] GET...\n");
        http.addHeader("Content-Type", "application/json");
        // start connection and send HTTP header
        // int httpCode = http.GET();
        int httpCode = http.POST(
            String(
              "{\"nextCall\":") 
              + String((int) (SLEEP_TIMEOUT / 1000000)) 
              + String(", \"battery\": ") 
              + String(powerValue)
              + String(", \"humidity\": ")
              + String(humidityValue)
              + String("}")
          );

        // httpCode will be negative on error
        if(httpCode > 0) {
            // HTTP header has been send and Server response header has been handled
            USE_SERIAL.printf("[HTTP] GET... code: %d\n", httpCode);

            // file found at server
            if(httpCode == HTTP_CODE_OK) {
                String payload = http.getString();
                USE_SERIAL.println(payload);

                JsonObject& root = jsonBuffer.parseObject(payload);

                if (root.success()) {
                    Serial.println("parseObject() succeed");
                    root.printTo(Serial);
                    Serial.println("size:");
                    Serial.println(root.size());
                    
                    t = root["watering"];
                    jsonInterval = root["interval"];
                    interval = jsonInterval;
                    interval = interval * 1000000;
                    
                } else {
                  Serial.println("parseObject() failed");
                }

                if (t > 0) {
                    USE_SERIAL.printf("watering for %d seconds\n", t);
                    digitalWrite(PUMP_PIN, PUMP_ON);
                    Serial.print("pump stared\n");
                    delay(1000 * t);
                    digitalWrite(PUMP_PIN, PUMP_OFF);
                    Serial.print("pump stopped\n");
                }
            }
        } else {
            USE_SERIAL.printf("[HTTP] GET... failed, error: %s\n", http.errorToString(httpCode).c_str());
        }

        http.end();
    } else {
      USE_SERIAL.printf("can not connect\n");
    }
    //digitalWrite(LED_PIN, LED_OFF);   // turn the LED on (HIGH is the voltage level)

    //WiFi.mode(WIFI_OFF);
    digitalWrite(PUMP_PIN, PUMP_OFF);
    digitalWrite(POWER_PIN, LOW);
    digitalWrite(HUMIDITY_PIN, LOW);
    delay(1000);
    USE_SERIAL.printf("sleep for: %llu\n", interval);
    ESP.deepSleep(interval); 
    //ESP.restart();
}

