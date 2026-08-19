# ============================================================
# Stage 1: Build stage with uv dependency installation
# Uses the official uv image with Python 3.12 Alpine.
# ============================================================
FROM ghcr.io/astral-sh/uv:python3.12-alpine AS builder

# Enable bytecode compilation and copy link mode for optimal container performance
ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

WORKDIR /app

# Copy dependency definition files first for Docker layer caching
COPY apps/assistant-service/pyproject.toml apps/assistant-service/uv.lock ./

# Install production dependencies only using the frozen lockfile
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev --no-install-project

# Copy application source code and Alembic migration configuration
COPY apps/assistant-service/app ./app
COPY apps/assistant-service/alembic ./alembic
COPY apps/assistant-service/alembic.ini ./

# Sync the application project into the virtual environment
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev


# ============================================================
# Stage 2: Final runtime stage
# Minimal, secure production container.
# ============================================================
FROM python:3.12-alpine AS runner

WORKDIR /app

# Install system dependencies (libc compatibility)
RUN apk add --no-cache libc6-compat

# Create a non-root group and user for security
RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 --ingroup appgroup appuser

# Copy virtual environment and application files from builder stage
COPY --from=builder --chown=appuser:appgroup /app/.venv /app/.venv
COPY --from=builder --chown=appuser:appgroup /app/app /app/app
COPY --from=builder --chown=appuser:appgroup /app/alembic /app/alembic
COPY --from=builder --chown=appuser:appgroup /app/alembic.ini /app/alembic.ini

# Set environment variables for virtual environment and unbuffered output
ENV PATH="/app/.venv/bin:$PATH"
ENV PYTHONUNBUFFERED=1

# Run as non-root user
USER appuser

# Expose Assistant Service FastAPI HTTP port
EXPOSE 8004

# Start application with Uvicorn listening on 0.0.0.0:8004
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8004"]
