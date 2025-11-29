FROM maven:3.9-eclipse-temurin-21-alpine AS build

WORKDIR /app

# Copy parent pom first
COPY ../pom.xml ./parent-pom.xml

# Copy service pom and source
COPY pom.xml .
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests -f pom.xml

FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copy jar from build stage
COPY --from=build /app/target/*.jar app.jar

# Expose port
EXPOSE 8110

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8110/actuator/health || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
