# Communication protocol

## Request

- server address
- http://dropstation.ztools.org/api/v2/watering/?device=sometoken

- better and more secure option use header
- http://dropstation.ztools.org/api/v2/pool
- DEVICETOKEN=xxxxxxx

````json
{
  "nextCall": 3600,
  "battery": 1111,
  "batteryNorm": 111,
  "humidity": 111,
  "lastEventNum": 345,
  "lastScheduleId": 1
}

````

## Response

````json
{
  "interval": 1000,
  "nextEventIn": 10000,
  "events": [
    {
    "eventId": 123,
    "scheduleId": 1,
    "eventType": "watering",
    "duration": 100
    }
  ]
}
````


