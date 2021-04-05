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
#include <ArduinoJson.h>
#include <OneWire.h>
#include "controller04.h"

#define USE_SERIAL Serial
#define JSON_BUFFER_SIZE 500

ESP8266WiFiMulti WiFiMulti;
//85D2B872C00310B1
uint8_t address[8] = {0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0};


//13 - old led pin


#define DS2413_FAMILY_ID    0x85
#define DS2413_ACCESS_READ  0xF5
#define DS2413_ACCESS_WRITE 0x5A
#define DS2413_ACK_SUCCESS  0xAA
#define DS2413_ACK_ERROR    0xFF

OneWire oneWire(DS2413_ONEWIRE_PIN);

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

bool write1Wire(uint8_t state)
{
  uint8_t ack = 0;
  
  /* Top six bits must '1' */
  state |= 0xFC;
  
  oneWire.reset();
  oneWire.select(address);
  oneWire.write(DS2413_ACCESS_WRITE);
  oneWire.write(state);
  oneWire.write(~state);                    /* Invert data and resend     */    
  ack = oneWire.read();                     /* 0xAA=success, 0xFF=failure */  
  if (ack == DS2413_ACK_SUCCESS)
  {
    oneWire.read();                          /* Read the status byte      */
  }
  oneWire.reset();
    
  return (ack == DS2413_ACK_SUCCESS ? true : false);
}

void setup() {
    pinMode(LED_PIN, OUTPUT);
    digitalWrite(LED_PIN, LED_ON);   // turn the LED on (HIGH is the voltage level)


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
    digitalWrite(LED_PIN, LED_ON);   // turn the LED on (HIGH is the voltage level)

    bool ok = false;
    StaticJsonBuffer<JSON_BUFFER_SIZE> jsonBuffer;
    USE_SERIAL.printf("loop");
    // wait for WiFi connection
    //WiFi.mode(WIFI_STA);

    if((WiFiMulti.run() == WL_CONNECTED)) {

        HTTPClient http;
        int i;

        USE_SERIAL.print("[HTTP] begin...\n");
        // configure traged server and url
        //http.begin("https://192.168.1.12/test.html", "7a 9c f4 db 40 d3 62 5a 6e 21 bc 5c cc 66 c8 3e a1 45 59 38"); //HTTPS
        http.begin(SERVER_ADDRESS); //HTTP

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
                      Serial.println("key:");
                      Serial.println(it->key);
                      hexToAddress(address, it->key);
                      Serial.print("\nNEW ROM =");
                      for( i = 0; i < 8; i++) {
                        Serial.write(' ');
                        Serial.print(address[i], HEX);
                      }
                      
                      Serial.println("value:");
                      int t = it->value.as<int>();
                      Serial.println(t);

                      if (t>0) {
                         ok = write1Wire(0x1);
                         if (!ok) Serial.print("Wire failed\n");
                         delay(1000*t);
                         ok = write1Wire(0x3);
                         if (!ok) Serial.print("Wire failed\n");
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
    digitalWrite(LED_PIN, LED_OFF);   // turn the LED on (HIGH is the voltage level)

    //WiFi.mode(WIFI_OFF);
    delay(10000);
}

