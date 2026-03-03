"""
SDLC Optimization Backend - FastAPI Application Entry Point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router as api_router

app = FastAPI(
    title="SDLC Optimization Framework",
    description="AI-powered Software Development Lifecycle automation engine",
    version="1.0.0",
)

# CORS — allow the React frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
app.include_router(api_router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "SDLC Optimization Framework API", "status": "running"}


if __name__ == "__main__":
    import uvicorn
    from config import settings

    uvicorn.run("main:app", host=settings.host, port=settings.port, reload=settings.debug)
