from datetime import date, timedelta

from sqlalchemy.orm import Session

from ...models import Expense, Income, Invoice


def plan_tasks(prompt: str) -> list[str]:
    return [
        "Gelirleri incele",
        "Giderleri analiz et",
        "Faturalari kontrol et",
        "Tasarruf onerileri olustur",
        f"Kullanici istegi: {prompt}",
    ]


def analyze_expenses(expenses: list[Expense], total_income: float) -> dict:
    if not expenses:
        return {"message": "Bu ay gider kaydi yok.", "top_category": None, "details": []}

    by_category: dict[str, float] = {}
    for expense in expenses:
        by_category[expense.category] = by_category.get(expense.category, 0) + expense.amount

    top_category = max(by_category, key=by_category.get)
    top_amount = by_category[top_category]
    ratio = (top_amount / total_income * 100) if total_income else 0

    details = [
        f"{cat}: {amount:,.0f} TL (%{(amount / sum(by_category.values()) * 100) if by_category else 0:.0f})"
        for cat, amount in sorted(by_category.items(), key=lambda x: x[1], reverse=True)
    ]

    return {
        "message": f"{top_category} harcamalari toplam butcenin %{ratio:.0f}'ini olusturuyor.",
        "top_category": top_category,
        "details": details,
    }


def analyze_budget(total_income: float, total_expense: float) -> dict:
    remaining = total_income - total_expense
    usage = (total_expense / total_income * 100) if total_income else 0
    risk = "dusuk"
    if usage >= 90:
        risk = "yuksek"
    elif usage >= 75:
        risk = "orta"

    return {
        "remaining": remaining,
        "usage_percent": usage,
        "risk": risk,
        "message": f"Bu ay butcenin %{usage:.0f}'i kullanilmis. Kalan: {remaining:,.0f} TL",
    }


def analyze_invoices(invoices: list[Invoice]) -> dict:
    today = date.today()
    upcoming = [inv for inv in invoices if not inv.is_paid and inv.due_date <= today + timedelta(days=10)]
    total = sum(inv.amount for inv in upcoming)

    messages = [
        f"{inv.title}: {inv.amount:,.0f} TL ({inv.due_date.strftime('%d.%m.%Y')})"
        for inv in upcoming
    ]
    if not messages:
        messages = ["Onumuzdeki 10 gun icin odenmemis fatura yok."]

    return {
        "upcoming_total": total,
        "messages": messages,
        "message": f"Onumuzdeki 10 gun icinde toplam {total:,.0f} TL odeme bulunmaktadir.",
    }


def review_and_summarize(
    expense_result: dict,
    budget_result: dict,
    invoice_result: dict,
    total_income: float,
    total_expense: float,
) -> tuple[str, list[str]]:
    suggestions: list[str] = []

    top_category = expense_result.get("top_category")
    if top_category == "Eglence":
        suggestions.append("Eglence harcamalarinda %20 azaltim yapilabilir.")
    if top_category == "Market":
        suggestions.append("Market alisverislerinde haftalik limit belirleyebilirsiniz.")
    if budget_result["usage_percent"] > 80:
        suggestions.append("Butce kullanimi yuksek; zorunlu olmayan harcamalari erteleyin.")
    if not suggestions:
        suggestions.append("Harcama dagiliminiz dengeli gorunuyor.")

    summary = (
        f"Toplam gelir: {total_income:,.0f} TL. "
        f"Toplam gider: {total_expense:,.0f} TL. "
        f"Kalan butce: {budget_result['remaining']:,.0f} TL. "
        f"{expense_result.get('message', '')} "
        f"{invoice_result.get('message', '')}"
    )
    return summary, suggestions
