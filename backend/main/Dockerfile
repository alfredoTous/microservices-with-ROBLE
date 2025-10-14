FROM python:3.11-slim
WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    docker-cli \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt || \
    pip install --no-cache-dir fastapi uvicorn requests python-dotenv

# Copy application code
COPY . /app
EXPOSE 8000

CMD ["uvicorn", "main.app:app", "--host", "0.0.0.0", "--port", "8000"]
