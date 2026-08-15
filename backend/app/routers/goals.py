from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import SavingsGoal, User
from ..schemas import (
    GoalCoachMessage,
    SavingsGoalCreate,
    SavingsGoalResponse,
    SavingsGoalUpdate,
    SavingsGoalsSummary,
)
from ..services.goal_coach import build_coach_messages, enrich_goal

router = APIRouter(prefix="/goals", tags=["goals"])


def _to_response(goal: SavingsGoal) -> SavingsGoalResponse:
    data = enrich_goal(goal)
    return SavingsGoalResponse(
        id=goal.id,
        title=goal.title,
        target_amount=goal.target_amount,
        current_amount=goal.current_amount,
        deadline=goal.deadline,
        note=goal.note,
        progress_percent=data["progress_percent"],
        remaining_amount=data["remaining_amount"],
        days_left=data["days_left"],
    )


@router.get("", response_model=SavingsGoalsSummary)
def list_goals(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    goals = (
        db.query(SavingsGoal)
        .filter(SavingsGoal.user_id == current_user.id)
        .order_by(SavingsGoal.deadline.asc())
        .all()
    )
    responses = [_to_response(g) for g in goals]
    coach = build_coach_messages(db, current_user.id, goals)
    return SavingsGoalsSummary(
        goals=responses,
        coach_messages=[GoalCoachMessage(**m) for m in coach],
        total_target=sum(g.target_amount for g in goals),
        total_saved=sum(g.current_amount for g in goals),
    )


@router.post("", response_model=SavingsGoalResponse, status_code=201)
def create_goal(
    payload: SavingsGoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    goal = SavingsGoal(user_id=current_user.id, **payload.model_dump())
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return _to_response(goal)


@router.put("/{goal_id}", response_model=SavingsGoalResponse)
def update_goal(
    goal_id: int,
    payload: SavingsGoalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    goal = db.query(SavingsGoal).filter(SavingsGoal.id == goal_id, SavingsGoal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Hedef bulunamadi")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(goal, key, value)
    db.commit()
    db.refresh(goal)
    return _to_response(goal)


@router.delete("/{goal_id}", status_code=204)
def delete_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    goal = db.query(SavingsGoal).filter(SavingsGoal.id == goal_id, SavingsGoal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Hedef bulunamadi")
    db.delete(goal)
    db.commit()
