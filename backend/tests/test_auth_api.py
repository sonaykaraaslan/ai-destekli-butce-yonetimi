from tests.conftest import solve_captcha


def test_root(client):
    response = client.get("/")
    assert response.status_code == 200
    assert "demo" in response.json()


def test_get_captcha(client):
    response = client.get("/api/auth/captcha")
    assert response.status_code == 200
    body = response.json()
    assert body["question"].endswith("= ?")
    assert body["captcha_token"]


def test_register_and_login(client):
    captcha = client.get("/api/auth/captcha").json()
    answer = solve_captcha(captcha["captcha_token"])

    register = client.post(
        "/api/auth/register",
        json={
            "email": "yeni@example.com",
            "full_name": "Yeni Kullanici",
            "password": "sifre123",
            "captcha_token": captcha["captcha_token"],
            "captcha_answer": answer,
        },
    )
    assert register.status_code == 200
    assert register.json()["user"]["email"] == "yeni@example.com"

    captcha2 = client.get("/api/auth/captcha").json()
    login = client.post(
        "/api/auth/login",
        data={
            "username": "yeni@example.com",
            "password": "sifre123",
            "captcha_token": captcha2["captcha_token"],
            "captcha_answer": solve_captcha(captcha2["captcha_token"]),
        },
    )
    assert login.status_code == 200
    assert login.json()["access_token"]


def test_login_wrong_password(client, test_user):
    captcha = client.get("/api/auth/captcha").json()
    response = client.post(
        "/api/auth/login",
        data={
            "username": test_user.email,
            "password": "yanlis-sifre",
            "captcha_token": captcha["captcha_token"],
            "captcha_answer": solve_captcha(captcha["captcha_token"]),
        },
    )
    assert response.status_code == 401


def test_me_requires_auth(client):
    assert client.get("/api/auth/me").status_code == 401


def test_me_returns_user(client, auth_headers, test_user):
    response = client.get("/api/auth/me", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["email"] == test_user.email
