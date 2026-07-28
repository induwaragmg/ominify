"""
Application configuration management using Pydantic Settings.
Environment variables are loaded from `.env` file or process environment.
"""

from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from app.core.exceptions import ConfigurationError


class Settings(BaseSettings):
    # Application Info
    PROJECT_NAME: str = "Ominify AI Assistant Service"
    VERSION: str = "0.1.0"
    DESCRIPTION: str = "AI Shopping Assistant Microservice for Ominify E-commerce"
    ENV: str = "development"
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"

    # Database Settings
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/assistant_db"

    # AI / LLM Provider Settings
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-3.6-flash"

    # Authentication Settings (Clerk)
    CLERK_SECRET_KEY: str = ""
    CLERK_PUBLISHABLE_KEY: str = ""
    CLERK_ISSUER_URL: str = ""

    # External Client Services
    PRODUCT_SERVICE_URL: str = "http://localhost:8000"

    # CORS Settings
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3002",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3002",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    def validate_config(self) -> None:
        """
        Validates mandatory environment settings during application startup.
        Fails fast if critical parameters are missing or invalid.
        """
        if not self.DATABASE_URL or not self.DATABASE_URL.strip():
            raise ConfigurationError("DATABASE_URL must be configured")

        if not self.PRODUCT_SERVICE_URL or not self.PRODUCT_SERVICE_URL.strip():
            raise ConfigurationError("PRODUCT_SERVICE_URL must be configured")

        if not self.ENV or not self.ENV.strip():
            raise ConfigurationError("ENV environment setting must be configured")

        if self.GEMINI_API_KEY and self.GEMINI_API_KEY.strip():
            if not self.GEMINI_MODEL or not self.GEMINI_MODEL.strip():
                raise ConfigurationError("GEMINI_MODEL must be configured when GEMINI_API_KEY is present")


settings = Settings()
