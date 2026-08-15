import uuid
from datetime import date
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import Invoice, User
from ..schemas import InvoiceResponse, OCRResult
from ..services.ocr_service import extract_invoice_data

router = APIRouter(prefix="/ocr", tags=["ocr"])

UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/scan", response_model=OCRResult)
async def scan_invoice(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    suffix = Path(file.filename or "invoice.jpg").suffix or ".jpg"
    filename = f"{current_user.id}_{uuid.uuid4().hex}{suffix}"
    filepath = UPLOAD_DIR / filename

    content = await file.read()
    filepath.write_bytes(content)

    try:
        return extract_invoice_data(filepath)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Fatura okunamadi. Ilk kullanimda model indiriliyor olabilir, 1-2 dk bekleyip tekrar deneyin. Hata: {exc}",
        ) from exc


@router.post("/scan-and-create", response_model=InvoiceResponse)
async def scan_and_create_invoice(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    suffix = Path(file.filename or "invoice.jpg").suffix or ".jpg"
    filename = f"{current_user.id}_{uuid.uuid4().hex}{suffix}"
    filepath = UPLOAD_DIR / filename

    content = await file.read()
    filepath.write_bytes(content)

    ocr = extract_invoice_data(filepath)
    amount = ocr.amount or 0.0
    due_date = ocr.due_date or date.today()

    invoice = Invoice(
        user_id=current_user.id,
        title="OCR ile eklenen fatura",
        amount=amount,
        due_date=due_date,
        is_paid=False,
        image_path=str(filepath.relative_to(UPLOAD_DIR.parent)),
        note=f"OCR guven: {ocr.confidence}",
    )
    db.add(invoice)
    db.commit()
    db.refresh(invoice)
    return invoice
