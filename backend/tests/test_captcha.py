import base64
import json
import time

import pytest
from fastapi import HTTPException

from app.services.captcha import create_captcha, verify_captcha


def _solve(token: str) -> int:
    payload_b64 = token.rsplit(".", 1)[0]
    padding = "=" * (-len(payload_b64) % 4)
    payload = json.loads(base64.urlsafe_b64decode(payload_b64 + padding).decode())
    return payload["a"] + payload["b"]


def test_create_captcha_format():
    data = create_captcha()
    assert "question" in data
    assert "captcha_token" in data
    assert "+" in data["question"]
    assert "." in data["captcha_token"]


def test_verify_captcha_accepts_correct_answer():
    data = create_captcha()
    verify_captcha(data["captcha_token"], str(_solve(data["captcha_token"])))


def test_verify_captcha_rejects_wrong_answer():
    data = create_captcha()
    with pytest.raises(HTTPException) as exc:
        verify_captcha(data["captcha_token"], "999")
    assert exc.value.status_code == 400
    assert "yanlış" in exc.value.detail.lower() or "Toplama" in exc.value.detail


def test_verify_captcha_rejects_missing_fields():
    with pytest.raises(HTTPException) as exc:
        verify_captcha(None, "5")
    assert exc.value.detail == "Doğrulama gerekli"


def test_verify_captcha_rejects_expired_token(monkeypatch):
    data = create_captcha()
    token = data["captcha_token"]
    answer = str(_solve(token))

    monkeypatch.setattr(time, "time", lambda: 9_999_999_999)
    with pytest.raises(HTTPException) as exc:
        verify_captcha(token, answer)
    assert "süresi doldu" in exc.value.detail
