# Base image
FROM openjdk:17

# Add a non-root user for security
RUN useradd -ms /bin/sh myuser

# Set the user to the non-root user
USER myuser

# Set the working directory
WORKDIR /app

# Copy the JAR file into the container
COPY build/libs/popupstore-0.0.1-SNAPSHOT.jar /app/popupstore.jar

# Copy the application.properties file into the container
COPY src/main/resources/application.properties /app/config/application.properties

# Expose the port the app runs on
EXPOSE 8080

# Run the JAR file with external configuration
ENTRYPOINT ["java", "-Dspring.config.location=file:/app/config/application.properties", "-jar", "/app/popupstore.jar"]