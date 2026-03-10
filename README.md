# Dropstation

Automatic watering of indoor plants.

How to install

## Backend

Backend is a PHP application that is requested by a smart device in order to decide whether it is time for watering.

- Create a MySQL database.
- Create config.
- Create a virtual host for the PHP website.

## Running PHP Backend in Docker

start containers:
`docker-compose up`

create database dropstation and setup users: 
localhost:8080

## MySQL 8 Local Bootstrap

The Docker database runtime now targets MySQL 8.
The local PHP runtime is pinned to PHP 7.4 to match the production server.

Start the local services:

```bash
docker compose up -d db web phpmyadmin
```

Bootstrap the database with the repository dump, the MySQL 8 compatibility step, and the follow-up schema changes:

```bash
bash scripts/bootstrap-mysql8.sh
```

The bootstrap script applies:

- `backend/inc/sql/dump231001.sql`
- `backend/inc/sql/mysql8_compat.sql`
- `backend/inc/sql/20250802_add_more_fields.sql`
- `backend/inc/sql/20260307_align_openapi_schema.sql`

## Validating Watering Endpoints on MySQL 8

Run endpoint checks from inside the PHP container:

```bash
docker exec php7_dropstation php -r "echo file_get_contents('http://localhost/api/v1/watering/?device=1a382ff4-5099-4be1-9e48-71eb7c36db27');"
docker exec php7_dropstation php -r "echo file_get_contents('http://localhost/api/v2/watering/?device=1a382ff4-5099-4be1-9e48-71eb7c36db27');"
docker exec php7_dropstation php -r "echo file_get_contents('http://localhost/api/v3/watering/?device=1a382ff4-5099-4be1-9e48-71eb7c36db27');"
```

The aligned schema adds canonical persistence for:

- `plants`
- `tanks`
- `tank_devices`
- `events_canonical`
- `commands`

Legacy PHP runtime compatibility is preserved by keeping the existing operational tables in place and backfilling canonical structures alongside them.

See [legacy-to-canonical-schema-mapping.md](docs/legacy-to-canonical-schema-mapping.md) for the mapping rules and migration assumptions.

Install dependencies

`https://github.com/maxistar/etherra-core.git`

`cd .. && composer install`


Access the device in a browser: http://localhost/api/v2/watering/?device=1a382ff4-5099-4be1-9e48-71eb7c36db27

access device in browser: http://localhost/api/v1/watering/?device=1a382ff4-5099-4be1-9e48-71eb7c36db27

access device in browser: http://localhost/api/v2/watering/?device=1a382ff4-5099-4be1-9e48-71eb7c36db27

access v3 with curl:


### Database access

- there is phpMyAdmin running on port 8080

## Creating user in MySQL Database

```
CREATE USER 'polivalka'@'localhost' IDENTIFIED BY "strongpassword";
grant all privileges on dropstation.* to 'polivalka'@'localhost';

CREATE USER 'polivalka2'@'172.22.0.1' IDENTIFIED BY "strongpassword";
grant all privileges on dropstation.* to 'polivalka2'@'172.22.0.1';
```

## Restore Dump

- create database in localhost:8080
  - call it dropstation / utf8_general_ci
  - restore dump


[See more about this project (in Russian)](http://maxistar.ru/projects/diy/watering/)


## Test Backend

```shell
curl -X POST -H "Content-Type: application/json" -d '{"nextCall":123, "battery":123, "humidity": 1234}' "http://192.168.0.40:1880/watering/controller04"

```

## Dropstation CI Quality Gates

The Dropstation quality-gate pipeline is defined at:

- `.github/workflows/dropstation-quality-gates.yml`

It runs lint and tests for both independently deployable subprojects:

- `backend-ts`
- `nuxt-crud-app`

Run the same checks locally:

```bash
cd backend-ts
npm run lint
npm run test:ci

cd ../nuxt-crud-app
yarn lint
yarn test:ci
```


## Node Red

## Svelte

```
cd client-side
yarn
cd src/client
yarn
yarn build
cd ../../
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
- Vout - measured in resistor divider
- Vmeasure = Vout * k
- k = Vmeasure / Vout 
- example:
  - Vout = 340
  - Vmeasure = 3400
  - k = 10


### Transform HTML to C++ Strings

```shell
cd client-side
yarn build
```

### WebServer Mode

- works 1 minute showing a web interface
- web interface shows all basic parameters of the device and allows triggering watering
- after one minute the device goes to sleep for 1 hour
- sleep timeout can be deactivated by reloading the page

### Roadmap

- mobile applications
-  - iOS application
-  - Android application
- server-side application
- web service
- hardware
  - develop PCB
  - create several variants of device



- testing strategies
  - cover firmware with unit tests
  - cover firmware with interactive tests
  - cover server side with unit tests
  - figure out end2end tests
