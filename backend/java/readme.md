# Simple Java Backend

## TODO

- setup simple structure
- run simple project
- run simple project in docker
- connect simple project to database



## How to start



start localy:

```shell
mvn spring-boot:run
```

start in docker:

```shell
mvn clean package
docker build -t dropstation .
docker run -p 8080:8080 dropstation
```
