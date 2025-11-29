# Multi-stage build for Dashboard Service

# Stage 1: build with Maven
FROM maven:3.9-eclipse-temurin-17-alpine AS build
WORKDIR /workspace

# Copy the root parent POM plus the dashboard module so the existing
# relativePath (../../../../pom.xml) continues to resolve inside the container.
COPY pom.xml ./pom.xml
COPY apps/dashboard/backend/dashboard-service ./apps/dashboard/backend/dashboard-service

# Move into the module directory before running Maven commands so we only build
# the dashboard-service (mirrors local dev workflow).
WORKDIR /workspace/apps/dashboard/backend/dashboard-service

# Pre-fetch dependencies for offline builds
RUN mvn -B dependency:go-offline

# Build the dashboard-service jar
RUN mvn -B clean package -DskipTests

# Stage 2: runtime image
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

COPY --from=build /workspace/apps/dashboard/backend/dashboard-service/target/dashboard-service-*.jar app.jar

EXPOSE 9410

ENTRYPOINT ["java","-jar","app.jar"]
