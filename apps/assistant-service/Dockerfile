# --- Stage 1: Build virtualenv with UV ---
FROM ghcr.io/astral-sh/uv:python3.12-alpine AS builder
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project

# --- Stage 2: Final Production Runtime ---
FROM python:3.12-alpine AS runner
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/.venv /app/.venv
COPY app /app/app
COPY alembic /app/alembic
COPY alembic.ini /app/alembic.ini

ENV PATH="/app/.venv/bin:$PATH"
ENV PYTHONUNBUFFERED=1

USER appuser
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
