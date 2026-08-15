from datetime import date


def test_income_crud(client, auth_headers):
    create = client.post(
        "/api/incomes",
        headers=auth_headers,
        json={
            "title": "Maas",
            "amount": 25000,
            "category": "Maas",
            "income_date": str(date.today()),
        },
    )
    assert create.status_code == 201
    income_id = create.json()["id"]

    listing = client.get("/api/incomes", headers=auth_headers)
    assert listing.status_code == 200
    assert len(listing.json()) == 1

    update = client.put(
        f"/api/incomes/{income_id}",
        headers=auth_headers,
        json={"amount": 26000},
    )
    assert update.status_code == 200
    assert update.json()["amount"] == 26000

    delete = client.delete(f"/api/incomes/{income_id}", headers=auth_headers)
    assert delete.status_code == 204
    assert client.get("/api/incomes", headers=auth_headers).json() == []


def test_expense_crud(client, auth_headers):
    create = client.post(
        "/api/expenses",
        headers=auth_headers,
        json={
            "title": "Market",
            "amount": 500,
            "category": "Market",
            "expense_date": str(date.today()),
        },
    )
    assert create.status_code == 201
    expense_id = create.json()["id"]

    listing = client.get("/api/expenses", headers=auth_headers)
    assert listing.status_code == 200
    assert listing.json()[0]["title"] == "Market"

    delete = client.delete(f"/api/expenses/{expense_id}", headers=auth_headers)
    assert delete.status_code == 204


def test_invoice_crud(client, auth_headers):
    create = client.post(
        "/api/invoices",
        headers=auth_headers,
        json={
            "title": "Elektrik Faturasi",
            "amount": 850,
            "due_date": str(date.today()),
            "is_paid": False,
        },
    )
    assert create.status_code == 201
    invoice_id = create.json()["id"]

    listing = client.get("/api/invoices", headers=auth_headers)
    assert listing.status_code == 200
    assert any(item["id"] == invoice_id for item in listing.json())

    update = client.put(
        f"/api/invoices/{invoice_id}",
        headers=auth_headers,
        json={"is_paid": True},
    )
    assert update.status_code == 200
    assert update.json()["is_paid"] is True


def test_unauthorized_income_list(client):
    assert client.get("/api/incomes").status_code == 401
