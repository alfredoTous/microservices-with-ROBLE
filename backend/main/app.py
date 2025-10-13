from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .auth import router as auth_router

app = FastAPI()

# CORS Middleware for Vite React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default listening port
    allow_credentials=True,              # Allow cookies    
    allow_methods=["*"],
    allow_headers=["*"],
)

# include auth router 
app.include_router(auth_router)

