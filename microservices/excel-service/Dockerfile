# Build stage
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy parent POM
COPY pom.xml .

# Copy all module POMs (Maven needs to see all modules referenced in parent POM)
COPY api-gateway/pom.xml api-gateway/
COPY user-service/pom.xml user-service/
COPY drive-service/pom.xml drive-service/
COPY mail-service/pom.xml mail-service/
COPY chat-service/pom.xml chat-service/
COPY notify-service/pom.xml notify-service/
COPY excel-service/pom.xml excel-service/
COPY slides-service/pom.xml slides-service/
COPY common/pom.xml common/

# Copy source code only for modules we need to build
COPY common/src common/src
COPY excel-service/src excel-service/src

RUN mvn clean package -pl excel-service -am -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=build /app/excel-service/target/*.jar app.jar

EXPOSE 8087

HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8087/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
