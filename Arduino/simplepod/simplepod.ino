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


void hexToAddress(uint8_t *address, const char *hex)
{
    uint8_t result = 0;
    int i,j;
    for (j=0;j<8;j++) {
      result = 0;
      for (i=0;i<2;i++)
      {
        if (*hex > 47 && *hex < 58)
          result += (*hex - 48);
        else if (*hex > 64 && *hex < 71)
          result += (*hex - 55);
        else if (*hex > 96 && *hex < 103)
          result += (*hex - 87);

        if (i == 0) {
          result <<= 4;
        }
        hex++;
      }
      address[j] = result;
    }
}

void setup() {
    pinMode(PUMP_PIN, OUTPUT);
    digitalWrite(PUMP_PIN, PUMP_OFF);   // turn the LED on (HIGH is the voltage level)


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
    WiFiMulti.addAP(WIFI_NAME, WIFI_PASSWORD);
}

void loop() {
    digitalWrite(PUMP_PIN, PUMP_OFF);

    bool ok = false;
    StaticJsonBuffer<JSON_BUFFER_SIZE> jsonBuffer;

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
        // start connection and send HTTP header
        int httpCode = http.GET();

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
                    for (JsonObject::iterator it=root.begin(); it!=root.end(); ++it)
                    {
                      Serial.println("address:");
                      Serial.println(it->key);
                      
                      Serial.println("value:");
                      int t = it->value.as<int>();
                      Serial.println(t);

                      if (t>0) {
                         digitalWrite(PUMP_PIN, PUMP_ON);
                         Serial.print("pump stared\n");
                         delay(1000*t);
                         digitalWrite(PUMP_PIN, PUMP_OFF);
                         Serial.print("pump stopped\n");
                      }
                    }
                } else {
                  Serial.println("parseObject() failed");
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
    delay(10000);
}

