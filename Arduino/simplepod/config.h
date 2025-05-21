/**
 * controller 01 config file
 * 
 * the on that on Ilushuas Room
 */
 
#define WIFI_PASSWORD "MaxMax256"
#define WIFI_NAME "maxhome"
// #define SERVER_ADDRESS "http://192.168.0.40:1880/watering/controller04"

#define SERVER_ADDRESS "http://192.168.0.40:1880/watering/controller/voltagecalibration"

// if we want working offline
#define WORK_OFFLINE true

#define PUMP_PIN 12
#define POWER_PIN 13
#define HUMIDITY_PIN 14

#define PUMP_ON HIGH
#define PUMP_OFF LOW

#define POWER_SENSOR_ON LOW
#define POWER_SENSOR_OFF HIGH

#define HUMIDITY_SENSOR_ON LOW
#define HUMIDITY_SENSOR_OFF HIGH


#define SLEEP_TIMEOUT 3600e6

#define HUMIDITY_K -1.1628
#define HUMIDITY_V0 147.674

#define VOLTAGE_K 3.8462
#define VOLTAGE_V0 -1192.3077
