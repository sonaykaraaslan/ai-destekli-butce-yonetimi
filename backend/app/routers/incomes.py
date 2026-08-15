from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import Income, User
from ..schemas import IncomeCreate, IncomeResponse, IncomeUpdate

router = APIRouter(prefix="/incomes", tags=["incomes"])


@router.get("", response_model=list[IncomeResponse])
def list_incomes(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return (
        db.query(Income)
        .filter(Income.user_id == current_user.id)
        .order_by(Income.income_date.desc())
        .all()
    )


@router.post("", response_model=IncomeResponse, status_code=201)
def create_income(
    payload: IncomeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    income = Income(user_id=current_user.id, **payload.model_dump())
    db.add(income)
    db.commit()
    db.refresh(income)
    return income


@router.put("/{income_id}", response_model=IncomeResponse)
def update_income(
    income_id: int,
    payload: IncomeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    income = db.query(Income).filter(Income.id == income_id, Income.user_id == current_user.id).first()
    if not income:
        raise HTTPException(status_code=404, detail="Gelir bulunamadi")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(income, key, value)
    db.commit()
    db.refresh(income)
    return income


@router.delete("/{income_id}", status_code=204)
def delete_income(
    income_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    income = db.query(Income).filter(Income.id == income_id, Income.user_id == current_user.id).first()
    if not income:
        raise HTTPException(status_code=404, detail="Gelir bulunamadi")
    db.delete(income)
    db.commit()
