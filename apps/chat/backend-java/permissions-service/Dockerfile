FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

# Copy parent pom and all modules (Maven needs to see all modules)
COPY pom.xml .
COPY common ./common
COPY auth-service ./auth-service
COPY chat-service ./chat-service
COPY permissions-service ./permissions-service

# Build the application
RUN mvn clean package -DskipTests -pl permissions-service -am

FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Install Ansible
RUN apk add --no-cache ansible openssh-client

# Copy the built JAR
COPY --from=build /app/permissions-service/target/*.jar app.jar

# Expose port
EXPOSE 8083

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
