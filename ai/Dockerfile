# Use the official Python image from the Docker Hub
FROM python:3.9-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install build dependencies and Supervisor
RUN apt-get update && apt-get install -y \
    build-essential \
    pkg-config \
    libhdf5-dev \
    supervisor \
    && apt-get clean

# Set the working directory
WORKDIR /app

# Install Python dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy the FastAPI app code
COPY . /app

# Copy Supervisor configuration file
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Expose the ports FastAPI is running on
EXPOSE 8000
EXPOSE 8001

# Run Supervisor to manage the FastAPI processes
CMD ["supervisord", "-c", "/etc/supervisor/supervisord.conf"]