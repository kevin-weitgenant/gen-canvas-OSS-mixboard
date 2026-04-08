# ===== BUILDER STAGE =====
FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim AS builder

WORKDIR /app

# Install Node.js and pnpm (uv image doesn't include Node)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g pnpm \
    && rm -rf /var/lib/apt/lists/*

# Copy Python dependency files
COPY server/pyproject.toml server/uv.lock* ./server/

# Install Python dependencies (no dev, compile bytecode for smaller size)
WORKDIR /app/server
RUN uv sync --frozen --no-dev --compile-bytecode

# Copy frontend dependency files
WORKDIR /app
COPY package.json pnpm-lock.yaml ./

# Install frontend dependencies and build
RUN pnpm install --frozen-lockfile && pnpm build

# ===== RUNTIME STAGE =====
FROM python:3.12-slim-bookworm

WORKDIR /app

# Copy virtual environment from builder
COPY --from=builder /app/server/.venv /app/server/.venv

# Copy server code
COPY --from=builder /app/server /app/server

# Copy built frontend
COPY --from=builder /app/dist /app/dist

# Set environment to use the venv
ENV PATH="/app/server/.venv/bin:$PATH"
ENV PYTHONUNBUFFERED=1

# Expose the port FastAPI runs on
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"

# Run the application
CMD ["uvicorn", "server.main:app", "--host", "0.0.0.0", "--port", "8000"]
