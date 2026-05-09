"""
FastAPI application entry point.

Run with:
    uvicorn backend.main:app --reload

Or:
    python -m backend.main
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
import logging

from backend.config import settings
from backend.routes.leads import router as leads_router
from backend.schemas.lead import APIResponse
from backend.logger import logger


# ── App ─────────────────────────────────────────────

app = FastAPI(
    title=settings.APP_TITLE,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── Exception Handlers ──────────────────────────────

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Catch Pydantic validation errors and return a standard APIResponse."""
    errors = exc.errors()
    error_msgs = [f"{err['loc'][-1]}: {err['msg']}" for err in errors if len(err['loc']) > 0]
    
    error_str = "Validation error"
    if error_msgs:
        error_str = f"Invalid input: {', '.join(error_msgs)}"
        
    logger.warning(f"Validation error on {request.url.path}: {error_str}")
    
    return JSONResponse(
        status_code=422,
        content=APIResponse(success=False, error=error_str).model_dump()
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch all unhandled exceptions so they don't leak stack traces to the client."""
    logger.error(f"Unhandled error on {request.method} {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content=APIResponse(
            success=False, 
            error="An internal server error occurred."
        ).model_dump()
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
    logger.info("Health check requested")
    return {"status": "healthy", "version": settings.APP_VERSION}


# ── Direct run support ──────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
