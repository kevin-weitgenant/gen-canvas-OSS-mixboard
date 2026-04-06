from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings  # type: ignore
from routers import generate, webhook, sse

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

app.include_router(generate.router, prefix="/api", tags=["generate"])
app.include_router(webhook.router, prefix="/webhook", tags=["webhook"])
app.include_router(sse.router, prefix="/sse", tags=["sse"])


@app.get("/health")
async def health():
    return {"status": "ok", "version": "2.0.0"}
