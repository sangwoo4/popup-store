# FastAPI Dockerfile

# Use the official Python image from the Docker Hub
FROM python:3.9-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set the working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy the FastAPI app code
COPY category_recommend /app/category_recommend

# Expose the port FastAPI is running on
EXPOSE 8000

# Run the FastAPI application with --reload
CMD ["uvicorn", "category_recommend.Combine:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]