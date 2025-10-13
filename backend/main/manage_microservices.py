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

        app_file = service_path / "app.py"
        with open(app_file, "w", encoding="utf-8") as f:
            if description:
                f.write(f"# {description}\n\n")
            f.write(code + "\n")

        return {
            "ok": True,
            "message": f"Microservies '{safe_name}' created successfully",
            "path": str(app_file),
        }
    except Exception as e:
        raise HTTPException(500, f"Error creating microservice: {e}")
