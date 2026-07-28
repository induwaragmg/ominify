"""
Unit test suite for ProductClient resiliency, retry policy, backoff, and HTTP status code handling.
"""

import pytest
from unittest.mock import AsyncMock, patch, MagicMock
import httpx
from app.clients.product_client import ProductClient, RETRYABLE_STATUS_CODES


@pytest.mark.anyio
async def test_product_client_retries_on_503_and_succeeds():
    """Verify ProductClient retries on retryable 503 error and succeeds on subsequent attempt."""
    client = ProductClient(base_url="http://localhost:8000", max_retries=3, backoff_factor=0.01)

    mock_resp_503 = MagicMock(status_code=503)
    mock_resp_200 = MagicMock(status_code=200)
    mock_resp_200.json.return_value = [{"id": "1", "name": "Running Shoe"}]

    with patch("httpx.AsyncClient.get", side_effect=[mock_resp_503, mock_resp_200]):
        products = await client.search_products("shoes")
        assert len(products) == 1
        assert products[0]["name"] == "Running Shoe"


@pytest.mark.anyio
async def test_product_client_does_not_retry_on_404():
    """Verify ProductClient never retries on non-retryable 404 error."""
    client = ProductClient(base_url="http://localhost:8000", max_retries=3, backoff_factor=0.01)

    mock_resp_404 = MagicMock(status_code=404)

    with patch("httpx.AsyncClient.get", return_value=mock_resp_404) as mock_get:
        product = await client.get_product("non_existent_id")
        assert product is None
        # Should stop after first attempt per endpoint, not retry 3 times
        assert mock_get.call_count <= 2


@pytest.mark.anyio
async def test_product_client_handles_network_timeout_gracefully():
    """Verify ProductClient catches network timeouts and returns fallback empty list without crashing."""
    client = ProductClient(base_url="http://localhost:8000", max_retries=2, backoff_factor=0.01)

    with patch("httpx.AsyncClient.get", side_effect=httpx.ConnectTimeout("Connection timed out")):
        categories = await client.get_categories()
        assert categories == []
