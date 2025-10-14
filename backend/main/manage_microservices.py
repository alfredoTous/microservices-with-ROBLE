import os
from pathlib import Path
from fastapi import APIRouter, HTTPException, Body, Response, Request
import subprocess
import requests

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
            f.write("from fastapi import FastAPI, Request\n")
            f.write("app = FastAPI()\n\n")
            f.write("@app.get('/')\n")
            f.write(code.strip() + "\n\n")
            f.write(
                "\n@app.get('/test')\n"
                "def test():\n"
                "    return {'status': 'ok', 'message': 'Microservice active'}\n"
            )

        # Create Dockerfile
        dockerfile = service_path / "Dockerfile"
        dockerfile.write_text(f"""# Dockerfile for microservice {safe_name}
FROM python:3.11-slim

WORKDIR /app

# Copy code
COPY . /app

# Install dependencies
RUN pip install fastapi uvicorn

# Expose port
EXPOSE 8000
# Command to run the app
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
""")

        return {
            "ok": True,
            "message": f"Microservice '{safe_name}' created successfully",
            "path": str(app_file),
        }

    except Exception as e:
        raise HTTPException(500, f"Error creating microservice: {e}")
    

@router.get("/list-microservices")
def list_microservices():
    # Returns a list of microservices with their status and useful information
    if not MICROSERVICES_PATH.exists():
        return {"microservices": []}

    # Obtains running containers info
    try:
        containers_info = subprocess.check_output(
            ["docker", "ps", "--format", "{{.Names}} {{.Ports}}"],
            text=True,
        ).strip().splitlines()
    except subprocess.CalledProcessError:
        containers_info = []

    running_info = {}
    for line in containers_info:
        parts = line.split()
        if len(parts) >= 2:
            name = parts[0]
            port_str = " ".join(parts[1:])
            port = None
            if "->" in port_str:
                try:
                    port = port_str.split("->")[0].split(":")[-1]
                except Exception:
                    port = None
            running_info[name] = {"port": port}

    microservices = []
    for folder in MICROSERVICES_PATH.iterdir():
        if not folder.is_dir():
            continue

        name = folder.name
        app_file = folder / "app.py"
        docker_file = folder / "Dockerfile"
        container_name = f"{name}_container"
        running = container_name in running_info
        port = running_info.get(container_name, {}).get("port")

        microservices.append({
            "name": name,
            "has_app": app_file.exists(),
            "has_dockerfile": docker_file.exists(),
            "running": running,
            "port": port,
            "path": str(folder.resolve())
        })

    return {"microservices": microservices}

@router.post("/start-microservice")
def start_microservice(data: dict = Body(...)):
    # Start a Docker container for the microservice, building the image if needed
    name = data.get("name", "").strip().lower()
    if not name:
        raise HTTPException(400, "Missing microservice name")

    service_path = MICROSERVICES_PATH / name
    if not service_path.exists():
        raise HTTPException(404, f"Microservice '{name}' not found")

    image_name = f"{name}_image"
    container_name = f"{name}_container"

    # Always rebuild image (fresh copy of app.py and files)
    print(f"[INFO] (Re)building image '{image_name}' from latest code...")
    try:
        # remove old image if exists (optional, to prevent cache layers)
        subprocess.run(["docker", "rmi", "-f", image_name], check=False)
        subprocess.run(
            ["docker", "build", "--no-cache", "-t", image_name, str(service_path)],
            check=True,
        )
    except subprocess.CalledProcessError as e:
        raise HTTPException(500, f"Error building image: {e}")

    # If container is already running, stop and remove it (ensure fresh run)
    subprocess.run(["docker", "rm", "-f", container_name], check=False)

    # Run the container
    try:
        run = subprocess.run(
            [
                "docker", "run", "-d",
                "--name", container_name,
                "-p", "0:8000",
                image_name,
            ],
            check=True,
            capture_output=True,
            text=True
        )
        container_id = run.stdout.strip()
        print(f"[OK] Container {container_name} started ({container_id})")

        return {
            "ok": True,
            "message": f"Microservice '{name}' started correctly.", 
            "container_id": container_id
        }

    except subprocess.CalledProcessError as e:
        raise HTTPException(500, f"Error starting microservice: {e.stderr or e}")


@router.post("/stop-microservice")
def stop_microservice(data: dict = Body(...)):

    # Stop container if running
    name = data.get("name", "").strip().lower()
    if not name:
        raise HTTPException(400, "Missing microservice name")

    container_name = f"{name}_container"

    # Test if container is running
    containers = subprocess.getoutput("docker ps --format '{{.Names}}'").splitlines()
    if container_name not in containers:
        return {"ok": True, "message": f"Microservice '{name}' is already stop."}

    try:
        subprocess.run(["docker", "stop", container_name], check=True)
        return {"ok": True, "message": f"Microservice '{name}' stopped successfully."}
    except subprocess.CalledProcessError as e:
        raise HTTPException(500, f"Error stopping microservice: {e}")

@router.delete("/delete-microservice")
def delete_microservice(data: dict = Body(...)):
    # Delete container, image and microservice files
    name = data.get("name", "").strip().lower()
    if not name:
        raise HTTPException(400, "Missing microservice name")

    container_name = f"{name}_container"
    image_name = f"{name}_image"
    service_path = MICROSERVICES_PATH / name

    try:
        print(f"[DELETE] Deleting microservice {name}...")

        # Stop and remove container (if exists)
        subprocess.run(["docker", "rm", "-f", container_name], check=False)
        print(f"[OK] Container removed: {container_name}")

        # Remove image (if exists)
        subprocess.run(["docker", "rmi", "-f", image_name], check=False)
        print(f"[OK] Image removed: {image_name}")

        # Remove files
        if service_path.exists():
            import shutil
            shutil.rmtree(service_path)
            print(f"[OK] Folders removed: {service_path}")

        return {"ok": True, "message": f"Microservice '{name}' deleted completely."}
    except Exception as e:
        raise HTTPException(500, f"Error deleting microservice: {e}")


@router.get("/edit-microservice")
def get_microservice_code(name: str):
    # Returns the content of app.py for editing
    service_path = MICROSERVICES_PATH / name / "app.py"
    if not service_path.exists():
        raise HTTPException(404, f"No app.py found for {name}")
    with open(service_path, "r", encoding="utf-8") as f:
        code = f.read()
    return {"name": name, "code": code}


@router.put("/edit-microservice")
def save_microservice_code(data: dict = Body(...)):
    # Save the edited code back to app.py
    name = data.get("name")
    new_code = data.get("code")
    if not name or new_code is None:
        raise HTTPException(400, "Missing name or code")

    service_path = MICROSERVICES_PATH / name / "app.py"
    if not service_path.exists():
        raise HTTPException(404, f"No app.py found for {name}")

    with open(service_path, "w", encoding="utf-8") as f:
        f.write(new_code)

    return {"ok": True, "message": f"Code for microservice {name} updated successfully."}

@router.api_route("/microservices/{name}", methods=["GET", "POST"])
async def forward_microservice(name: str, request: Request):
    # Forwards the request to the microservice's root endpoint and returns its response
    name = name.strip().lower()
    data = list_microservices()["microservices"]
    info = next((m for m in data if m["name"] == name), None)

    if not info:
        raise HTTPException(404, f"Microservice '{name}' not found")
    if not info["running"]:
        raise HTTPException(400, f"Microservice '{name}' is not on execution")
    port = info.get("port")
    if not port:
        raise HTTPException(400, f"Port of microservice '{name}' not found")

    # Build URL with query parameters
    query = request.url.query
    url = f"http://localhost:{port}/"
    if query:
        url += f"?{query}"

    #  Forward request
    headers = dict(request.headers)
    try:
        if request.method == "POST":
            body = await request.body()
            r = requests.post(url, headers=headers, data=body)
        else:  # GET
            r = requests.get(url, headers=headers)
        return Response(
            content=r.content,
            status_code=r.status_code,
            media_type=r.headers.get("content-type", "application/json")
        )
    except requests.RequestException as e:
        raise HTTPException(502, f"Error connecting to {url}: {e}")
