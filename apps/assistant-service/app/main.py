"""
FastAPI application entrypoint for the Ominify AI Assistant Service.
Features request_id tracing middleware, exception handlers, and API router registrations.
"""

import uuid
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.lifespan import lifespan
from app.core.logging_context import set_log_context, request_id_ctx
from app.core.exceptions import AssistantBaseException
from app.api.routes import health, conversations, messages

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# Configure CORS Middleware
if settings.ALLOWED_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


# Request ID Context Middleware
@app.middleware("http")
async def request_id_middleware(request: Request, call_next):
    req_id = request.headers.get("X-Request-ID", f"req_{uuid.uuid4().hex[:12]}")
    set_log_context(request_id=req_id)

    response = await call_next(request)
    response.headers["X-Request-ID"] = req_id
    return response


# Global Exception Handler for AI Assistant Domain Errors
@app.exception_handler(AssistantBaseException)
async def assistant_exception_handler(request: Request, exc: AssistantBaseException):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": exc.__class__.__name__,
            "message": exc.message,
            "request_id": request_id_ctx.get("-"),
        },
    )


# Root Welcome Endpoint
@app.get("/", tags=["Root"], summary="Root Information")
async def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENV,
        "documentation": "/docs",
        "health": "/health",
    }


# Register API Routers
app.include_router(health.router, tags=["Health Check"])
app.include_router(
    conversations.router,
    prefix=f"{settings.API_V1_STR}/conversations",
    tags=["Conversations"],
)
app.include_router(
    messages.router,
    prefix=f"{settings.API_V1_STR}/conversations/{{conversation_id}}/messages",
    tags=["Messages"],
)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8004, reload=True)
