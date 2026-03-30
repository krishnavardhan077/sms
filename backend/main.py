from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import models
from database import engine, SessionLocal
from routes import router as api_router
from auth import router as auth_router
from admin_routes import router as admin_router

# Load environment variables from .env
load_dotenv()

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

# Create / migrate tables (safe — won't drop existing)
models.Base.metadata.create_all(bind=engine)

# Seed courses + tests on first startup
from seed_data import seed_courses_and_tests
_db = SessionLocal()
try:
    seed_courses_and_tests(_db)
finally:
    _db.close()

app = FastAPI(title="Student Management System API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(admin_router, prefix="/api")


@app.get("/")
def read_root():
    return {"message": "Welcome to the SMS API"}
