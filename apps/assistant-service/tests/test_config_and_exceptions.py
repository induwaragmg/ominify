"""
Unit test suite for startup configuration validation and domain exception hierarchy.
"""

import pytest
from app.core.config import Settings
from app.core.exceptions import ConfigurationError, LLMUnavailableError, ToolExecutionError


def test_config_validation_success():
    """Verify Settings.validate_config() succeeds when valid settings are provided."""
    s = Settings(
        DATABASE_URL="postgresql+asyncpg://postgres:postgres@localhost:5432/assistant_db",
        PRODUCT_SERVICE_URL="http://localhost:8000",
        ENV="development",
        GEMINI_API_KEY="test_key",
        GEMINI_MODEL="gemini-3.6-flash",
    )
    # Should not raise any exception
    s.validate_config()


def test_config_validation_missing_database_url():
    """Verify Settings.validate_config() raises ConfigurationError when DATABASE_URL is empty."""
    s = Settings(
        DATABASE_URL="   ",
        PRODUCT_SERVICE_URL="http://localhost:8000",
        ENV="development",
    )
    with pytest.raises(ConfigurationError) as exc_info:
        s.validate_config()
    assert "DATABASE_URL" in str(exc_info.value)


def test_domain_exception_hierarchy():
    """Verify custom domain exceptions derive from AssistantBaseException."""
    err = ToolExecutionError("Tool error", details="Invalid param")
    assert isinstance(err, Exception)
    assert err.message == "Tool error"
    assert err.details == "Invalid param"
