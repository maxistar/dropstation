/**
 * Esp8266_Polyvalka.ino
 *
 *  Created on: 24.05.2015
 *
 */


#include "WateringDevice.h"

WateringDevice wateringDevice;

void setup()
{
    wateringDevice.setup();
}



void loop()
{
    wateringDevice.loop();
}
