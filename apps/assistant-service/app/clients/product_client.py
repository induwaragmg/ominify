"""
Resilient Async HTTP Client implementation for Product Service microservice communication via httpx.
Features retry policy with exponential backoff, configurable timeouts, latency metrics, and HTTP status handling.
"""

import asyncio
import logging
import time
from typing import Any, Dict, List, Optional
import httpx
from app.core.config import settings

logger = logging.getLogger("assistant-service.clients")

# Status codes eligible for automatic retries
RETRYABLE_STATUS_CODES = {408, 429, 500, 502, 503, 504}


class ProductClient:
    """
    Async HTTP client for communicating with the Product Service microservice (Port :8000).
    Performs catalog searches, product detail fetches, category queries, and comparison lookups.
    Includes exponential backoff retry logic, latency metrics, and failure recovery.
    """

    def __init__(
        self,
        base_url: Optional[str] = None,
        timeout: float = 5.0,
        max_retries: int = 3,
        backoff_factor: float = 0.3,
    ):
        self.base_url = (base_url or settings.PRODUCT_SERVICE_URL).rstrip("/")
        self.timeout = timeout
        self.max_retries = max_retries
        self.backoff_factor = backoff_factor

    async def _execute_request_with_retry(
        self,
        endpoint_paths: List[str],
        params: Optional[Dict[str, Any]] = None,
    ) -> Optional[httpx.Response]:
        """
        Executes HTTP GET request against primary endpoint and fallbacks with retry policy.
        Retries ONLY on 408, 429, 500, 502, 503, 504 or network connection timeouts.
        Never retries 400, 401, 403, 404.
        """
        start_time = time.perf_counter()

        for path in endpoint_paths:
            url = f"{self.base_url}{path}"
            logger.info("ProductClient requesting GET %s (params: %s)", url, params)

            for attempt in range(self.max_retries):
                retry_count = attempt
                try:
                    async with httpx.AsyncClient(timeout=self.timeout) as client:
                        response = await client.get(url, params=params)

                    latency_ms = round((time.perf_counter() - start_time) * 1000, 2)

                    if response.status_code == 200:
                        logger.info(
                            "ProductClient request succeeded GET %s (status: 200, latency: %.2f ms, retries: %d)",
                            url,
                            latency_ms,
                            retry_count,
                        )
                        return response

                    # Non-retryable client errors (400, 401, 403, 404)
                    if response.status_code not in RETRYABLE_STATUS_CODES:
                        logger.warning(
                            "ProductClient GET %s returned non-retryable status %d (latency: %.2f ms)",
                            url,
                            response.status_code,
                            latency_ms,
                        )
                        break

                    # Retryable status codes (500, 502, 503, 504, 429, 408)
                    logger.warning(
                        "ProductClient GET %s returned retryable status %d (attempt %d/%d)",
                        url,
                        response.status_code,
                        attempt + 1,
                        self.max_retries,
                    )

                except (httpx.TimeoutException, httpx.NetworkError, httpx.HTTPError) as e:
                    latency_ms = round((time.perf_counter() - start_time) * 1000, 2)
                    logger.warning(
                        "ProductClient GET %s network/timeout error: %s (attempt %d/%d, latency: %.2f ms)",
                        url,
                        str(e),
                        attempt + 1,
                        self.max_retries,
                        latency_ms,
                    )

                # Apply exponential backoff delay before next retry
                if attempt < self.max_retries - 1:
                    sleep_sec = self.backoff_factor * (2 ** attempt)
                    await asyncio.sleep(sleep_sec)

        return None

    async def search_products(
        self,
        query: str,
        category: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        limit: int = 10,
    ) -> List[Dict[str, Any]]:
        """
        Queries Product Service search endpoint with resiliency retries.
        """
        clean_query = query.strip() if query else ""

        params1: Dict[str, Any] = {"limit": limit}
        if clean_query:
            params1["search"] = clean_query
        if category:
            params1["category"] = category

        response = await self._execute_request_with_retry(
            endpoint_paths=["/products", "/api/v1/products/search", "/api/v1/products"],
            params=params1,
        )

        if response and response.status_code == 200:
            data = response.json()
            products = data.get("products", data) if isinstance(data, dict) else data
            return products if isinstance(products, list) else []

        return []

    async def get_product(self, product_id: str) -> Optional[Dict[str, Any]]:
        """
        Fetches detailed product specifications by ID with retry handling.
        """
        clean_id = product_id.strip() if product_id else ""
        if not clean_id:
            return None

        response = await self._execute_request_with_retry(
            endpoint_paths=[f"/products/{clean_id}", f"/api/v1/products/{clean_id}"]
        )

        if response and response.status_code == 200:
            data = response.json()
            return data if isinstance(data, dict) else None

        return None

    async def compare_products(self, product_ids: List[str]) -> List[Dict[str, Any]]:
        """
        Fetches multiple product details for side-by-side comparison.
        """
        logger.info("ProductClient request: compare_products for IDs %s", product_ids)
        results = []
        for pid in product_ids:
            product = await self.get_product(pid)
            if product:
                results.append(product)
        return results

    async def get_categories(self) -> List[Dict[str, Any]]:
        """
        Fetches store categories from Product Service with retry handling.
        """
        response = await self._execute_request_with_retry(
            endpoint_paths=["/categories", "/api/v1/categories"]
        )

        if response and response.status_code == 200:
            data = response.json()
            categories = data.get("categories", data) if isinstance(data, dict) else data
            return categories if isinstance(categories, list) else []

        return []

    async def get_featured_products(self, limit: int = 5) -> List[Dict[str, Any]]:
        """Fetches featured products."""
        return await self.search_products(query="featured", limit=limit)

    async def get_related_products(self, product_id: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Fetches related products based on product ID."""
        product = await self.get_product(product_id)
        if product and "category" in product:
            return await self.search_products(query="", category=product["category"], limit=limit)
        return await self.get_featured_products(limit=limit)
