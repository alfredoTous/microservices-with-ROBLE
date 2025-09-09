import os
import requests

from fastapi import FastAPI, HTTPException

from dotenv import load_dotenv
load_dotenv()

# FastApi instance and load env variables
app = FastAPI()
ROBLE_API_BASE_URL = os.getenv("ROBLE_API_BASE_URL")
ROBLE_PROJECT_NAME = os.getenv("ROBLE_PROJECT_NAME")

if not ROBLE_API_BASE_URL or not ROBLE_PROJECT_NAME:
    raise RuntimeError("ENV VARIABLES MISSING: ROBLE_API_BASE_URL y ROBLE_PROJECT_NAME")

# Create user in Roble using AUTH API
def create_user(email, name, password):
    url = f"{ROBLE_API_BASE_URL}/auth/{ROBLE_PROJECT_NAME}/signup-direct"
    try:
        r = requests.post(url, json={
            "email": email,
            "name": name,
            "password": password
        }, timeout=20)
        print(f"\n[!]Mandando request a Roble: {url}\n Status code: {r.status_code}\n Response: {r.text}\n")
    except requests.RequestException as e:
        raise HTTPException(status_code=400, detail=f"Error connecting to Roble: {e}")
    return r.status_code, r.json()

# Microservice Register endpoint
@app.post("/register")
def register(post_data: dict):
    
    # Validate POST data
    email = post_data.get("email")
    name = post_data.get("name")
    password = post_data.get("password")    

    if not email or not name or not password or "@" not in email or "." not in email:
        raise HTTPException(status_code=400, detail="Incorrect parameters")
    if len(password) < 8 :
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    try:
        status_code, response = create_user(email, name, password)
    except HTTPException as e:
        raise e
    
    return status_code, response    


