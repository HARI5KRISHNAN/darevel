# syntax=docker/dockerfile:1.7

FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /workspace
COPY pom.xml ./pom.xml
COPY apps ./apps
RUN mvn -pl apps/search/backend/search-service -am dependency:go-offline
RUN mvn -pl apps/search/backend/search-service -am -DskipTests clean package

FROM eclipse-temurin:17-jre
ENV APP_HOME=/app
WORKDIR ${APP_HOME}
COPY --from=build /workspace/apps/search/backend/search-service/target/search-service-*.jar app.jar
EXPOSE 8095
ENTRYPOINT ["java","-jar","/app/app.jar"]
