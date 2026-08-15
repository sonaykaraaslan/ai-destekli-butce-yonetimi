from datetime import date

from sqlalchemy.orm import Session

from ...models import Expense, Income, Invoice
from ...schemas import AIAnalysisResponse
from .analysis import (
    analyze_budget,
    analyze_expenses,
    analyze_invoices,
    plan_tasks,
    review_and_summarize,
)


def run_multi_agent_analysis(db: Session, user_id: int, prompt: str) -> AIAnalysisResponse:
    today = date.today()
    month_start = today.replace(day=1)

    agent_steps: list[str] = []

    # Planner Agent
    tasks = plan_tasks(prompt)
    agent_steps.append(f"Planner Agent: {len(tasks)} alt gorev olusturuldu.")

    incomes = db.query(Income).filter(Income.user_id == user_id, Income.income_date >= month_start).all()
    expenses = db.query(Expense).filter(Expense.user_id == user_id, Expense.expense_date >= month_start).all()
    invoices = db.query(Invoice).filter(Invoice.user_id == user_id).all()

    total_income = sum(i.amount for i in incomes)
    total_expense = sum(e.amount for e in expenses)

    # Expense Agent
    expense_result = analyze_expenses(expenses, total_income)
    agent_steps.append(f"Expense Agent: {expense_result['message']}")

    # Budget Agent
    budget_result = analyze_budget(total_income, total_expense)
    agent_steps.append(f"Budget Agent: {budget_result['message']}")

    # Invoice Agent
    invoice_result = analyze_invoices(invoices)
    agent_steps.append(f"Invoice Agent: {invoice_result['message']}")

    # Reviewer Agent
    summary, suggestions = review_and_summarize(
        expense_result, budget_result, invoice_result, total_income, total_expense
    )
    agent_steps.append("Reviewer Agent: Tum ciktilar dogrulandi ve birlestirildi.")

    return AIAnalysisResponse(
        summary=summary,
        total_income=total_income,
        total_expense=total_expense,
        remaining_budget=budget_result["remaining"],
        top_expense_category=expense_result.get("top_category"),
        savings_suggestions=suggestions,
        upcoming_invoices=invoice_result["messages"],
        agent_steps=agent_steps,
    )
