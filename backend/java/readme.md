# Simple Java Backend

## TODO

- [x] setup simple structure
- [x] run simple project
- [x] run simple project in docker
- [ ] connect simple project to database



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
