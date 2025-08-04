# Simple Java Backend

## TODO

- [x] setup simple structure
- [x] run simple project
- [x] run simple project in docker
- [ ] connect simple project to database
- [ ] use grable insted of maven - I like gradle more
- [ ] create docker compose with mysql backend
- [ ] create simple grud api endpoints



## How to start



start locally:

```shell
mvn spring-boot:run
```

start in docker:

```shell
mvn clean package
docker build -t dropstation .
docker run -p 8080:8080 dropstation
```


