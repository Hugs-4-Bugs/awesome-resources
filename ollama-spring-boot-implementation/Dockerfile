# Use an official OpenJDK runtime as a parent image
FROM openjdk:17-jdk-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the compiled JAR file into the container
COPY target/ollama-spring-boot-implementation-0.0.1-SNAPSHOT.jar app.jar

# Expose the port the app runs on
EXPOSE 8180

# Command to run the application
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
