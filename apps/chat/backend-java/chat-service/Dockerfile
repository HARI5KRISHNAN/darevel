FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

# Copy parent pom first
COPY ../pom.xml ./parent-pom.xml
COPY ../common ./common
COPY . .

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
