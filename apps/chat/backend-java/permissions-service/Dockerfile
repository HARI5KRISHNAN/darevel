FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

# Copy parent pom first
COPY ../pom.xml ./parent-pom.xml
COPY ../common ./common
COPY . .

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
