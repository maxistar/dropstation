#pragma once

#include <Arduino.h>

class DoubleResetGuard {
public:
  // timeoutMs — window for detecting a double reset; eepromOffset — where to store state
  DoubleResetGuard(uint32_t timeoutMs = 10000, int eepromOffset = 0);

  void begin();
  bool detected() const;
  void loop();
  void disarm();

private:
  void clearFlag();

  uint32_t _timeoutMs;
  uint32_t _startMs = 0;
  int _offset;

  bool _detected = false;
  bool _cleared  = false;
};
