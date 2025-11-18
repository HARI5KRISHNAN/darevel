FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

# Copy entire project (parent pom + chat backend)
COPY pom.xml .
COPY apps/chat/backend/pom.xml ./apps/chat/backend/pom.xml
COPY apps/chat/backend/src ./apps/chat/backend/src

# Build the chat backend using the parent POM structure
RUN mvn -f apps/chat/backend/pom.xml clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy the JAR from build stage
COPY --from=build /app/apps/chat/backend/target/darevel-chat-backend-1.0.0.jar app.jar

# Expose port
EXPOSE 8081

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
