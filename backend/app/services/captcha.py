import base64
import hashlib
import hmac
import json
import random
import time

from fastapi import HTTPException, status

from ..auth import SECRET_KEY

CAPTCHA_TTL_SECONDS = 300


def _b64encode(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).decode().rstrip("=")


def _b64decode(value: str) -> bytes:
    padding = "=" * (-len(value) % 4)
    return base64.urlsafe_b64decode(value + padding)


def create_captcha() -> dict:
    a = random.randint(2, 12)
    b = random.randint(2, 12)
    exp = int(time.time()) + CAPTCHA_TTL_SECONDS
    payload = {"a": a, "b": b, "exp": exp}
    payload_b64 = _b64encode(json.dumps(payload, separators=(",", ":")).encode())
    sig = hmac.new(SECRET_KEY.encode(), payload_b64.encode(), hashlib.sha256).hexdigest()
    return {
        "question": f"{a} + {b} = ?",
        "captcha_token": f"{payload_b64}.{sig}",
    }


def verify_captcha(captcha_token: str | None, captcha_answer: str | int | None) -> None:
    if not captcha_token or captcha_answer is None or str(captcha_answer).strip() == "":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Doğrulama gerekli",
        )

    try:
        payload_b64, sig = captcha_token.rsplit(".", 1)
        expected = hmac.new(SECRET_KEY.encode(), payload_b64.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected):
            raise ValueError("invalid signature")

        payload = json.loads(_b64decode(payload_b64).decode())
        if int(time.time()) > int(payload["exp"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Doğrulama süresi doldu, yeni soru alın",
            )

        user_answer = int(str(captcha_answer).strip())
        if user_answer != int(payload["a"]) + int(payload["b"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Toplama işlemi yanlış",
            )
    except HTTPException:
        raise
    except (ValueError, TypeError, json.JSONDecodeError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Geçersiz doğrulama, lütfen yenileyin",
        ) from None
