"""
Centralized domain exceptions for the Ominify AI Assistant Service.
"""


class AssistantBaseException(Exception):
    """Base exception class for all AI Assistant Service domain errors."""

    def __init__(self, message: str, details: str = ""):
        super().__init__(message)
        self.message = message
        self.details = details


class ConfigurationError(AssistantBaseException):
    """Raised when application or environment configuration is invalid."""
    pass


class LLMUnavailableError(AssistantBaseException):
    """Raised when the LLM provider (Gemini) is unavailable or encounters API errors."""
    pass


class ToolExecutionError(AssistantBaseException):
    """Raised when tool execution fails or receives invalid arguments."""
    pass


class ProductServiceUnavailable(AssistantBaseException):
    """Raised when the Product Service microservice is unreachable or fails persistently."""
    pass


class PromptBuildError(AssistantBaseException):
    """Raised when conversation content formatting or prompt assembly fails."""
    pass
