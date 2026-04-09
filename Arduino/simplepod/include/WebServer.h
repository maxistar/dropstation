#ifndef WEBSERVER_H
#define WEBSERVER_H

#include <Arduino.h>
#include "DeviceState.h"

class WebServer {
private:
    DeviceState (*onMainPageLoad)() = NULL;
    void (*onClickWatering)() = NULL;
    void (*onKeepAlive)() = NULL;
    void handleWatering();
    void handleStatus();
    void handleRoot();
    void handleKeepAlive();
public:
    void setup();
    void loop();
    void setOnMainPageLoad(DeviceState (*)());
    void setOnClickWatering(void (*)());
    void setOnKeepAlive(void (*)());
};

#endif // WEBSERVER_H
