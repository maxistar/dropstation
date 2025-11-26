#include "DoubleResetGuard.h"
#include <EEPROM.h>

// Настройки EEPROM
static const size_t EEPROM_SIZE = 64;        // Хватает с запасом
static const uint32_t DR_MAGIC = 0xCAFEBABE; // Любое уникальное число

struct DoubleResetState
{
  uint32_t magic;
  uint8_t flag;        // 0 = нет попытки, 1 = устройство "вооружено"
  uint8_t reserved[3]; // чтобы выровнять размер, можно не использовать
};

DoubleResetGuard::DoubleResetGuard(uint32_t timeoutMs, int eepromOffset)
    : _timeoutMs(timeoutMs), _offset(eepromOffset) {}

void DoubleResetGuard::begin()
{
  _startMs = millis();
  _cleared = false;
  _detected = false;

  EEPROM.begin(EEPROM_SIZE);

  DoubleResetState st;
  EEPROM.get(_offset, st);

  // Проверяем, был ли установлен флаг на предыдущем запуске
  if (st.magic == DR_MAGIC && st.flag == 1)
  {
    // Предыдущий запуск не успел снять флаг => имеем "двойной ресет"
    _detected = true;
  }

  // Армируем сторож для текущего запуска
  st.magic = DR_MAGIC;
  st.flag = 1;
  EEPROM.put(_offset, st);
  EEPROM.commit();
}

bool DoubleResetGuard::detected() const
{
  return _detected;
}

void DoubleResetGuard::loop()
{
  if (_cleared)
    return;
  if (millis() - _startMs >= _timeoutMs)
  {
    clearFlag();
  }
}

void DoubleResetGuard::disarm()
{
  if (!_cleared)
  {
    clearFlag();
  }
}

void DoubleResetGuard::clearFlag()
{
  DoubleResetState st;
  EEPROM.get(_offset, st);

  st.magic = DR_MAGIC;
  st.flag = 0;

  EEPROM.put(_offset, st);
  EEPROM.commit();

  _cleared = true;
}
