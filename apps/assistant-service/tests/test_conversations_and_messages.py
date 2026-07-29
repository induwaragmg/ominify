"""
Automated Integration Test Suite for Phase 3 Conversation & Message Flow, AI Assistant Orchestration, User Isolation, and Cascade Deletion.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_full_conversation_and_message_lifecycle():
    # ── 1. User A creates conversation ─────────────────────────────────────────
    headers_user_a = {"Authorization": "Bearer dev_user_alice"}
    resp_create = client.post(
        "/api/v1/conversations",
        json={"title": "Alice Shopping Assistance"},
        headers=headers_user_a,
    )
    assert resp_create.status_code == 201, resp_create.text
    conv_data = resp_create.json()
    conv_id = conv_data["id"]
    assert conv_data["user_id"] == "dev_user_alice"

    # ── 2. User A retrieves conversation ───────────────────────────────────────
    resp_get = client.get(f"/api/v1/conversations/{conv_id}", headers=headers_user_a)
    assert resp_get.status_code == 200
    assert resp_get.json()["id"] == conv_id

    # ── 3. User B attempts to access User A's conversation (403 Forbidden) ───
    headers_user_b = {"Authorization": "Bearer dev_user_bob"}
    resp_get_b = client.get(f"/api/v1/conversations/{conv_id}", headers=headers_user_b)
    assert resp_get_b.status_code == 403

    # ── 4. User A posts a user message (Triggers Orchestrator & stores AI response) ─
    resp_msg1 = client.post(
        f"/api/v1/conversations/{conv_id}/messages",
        json={"role": "user", "content": "Can you recommend running shoes?"},
        headers=headers_user_a,
    )
    assert resp_msg1.status_code == 201, resp_msg1.text
    assistant_reply_data = resp_msg1.json()
    assert assistant_reply_data["conversation_id"] == conv_id
    assert assistant_reply_data["role"] == "assistant"
    assert len(assistant_reply_data["content"]) > 0

    # ── 5. User A lists conversation messages (Contains User & Assistant messages) ─
    resp_list_msgs = client.get(f"/api/v1/conversations/{conv_id}/messages", headers=headers_user_a)
    assert resp_list_msgs.status_code == 200
    messages = resp_list_msgs.json()["messages"]
    assert len(messages) >= 2
    assert messages[0]["role"] == "user"
    assert messages[1]["role"] == "assistant"

    # ── 6. User B attempts to post message to User A's thread (403 Forbidden) ─
    resp_post_b = client.post(
        f"/api/v1/conversations/{conv_id}/messages",
        json={"role": "user", "content": "Hacking thread"},
        headers=headers_user_b,
    )
    assert resp_post_b.status_code == 403

    # ── 7. User B attempts to delete User A's conversation (403 Forbidden) ───
    resp_del_b = client.delete(f"/api/v1/conversations/{conv_id}", headers=headers_user_b)
    assert resp_del_b.status_code == 403

    # ── 8. User A deletes conversation (Cascade deletes messages) ────────────
    resp_del_a = client.delete(f"/api/v1/conversations/{conv_id}", headers=headers_user_a)
    assert resp_del_a.status_code == 204

    # ── 9. Verify conversation & messages no longer exist (404 Not Found) ─────
    resp_get_after = client.get(f"/api/v1/conversations/{conv_id}", headers=headers_user_a)
    assert resp_get_after.status_code == 404

    resp_msgs_after = client.get(f"/api/v1/conversations/{conv_id}/messages", headers=headers_user_a)
    assert resp_msgs_after.status_code == 404


def test_empty_message_validation():
    headers = {"Authorization": "Bearer dev_user_alice"}
    resp_create = client.post("/api/v1/conversations", json={}, headers=headers)
    conv_id = resp_create.json()["id"]

    # Empty message text
    resp_empty = client.post(
        f"/api/v1/conversations/{conv_id}/messages",
        json={"role": "user", "content": "   "},
        headers=headers,
    )
    assert resp_empty.status_code in (400, 422)
