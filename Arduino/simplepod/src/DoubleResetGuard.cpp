#include <EEPROM.h>
#include <Arduino.h>

// Настройки EEPROM
static const size_t EEPROM_SIZE = 64;   // Хватает с запасом
static const uint32_t DR_MAGIC   = 0xCAFEBABE; // Любое уникальное число

struct DoubleResetState {
  uint32_t magic;
  uint8_t  flag;      // 0 = нет попытки, 1 = устройство "вооружено"
  uint8_t  reserved[3]; // чтобы выровнять размер, можно не использовать
};

class DoubleResetGuard {
public:
  // timeoutMs — за сколько миллисекунд считаем, что "двойной ресет" не произошел
  // eepromOffset — с какого адреса в EEPROM хранить структуру
  DoubleResetGuard(uint32_t timeoutMs = 10000, int eepromOffset = 0)
    : _timeoutMs(timeoutMs), _offset(eepromOffset) {}

  void begin() {
    _startMs = millis();
    _cleared = false;
    _detected = false;

    EEPROM.begin(EEPROM_SIZE);

    DoubleResetState st;
    EEPROM.get(_offset, st);

    // Проверяем, был ли установлен флаг на предыдущем запуске
    if (st.magic == DR_MAGIC && st.flag == 1) {
      // Предыдущий запуск не успел снять флаг => имеем "двойной ресет"
      _detected = true;
    }

    // Армируем сторож для текущего запуска
    st.magic = DR_MAGIC;
    st.flag  = 1;
    EEPROM.put(_offset, st);
    EEPROM.commit();
  }

  // true, если на ЭТОМ запуске обнаружен двойной ресет
  bool detected() const {
    return _detected;
  }

  // Вызывать часто в loop(). После timeoutMs сбрасывает флаг.
  void loop() {
    if (_cleared) return;
    if (millis() - _startMs >= _timeoutMs) {
      clearFlag();
    }
  }

  // Явное разоружение сторожа, например перед deepSleep()
  void disarm() {
    if (!_cleared) {
      clearFlag();
    }
  }

private:
  void clearFlag() {
    DoubleResetState st;
    EEPROM.get(_offset, st);

    st.magic = DR_MAGIC;
    st.flag  = 0;

    EEPROM.put(_offset, st);
    EEPROM.commit();

    _cleared = true;
  }

  uint32_t _timeoutMs;
  uint32_t _startMs = 0;
  int _offset;

  bool _detected = false;
  bool _cleared  = false;
};
