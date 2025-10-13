import os
from pathlib import Path
from fastapi import APIRouter, HTTPException, Body

router = APIRouter()

BASE_DIR = Path(__file__).resolve().parents[1]  # backend/
MICROSERVICES_PATH = BASE_DIR / "microservices"

@router.post("/create-microservice")
def create_microservice(data: dict = Body(...)):

    name = data.get("title", "").strip()
    description = data.get("desc", "").strip()
    code = data.get("code", "").strip()

    if not name:
        raise HTTPException(400, "Missing microservice title")

    # Sanitize name
    safe_name = name.replace(" ", "_").lower()
    service_path = MICROSERVICES_PATH / safe_name

    if service_path.exists():
        raise HTTPException(400, f"Microservice '{safe_name}' already exists.")

    try:
        os.makedirs(service_path, exist_ok=True)

        # Create app.py with user code
        app_file = service_path / "app.py"
        with open(app_file, "w", encoding="utf-8") as f:
            if description:
                f.write(f"# {description}\n\n")
            f.write(code + "\n")

        # Create Dockerfile
        dockerfile = service_path / "Dockerfile"
        dockerfile.write_text(f"""# Dockerfile for microservice {safe_name}
FROM python:3.11-slim

WORKDIR /app

# Copy code
COPY . /app

# Install dependencies
RUN pip install fastapi uvicorn

# expose port
EXPOSE 8000

# command to run the app
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
""")

        return {
            "ok": True,
            "message": f"Microservice '{safe_name}' created successfully",
            "path": str(app_file),
        }

    except Exception as e:
        raise HTTPException(500, f"Error creating microservice: {e}")
