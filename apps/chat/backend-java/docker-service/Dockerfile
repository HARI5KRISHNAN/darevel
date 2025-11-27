FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /workspace

# Copy only the docker-service project files
COPY docker-service/pom.xml ./pom.xml
COPY docker-service/src ./src

RUN mvn -f pom.xml clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

COPY --from=build /workspace/target/*.jar app.jar

EXPOSE 8089

ENTRYPOINT ["java", "-jar", "app.jar"]
