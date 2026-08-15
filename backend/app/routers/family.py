from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import FamilyMember, User
from ..schemas import (
    FamilyBudgetSummary,
    FamilyMemberCreate,
    FamilyMemberResponse,
    FamilyMemberUpdate,
)

router = APIRouter(prefix="/family", tags=["family"])


def _build_summary(members: list[FamilyMember]) -> FamilyBudgetSummary:
    total = sum(member.monthly_contribution for member in members)
    return FamilyBudgetSummary(
        members=[FamilyMemberResponse.model_validate(m) for m in members],
        total_contribution=total,
        member_count=len(members),
    )


@router.get("", response_model=FamilyBudgetSummary)
def get_family_budget(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    members = (
        db.query(FamilyMember)
        .filter(FamilyMember.user_id == current_user.id)
        .order_by(FamilyMember.monthly_contribution.desc())
        .all()
    )
    return _build_summary(members)


@router.post("", response_model=FamilyMemberResponse, status_code=201)
def add_family_member(
    payload: FamilyMemberCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    member = FamilyMember(user_id=current_user.id, **payload.model_dump())
    db.add(member)
    db.commit()
    db.refresh(member)
    return member


@router.put("/{member_id}", response_model=FamilyMemberResponse)
def update_family_member(
    member_id: int,
    payload: FamilyMemberUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    member = db.query(FamilyMember).filter(FamilyMember.id == member_id, FamilyMember.user_id == current_user.id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Aile uyesi bulunamadi")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(member, key, value)
    db.commit()
    db.refresh(member)
    return member


@router.delete("/{member_id}", status_code=204)
def delete_family_member(
    member_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    member = db.query(FamilyMember).filter(FamilyMember.id == member_id, FamilyMember.user_id == current_user.id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Aile uyesi bulunamadi")
    db.delete(member)
    db.commit()
