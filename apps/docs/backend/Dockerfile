# Multi-stage build for Docs Service

# Stage 1: Build with Maven
FROM maven:3.9-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy source code and build
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy jar from build stage
COPY --from=build /app/target/docs-service.jar app.jar

# Expose port
EXPOSE 8087

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
