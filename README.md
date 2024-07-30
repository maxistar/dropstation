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


[See more about this project(in russian)](http://maxistar.ru/projects/diy/watering/)


## Test Backend

```shell
curl -X POST -H "Content-Type: application/json" -d '{"nextCall":123, "battery":123, "humidity": 1234}' "http://192.168.0.40:1880/watering/controller04"

```


## Node Red

