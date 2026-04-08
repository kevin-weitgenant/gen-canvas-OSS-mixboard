from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from config import settings  # type: ignore
from routers import sse_session, webhook, sse, chat

app = FastAPI(
    title="Infinite Canvas Image Generation API",
    version="2.0.0",
    description="Webhook-based image generation service"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sse_session.router, prefix="/api", tags=["sse-session"])
app.include_router(chat.router, prefix="/api", tags=["chat"])
app.include_router(webhook.router, prefix="/webhook", tags=["webhook"])
app.include_router(sse.router, prefix="/sse", tags=["sse"])


@app.get("/health")
async def health():
    return {"status": "ok", "version": "2.0.0"}


# Mount static files for the React app
# Build output is in ../dist relative to the server directory
frontend_dist = Path(__file__).parent.parent / "dist"
if frontend_dist.exists():
    app.mount("/", StaticFiles(directory=str(frontend_dist), html=True), name="static")
