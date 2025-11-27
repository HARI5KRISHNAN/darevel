FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

# Copy parent pom and all modules
COPY pom.xml .
COPY common ./common
COPY auth-service ./auth-service
COPY chat-service ./chat-service
COPY permissions-service ./permissions-service
COPY kubernetes-service ./kubernetes-service
COPY alerts-service ./alerts-service
COPY incidents-service ./incidents-service
COPY ai-service ./ai-service
COPY email-service ./email-service

# Build the application
RUN mvn clean package -DskipTests -pl email-service -am

FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy the built JAR
COPY --from=build /app/email-service/target/*.jar app.jar

# Expose port
EXPOSE 8088

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
