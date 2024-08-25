#ifndef WEBSERVER_H
#define WEBSERVER_H

#include <Arduino.h>

class WebServer {
private:
    void (*onMainPageLoad)() = NULL;
    void (*onClickWatering)() = NULL;
    void handleWatering();
    void handleStatus();
    void handleRoot();
public:
    void setup();
    void loop();
    void setOnMainPageLoad(void (*)());
    void setOnClickWatering(void (*)());
};

#endif // WEBSERVER_H