import os
import requests

from fastapi import APIRouter, HTTPException, Response, Header, Request

from dotenv import load_dotenv
load_dotenv()

# FastApi APIRouter instance and load env variables
router = APIRouter()

ROBLE_API_BASE_URL = os.getenv("ROBLE_API_BASE_URL")
ROBLE_PROJECT_NAME = os.getenv("ROBLE_PROJECT_NAME")

if not ROBLE_API_BASE_URL or not ROBLE_PROJECT_NAME:
    raise RuntimeError("ENV VARIABLES MISSING: ROBLE_API_BASE_URL y ROBLE_PROJECT_NAME")

# Function to create user in Roble using AUTH API
def create_user(email, name, password):
    url = f"{ROBLE_API_BASE_URL}/auth/{ROBLE_PROJECT_NAME}/signup-direct"
    try:
        r = requests.post(url, json={
            "email": email,
            "name": name,
            "password": password
        }, timeout=20)
        print(f"\n[!]Sending request to ROBLE: {url}\n Status code: {r.status_code}\n Response: {r.text}\n")
    except requests.RequestException as e:
        raise HTTPException(status_code=400, detail=f"Error connecting to Roble: {e}")
    return r.status_code, r.json()

# Microservice Register endpoint
@router.post("/register")
def register(post_data: dict, response: Response):
    
    # Validate POST data
    email = post_data.get("email")
    name = post_data.get("name")
    password = post_data.get("password")    

    if not email or not name or not password or "@" not in email or "." not in email:
        raise HTTPException(status_code=400, detail="Incorrect parameters")
    if len(password) < 8 :
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    status_code, body = create_user(email, name, password)
    response.status_code = status_code
    
    return body   


# Microservice Login endpoint
@router.post("/login")
def login(post_data: dict, response: Response):
    
    # Validate POST data
    email = post_data.get("email")
    password = post_data.get("password")    

    if not email or not password or "@" not in email or "." not in email:
        raise HTTPException(status_code=400, detail="Bad email or password")
    if len(password) < 8 :
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    url = f"{ROBLE_API_BASE_URL}/auth/{ROBLE_PROJECT_NAME}/login"

    # Send POST request to Roble
    try:
        r = requests.post(url, json={
            "email": email,
            "password": password
        }, timeout=20)
        print(f"\n[!]Sending request to ROBLE: {url}\n Status code: {r.status_code}\n Response: {r.text}\n")
    except requests.RequestException as e:
        raise HTTPException(status_code=400, detail=f"Error connecting to Roble: {e}")
    
    if r.status_code >=400:
        try:
            error_detail = r.json()
        except ValueError:
            error_detail = r.text
        raise HTTPException(status_code=r.status_code, detail=error_detail)
    
    body = r.json()
    refresh_token = body.get("refreshToken")
    # Set cookie for refresh token
    if refresh_token:
        # set cookie httponly
        response.set_cookie(key="refreshToken", value=refresh_token, httponly=True, samesite="Lax")
        # Remove refresh token from response body
        body.pop("refreshToken", None)
    
    response.status_code = r.status_code 
    return {
        "accessToken": body.get("accessToken"),
        "body": body
    }


# Microservice verify-token endpoint
@router.get("/verify-token")
def verify_token(authorization: str = Header(default="")):
    # Validate access token
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=400, detail="Invalid access token")
    
    url = f"{ROBLE_API_BASE_URL}/auth/{ROBLE_PROJECT_NAME}/verify-token"

    # Send GET request to Roble incliuding Authorization header
    try:
        r = requests.get(url, headers={
            "Authorization": authorization 
        }, timeout=20)
        print(f"\n[!]Sending request to ROBLE: {url}\n Status code: {r.status_code}\n Response: {r.text}\n")
        if r.status_code >=400:
            raise HTTPException(status_code=r.status_code, detail=f"{r.json()}")
    except requests.RequestException as e:
        raise HTTPException(status_code=400, detail=f"Error connecting to Roble: {e}")
    
    return r.json() # Return Roble whole json response could parse it later if needed
    
        
@router.post("/refresh-token")
def refresh_token(request: Request, response: Response):
    # Get refresh token from cookies
    refresh_token = request.cookies.get("refreshToken")
    if not refresh_token:
        raise HTTPException(status_code=400, detail="Missing refresh token cookie")
    url = f"{ROBLE_API_BASE_URL}/auth/{ROBLE_PROJECT_NAME}/refresh-token"
    # Send POST request to Roble
    try:
        r = requests.post(url, json={
            "refreshToken": refresh_token
        }, timeout=20)
        print(f"\n[!]Sending request to ROBLE: {url}\n Status code: {r.status_code}\n Response: {r.text}\n")
        if r.status_code >=400:
            raise HTTPException(status_code=r.status_code, detail=f"{r.json()}")
    except requests.RequestException as e:
        raise HTTPException(status_code=400, detail=f"Error connecting to Roble: {e}")
    
    if r.status_code >= 400:
        raise HTTPException(status_code=r.status_code, detail=r.text)

    data = r.json()

    # If new refresh token is provided, update cookie
    new_refresh_token = data.get("refreshToken")
    if new_refresh_token:
        # Update cookie for refresh token
        response.set_cookie(key="refreshToken", value=new_refresh_token, httponly=True, samesite="Lax")
    
    # Return new access token
    access_token = data.get("accessToken")
    if not access_token:
        raise HTTPException(status_code=500, detail="Missing access token in Roble response")
    return {"accessToken": access_token}

@router.post("/logout")
def logout(response: Response):
    # Clear the refresh token cookie
    response.delete_cookie(key="refreshToken")
    return {"message": "Logged out"}    


# Function to validate protected routes
@router.get("/guard")
def guard(authorization: str = Header(default="")):
    # Validate access token
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="missing_access_token")

    # Verify access token with Roble
    url = f"{ROBLE_API_BASE_URL}/auth/{ROBLE_PROJECT_NAME}/verify-token"
    try:
        r = requests.get(url, headers={"Authorization": authorization}, timeout=20)
    except requests.RequestException:
        raise HTTPException(502, "error contacting Roble")

    if r.status_code == 200:
        return {"ok": True}
    if r.status_code == 403:
        raise HTTPException(403, "forbidden")

    # 401 or other errors
    raise HTTPException(r.status_code, r.text)





