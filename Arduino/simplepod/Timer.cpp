#include "Timer.h"
#include <Arduino.h>

#define USE_SERIAL Serial

Timer::Timer(long value, void (*callback)()) {
    this->onTimerCallback = callback;
    this->milliseconds = value;
}

Timer::Timer(void (*callback)()) {
    this->onTimerCallback = callback;
}

void Timer::setMilliseconds(long value) {
    this->milliseconds = value;
}

void Timer::cancel() {
    this->triggerValue = 0;
}

void Timer::start() {
    USE_SERIAL.printf("start timer for %ld milliseconds\n", this->milliseconds);
    this->triggerValue = millis() + this->milliseconds;
    USE_SERIAL.printf("trigger value %ld\n", this->triggerValue);
}

void Timer::restart() {
    this->start();
}

void Timer::loop() {
    if (this->triggerValue != 0 && this->triggerValue < millis()) {
        this->triggerValue == 0;
        USE_SERIAL.printf("trigger value %ld, current time %ld\n", this->triggerValue, millis());
        this->onTimerCallback();
    }
}