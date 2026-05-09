"""
FastAPI application entry point.

Run with:
    uvicorn backend.main:app --reload

Or:
    python -m backend.main
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import settings
from backend.routes.leads import router as leads_router


# ── App ─────────────────────────────────────────────

app = FastAPI(
    title=settings.APP_TITLE,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS (needed when React frontend connects) ─────

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ──────────────────────────────────────────

app.include_router(leads_router, prefix="/api")


# ── Health check ────────────────────────────────────

@app.get("/health")
def health_check():
    return {"status": "healthy", "version": settings.APP_VERSION}


# ── Direct run support ──────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
