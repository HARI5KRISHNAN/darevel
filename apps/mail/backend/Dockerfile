FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

# Copy entire project (parent pom + mail backend)
COPY pom.xml .
COPY apps/mail/backend/pom.xml ./apps/mail/backend/pom.xml
COPY apps/mail/backend/src ./apps/mail/backend/src

# Build the mail backend using the parent POM structure
RUN mvn -f apps/mail/backend/pom.xml clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy the JAR from build stage
COPY --from=build /app/apps/mail/backend/target/darevel-mail-backend-1.0.0.jar app.jar

# Expose port
EXPOSE 8083

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
