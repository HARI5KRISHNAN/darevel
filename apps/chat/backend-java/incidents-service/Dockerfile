FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY common ./common
COPY auth-service ./auth-service
COPY chat-service ./chat-service
COPY permissions-service ./permissions-service
COPY kubernetes-service ./kubernetes-service
COPY alerts-service ./alerts-service
COPY incidents-service ./incidents-service
RUN mvn clean package -DskipTests -pl incidents-service -am

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/incidents-service/target/*.jar app.jar
EXPOSE 8086
ENTRYPOINT ["java", "-jar", "app.jar"]
