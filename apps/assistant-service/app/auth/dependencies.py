"""
FastAPI authentication dependencies for current user resolution and JWT verification.
"""

import logging
from typing import Optional
from fastapi import Depends, HTTPException, Header, status
from app.core.config import settings
from app.auth.clerk import ClerkAuthVerifier
from app.schemas.auth import CurrentUser

logger = logging.getLogger("assistant-service.auth")
clerk_verifier = ClerkAuthVerifier()


async def get_token_from_header(
    authorization: Optional[str] = Header(None, alias="Authorization"),
) -> Optional[str]:
    """
    Extracts Bearer token string from HTTP Authorization header.
    """
    if not authorization:
        return None

    scheme, _, param = authorization.partition(" ")
    if scheme.lower() != "bearer":
        return None

    return param.strip()


async def get_current_user(
    token: Optional[str] = Depends(get_token_from_header),
) -> CurrentUser:
    """
    Resolves the CurrentUser from token context.
    Provides dev mode user context if token is omitted during local development.
    """
    if not token:
        if settings.ENV == "production":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing Authorization header",
                headers={"WWW-Authenticate": "Bearer"},
            )
        # Development fallback
        return CurrentUser(
            user_id="dev_user_123",
            email="dev@example.com",
            roles=["customer"],
        )

    claims = await clerk_verifier.verify_token(token)
    user_id = claims.get("sub") or claims.get("user_id") or "dev_user_123"
    email = claims.get("email") or claims.get("primary_email_address")
    roles = claims.get("roles", ["customer"])

    return CurrentUser(
        user_id=user_id,
        email=email,
        roles=roles,
    )


async def require_auth(
    current_user: CurrentUser = Depends(get_current_user),
) -> CurrentUser:
    """
    Requires an authenticated user context.
    """
    if not current_user or not current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return current_user
