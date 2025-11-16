FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

# Copy parent pom and all modules (Maven needs to see all modules)
COPY pom.xml .
COPY common ./common
COPY auth-service ./auth-service
COPY chat-service ./chat-service
COPY permissions-service ./permissions-service

# Build the application
RUN mvn clean package -DskipTests -pl chat-service -am

FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy the built JAR
COPY --from=build /app/chat-service/target/*.jar app.jar

# Expose port
EXPOSE 8082

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
