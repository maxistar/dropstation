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


[See more about this project(in russian)](http://maxistar.ru/projects/diy/watering/)