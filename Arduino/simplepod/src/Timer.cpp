#include "Timer.h"
#include <Arduino.h>

#define USE_SERIAL Serial

/**
 * Simple one-shot timer: set a duration, start it to capture the current
 * millis() + duration, and run the provided callback once when loop() sees
 * the current time has passed the trigger. cancel() clears the pending trigger.
 */
// Construct with an initial delay and callback to fire when elapsed.
Timer::Timer(long value, void (*callback)()) {
    this->onTimerCallback = callback;
    this->milliseconds = value;
}

// Construct with only a callback; delay can be set later.
Timer::Timer(void (*callback)()) {
    this->onTimerCallback = callback;
}

// Update the timer delay in milliseconds.
void Timer::setMilliseconds(long value) {
    this->milliseconds = value;
}

// Stop any pending trigger from executing.
void Timer::cancel() {
    this->triggerValue = 0;
}

// Start timing from the current millis() using the configured delay.
void Timer::start() {
    USE_SERIAL.printf("start timer for %ld milliseconds\n", this->milliseconds);
    this->triggerValue = millis() + this->milliseconds;
    USE_SERIAL.printf("trigger value %ld\n", this->triggerValue);
}

// Restart the timer without changing the delay.
void Timer::restart() {
    this->start();
}

// Check if the timer has elapsed and invoke the callback once.
void Timer::loop() {
    if (this->triggerValue != 0 && static_cast<unsigned long>(this->triggerValue) < millis()) {
        this->triggerValue = 0;
        USE_SERIAL.printf("trigger value %ld, current time %ld\n", this->triggerValue, millis());
        this->onTimerCallback();
    }
}
