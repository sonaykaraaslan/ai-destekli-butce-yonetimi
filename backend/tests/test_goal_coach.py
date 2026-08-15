from datetime import date, timedelta

from app.models import SavingsGoal
from app.services.goal_coach import enrich_goal


def test_enrich_goal_progress():
    goal = SavingsGoal(
        user_id=1,
        title="Laptop",
        target_amount=10000,
        current_amount=7500,
        deadline=date.today() + timedelta(days=30),
    )
    data = enrich_goal(goal)
    assert data["progress_percent"] == 75.0
    assert data["remaining_amount"] == 2500
    assert data["days_left"] >= 29


def test_enrich_goal_completed():
    goal = SavingsGoal(
        user_id=1,
        title="Fon",
        target_amount=5000,
        current_amount=6000,
        deadline=date.today() + timedelta(days=10),
    )
    data = enrich_goal(goal)
    assert data["progress_percent"] == 100
    assert data["remaining_amount"] == 0
