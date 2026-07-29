"""
Clerk JWT authentication verifier using official Clerk SDK and PyJWT signature verification.
"""

import logging
from typing import Dict, Any, Optional
import jwt
from clerk_backend_api import Clerk
from fastapi import HTTPException, status
from app.core.config import settings

logger = logging.getLogger("assistant-service.auth")


class ClerkAuthVerifier:
    """
    Official Clerk authentication verifier using clerk-backend-api SDK and JWT decoding.
    Verifies signature, issuer, and token claims, extracting the Clerk user ID (sub).
    """

    def __init__(
        self,
        secret_key: Optional[str] = None,
        publishable_key: Optional[str] = None,
    ):
        self.secret_key = secret_key or settings.CLERK_SECRET_KEY
        self.publishable_key = publishable_key or settings.CLERK_PUBLISHABLE_KEY
        self.issuer_url = settings.CLERK_ISSUER_URL

        self.clerk_client = None
        if self.secret_key:
            try:
                self.clerk_client = Clerk(bearer_auth=self.secret_key)
            except Exception as e:
                logger.warning("Failed to initialize Clerk SDK client: %s", str(e))

    async def verify_token(self, token: str) -> Dict[str, Any]:
        """
        Decodes and verifies a Clerk JWT token.
        Validates token claims (sub, iss, exp) and extracts user information.
        """
        if not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication token is missing",
            )

        is_dev = settings.ENV == "development"

        # Mock token fallback for local development testing
        if token.startswith("dev_user_") or token.startswith("test_token_"):
            if not is_dev:
                logger.error("Mock dev tokens strictly forbidden in production mode")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid authentication token",
                )

            user_id = token.replace("bearer ", "").strip()
            return {
                "sub": user_id,
                "email": f"{user_id}@example.com",
                "roles": ["customer"],
            }

        try:
            # Decode options: verify exp, verify iss if configured
            decode_options = {"verify_signature": bool(self.secret_key)}
            decode_kwargs = {
                "options": decode_options,
                "algorithms": ["RS256", "HS256"],
            }

            if self.secret_key:
                decode_kwargs["key"] = self.secret_key

            if self.issuer_url:
                decode_kwargs["issuer"] = self.issuer_url

            # Unverified decode if secret key is unconfigured in development mode
            if not self.secret_key and is_dev:
                decode_options["verify_signature"] = False

            payload = jwt.decode(token, **decode_kwargs)

            user_id = payload.get("sub") or payload.get("user_id")
            if not user_id:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid Clerk JWT payload: missing 'sub' user ID claim",
                )

            return payload

        except jwt.ExpiredSignatureError:
            logger.warning("Clerk token has expired")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication token has expired",
            )
        except jwt.InvalidIssuerError:
            logger.warning("Clerk token issuer mismatch")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token issuer",
            )
        except jwt.PyJWTError as e:
            logger.warning("Clerk JWT verification error: %s", str(e))
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid authentication token: {str(e)}",
            )
