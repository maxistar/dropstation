# Dropstation

Automatic watering of indoor plants.

How to install

## Backend

Backend is a php application that is being requested bay smart device in order to make a decision if it is the time for watering.

- Create mysql database.
- Create config
- Create virtual host for php website

## Running in Docker

`docker-compose up`

localhost:8080

install dependencies

`https://github.com/maxistar/etherra-core.git`

`cd .. && compose install`

access device in browser: http://localhost/api/v2/watering/?device=1a382ff4-5099-4be1-9e48-71eb7c36db27


### Database access

- there is phpmyadmin running on port 8080

## Creating user in MySQL Database

CREATE USER 'polivalka'@'localhost' IDENTIFIED BY "strongpassword";
grant all privileges on dropstation.* to 'polivalka'@'localhost';

CREATE USER 'polivalka2'@'172.22.0.1' IDENTIFIED BY "strongpassword";
grant all privileges on dropstation.* to 'polivalka2'@'172.22.0.1';


[See more about this project(in russian)](http://maxistar.ru/projects/diy/watering/)


## Test Backend

```shell
curl -X POST -H "Content-Type: application/json" -d '{"nextCall":123, "battery":123, "humidity": 1234}' "http://192.168.0.40:1880/watering/controller04"

```


## Node Red

## Svelte

```
cd client-side
npx tsc
node dist/server/index.js
```

## Sensor calibration

### Humidity Calibration

Measure value:

- 100% - sensor in water
- 0% - dry sensor

k * Vx + V0 = Y

k = 100  / (Vx1 - Vx0)
V0 = 100 * Vx0 / (Vx0 - Vx1)


### Voltage sensor calibration

curl -X POST -H "Content-Type: application/json" -d '{"nextCall":123, "battery":123, "humidity": 1234}' "http://192.168.0.40:1880/watering/controller/voltagecalibration"


table is in voltagecalibration.txt

- Vmeasure - measured with voltmeter
- Vout - measured in resistor devider
- Vmeasure = Vout * k
- k = Vmeasure / Vout 
- example:
  - Vout = 340
  - Vmeasure = 3400
  - k = 10


### Transform HTML to C++ Strings


### WebServer Mode

- works 1 minute showing a web interface
- web interface shows all basic parameters of the device and allows trigger watering
- after one minute device goes slipping to 1 hour
- sleep timeout can be deactivated by reloading the page