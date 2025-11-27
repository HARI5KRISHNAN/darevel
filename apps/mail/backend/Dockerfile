FROM maven:3.9.4-eclipse-temurin-17 AS build
WORKDIR /workspace

# Copy the Spring Boot project (mail-service) and build it
COPY mail-service ./mail-service
RUN mvn -f mail-service/pom.xml -DskipTests package

FROM eclipse-temurin:17-jre
WORKDIR /app

# Copy the built jar from the builder stage
COPY --from=build /workspace/mail-service/target/*.jar app.jar

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
