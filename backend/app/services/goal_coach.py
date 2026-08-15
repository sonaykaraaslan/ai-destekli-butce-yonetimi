from datetime import date

from sqlalchemy.orm import Session

from ..models import Expense, Income, SavingsGoal


def enrich_goal(goal: SavingsGoal) -> dict:
    today = date.today()
    remaining = max(0, goal.target_amount - goal.current_amount)
    progress = min(100, round((goal.current_amount / goal.target_amount) * 100, 1)) if goal.target_amount else 0
    days_left = max(0, (goal.deadline - today).days)
    return {
        **goal.__dict__,
        "progress_percent": progress,
        "remaining_amount": remaining,
        "days_left": days_left,
    }


def build_coach_messages(db: Session, user_id: int, goals: list[SavingsGoal]) -> list[dict]:
    today = date.today()
    month_start = today.replace(day=1)

    incomes = db.query(Income).filter(Income.user_id == user_id, Income.income_date >= month_start).all()
    expenses = db.query(Expense).filter(Expense.user_id == user_id, Expense.expense_date >= month_start).all()
    monthly_remaining = sum(i.amount for i in incomes) - sum(e.amount for e in expenses)

    messages: list[dict] = []
    for goal in goals:
        remaining = max(0, goal.target_amount - goal.current_amount)
        days_left = max(1, (goal.deadline - today).days)
        months_left = max(1, days_left / 30)
        monthly_needed = remaining / months_left

        if remaining <= 0:
            message = f"Tebrikler! {goal.title} hedefine ulaştınız."
            on_track = True
        elif monthly_remaining >= monthly_needed:
            message = (
                f"{goal.title} hedefine ulaşmak için bu ay {monthly_needed:,.0f} TL biriktirmen yeterli. "
                f"Mevcut aylık kalan bütçen ({monthly_remaining:,.0f} TL) buna uygun."
            )
            on_track = True
        else:
            cut_needed = monthly_needed - max(0, monthly_remaining)
            message = (
                f"Hedefine ulaşmak için bu ay {cut_needed:,.0f} TL daha az harcaman gerekiyor. "
                f"Aylık hedef birikim: {monthly_needed:,.0f} TL."
            )
            on_track = False

        messages.append(
            {
                "goal_id": goal.id,
                "goal_title": goal.title,
                "message": message,
                "monthly_save_needed": round(monthly_needed, 2),
                "on_track": on_track,
            }
        )

    return messages
