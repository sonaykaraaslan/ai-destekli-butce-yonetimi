from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import User
from ..schemas import AIAnalysisRequest, AIAnalysisResponse
from ..services.agents.orchestrator import run_multi_agent_analysis

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/analyze", response_model=AIAnalysisResponse)
def analyze_budget(
    payload: AIAnalysisRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return run_multi_agent_analysis(db, current_user.id, payload.prompt)
