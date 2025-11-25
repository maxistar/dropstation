#ifndef TIMER_H
#define TIMER_H

#include <Arduino.h>

class Timer {
private:
  long milliseconds = 0;

  void (*onTimerCallback)() = NULL;

  long triggerValue = 0;


public:
  Timer(long, void (*)());
  Timer(void (*)());
  void setMilliseconds(long);
  void start();
  void cancel();
  void restart();
  void loop();  
};



#endif // TIMER_H