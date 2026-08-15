from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import Invoice, User
from ..schemas import InvoiceCreate, InvoiceResponse, InvoiceUpdate
from ..services.calendar_service import generate_invoice_ics

router = APIRouter(prefix="/invoices", tags=["invoices"])


@router.get("", response_model=list[InvoiceResponse])
def list_invoices(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return (
        db.query(Invoice)
        .filter(Invoice.user_id == current_user.id)
        .order_by(Invoice.due_date.asc())
        .all()
    )


@router.post("", response_model=InvoiceResponse, status_code=201)
def create_invoice(
    payload: InvoiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    invoice = Invoice(user_id=current_user.id, **payload.model_dump())
    db.add(invoice)
    db.commit()
    db.refresh(invoice)
    return invoice


@router.put("/{invoice_id}", response_model=InvoiceResponse)
def update_invoice(
    invoice_id: int,
    payload: InvoiceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id, Invoice.user_id == current_user.id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Fatura bulunamadi")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(invoice, key, value)
    db.commit()
    db.refresh(invoice)
    return invoice


@router.delete("/{invoice_id}", status_code=204)
def delete_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id, Invoice.user_id == current_user.id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Fatura bulunamadi")
    db.delete(invoice)
    db.commit()


@router.get("/{invoice_id}/calendar.ics")
def download_calendar(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id, Invoice.user_id == current_user.id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Fatura bulunamadi")

    ics = generate_invoice_ics(
        title=invoice.title,
        due_date=invoice.due_date,
        amount=invoice.amount,
        institution=invoice.institution,
        description=f"Tutar: {invoice.amount:.2f} TL | KDV: {invoice.vat_amount or 0:.2f} TL",
    )
    filename = f"fatura-{invoice.id}-hatirlatici.ics"
    return Response(
        content=ics,
        media_type="text/calendar",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
