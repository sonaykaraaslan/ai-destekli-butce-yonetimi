import os
import threading

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .migrate import run_migrations
from .routers import ai, auth, expenses, family, goals, incomes, invoices, ocr, reports, settings
from .seed import (
    ensure_family_seed,
    ensure_goals_seed,
    ensure_sonay_demo_account,
    migrate_demo_user,
    seed_demo_data,
)
from .database import SessionLocal
from .services.ocr_service import prewarm_ocr_reader

load_dotenv()

_default_origins = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:8080,http://127.0.0.1:8080"
cors_origins = [o.strip() for o in os.getenv("CORS_ORIGINS", _default_origins).split(",") if o.strip()]

app = FastAPI(
    title="AI-Powered Family Budget Management System",
    description="Aile butce ve finans yonetim sistemi",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(incomes.router, prefix="/api")
app.include_router(expenses.router, prefix="/api")
app.include_router(invoices.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(ai.router, prefix="/api")
app.include_router(ocr.router, prefix="/api")
app.include_router(settings.router, prefix="/api")
app.include_router(family.router, prefix="/api")
app.include_router(goals.router, prefix="/api")


@app.on_event("startup")
def on_startup():
    if os.getenv("TESTING"):
        return

    Base.metadata.create_all(bind=engine)
    run_migrations(engine)
    db = SessionLocal()
    try:
        seed_demo_data(db)
        migrate_demo_user(db)
        ensure_sonay_demo_account(db)
        ensure_family_seed(db)
        ensure_goals_seed(db)
    finally:
        db.close()

    threading.Thread(target=prewarm_ocr_reader, daemon=True).start()


@app.get("/")
def root():
    return {
        "message": "Aile Butce Yonetim Sistemi API",
        "docs": "/docs",
        "demo": {"email": "sonay@sonay.com", "password": "demo123", "alt_email": "demo@demo.com"},
    }
