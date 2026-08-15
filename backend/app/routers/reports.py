from datetime import date, timedelta
from io import StringIO

from fastapi import APIRouter, Depends, Query
from fastapi.responses import Response, StreamingResponse
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import Expense, Income, Invoice, User, UserSettings
from ..schemas import DashboardStats, InvoiceResponse, MonthlyReport, VatSummary
from ..services.export_service import generate_invoices_csv, generate_invoices_pdf

router = APIRouter(prefix="/reports", tags=["reports"])


def _get_settings(db: Session, user_id: int) -> UserSettings:
    settings = db.query(UserSettings).filter(UserSettings.user_id == user_id).first()
    if not settings:
        settings = UserSettings(user_id=user_id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


def _build_alerts(
    total_expense: float,
    budget_limit: float,
    savings_rate: float,
    savings_goal: float,
    overdue_count: int,
    upcoming_count: int,
) -> list[str]:
    alerts: list[str] = []
    if budget_limit and total_expense > budget_limit:
        alerts.append("Aylik butce limitini astiniz.")
    elif budget_limit and total_expense > budget_limit * 0.85:
        alerts.append("Butce limitine yaklasiyorsunuz.")
    if savings_rate < savings_goal:
        alerts.append(f"Tasarruf orani hedefin (%{savings_goal:.0f}) altinda.")
    if overdue_count:
        alerts.append(f"{overdue_count} adet gecikmis fatura var.")
    if upcoming_count:
        alerts.append(f"{upcoming_count} fatura 10 gun icinde odenecek.")
    if not alerts:
        alerts.append("Finansal durumunuz stabil gorunuyor.")
    return alerts


@router.get("/monthly", response_model=MonthlyReport)
def monthly_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = date.today()
    month_start = today.replace(day=1)
    settings = _get_settings(db, current_user.id)

    incomes = (
        db.query(Income)
        .filter(Income.user_id == current_user.id, Income.income_date >= month_start)
        .all()
    )
    expenses = (
        db.query(Expense)
        .filter(Expense.user_id == current_user.id, Expense.expense_date >= month_start)
        .all()
    )
    invoices = db.query(Invoice).filter(Invoice.user_id == current_user.id).all()

    total_income = sum(i.amount for i in incomes)
    total_expense = sum(e.amount for e in expenses)
    remaining = total_income - total_expense
    savings_rate = (remaining / total_income * 100) if total_income else 0
    budget_usage = (total_expense / settings.monthly_budget_limit * 100) if settings.monthly_budget_limit else 0

    expense_by_category: dict[str, float] = {}
    for expense in expenses:
        expense_by_category[expense.category] = expense_by_category.get(expense.category, 0) + expense.amount

    upcoming = [inv for inv in invoices if not inv.is_paid and today <= inv.due_date <= today + timedelta(days=10)]
    overdue = [inv for inv in invoices if not inv.is_paid and inv.due_date < today]
    unpaid_total = sum(inv.amount for inv in invoices if not inv.is_paid)

    alerts = _build_alerts(
        total_expense,
        settings.monthly_budget_limit,
        savings_rate,
        settings.savings_goal_percent,
        len(overdue),
        len(upcoming),
    )

    return MonthlyReport(
        total_income=total_income,
        total_expense=total_expense,
        remaining_budget=remaining,
        expense_by_category=expense_by_category,
        unpaid_invoices_total=unpaid_total,
        upcoming_invoices=[InvoiceResponse.model_validate(inv) for inv in upcoming],
        overdue_invoices=[InvoiceResponse.model_validate(inv) for inv in overdue],
        savings_rate=round(savings_rate, 1),
        budget_usage_percent=round(min(budget_usage, 100), 1),
        monthly_budget_limit=settings.monthly_budget_limit,
        alerts=alerts,
    )


@router.get("/stats", response_model=DashboardStats)
def dashboard_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    report = monthly_report(db, current_user)
    return DashboardStats(
        total_income=report.total_income,
        total_expense=report.total_expense,
        remaining_budget=report.remaining_budget,
        savings_rate=report.savings_rate,
        budget_usage_percent=report.budget_usage_percent,
        unpaid_invoices=int(report.unpaid_invoices_total > 0),
        overdue_invoices=len(report.overdue_invoices),
        upcoming_invoices=len(report.upcoming_invoices),
        alert_count=len(report.alerts),
    )


@router.get("/export")
def export_csv(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    today = date.today()
    month_start = today.replace(day=1)

    incomes = (
        db.query(Income)
        .filter(Income.user_id == current_user.id, Income.income_date >= month_start)
        .all()
    )
    expenses = (
        db.query(Expense)
        .filter(Expense.user_id == current_user.id, Expense.expense_date >= month_start)
        .all()
    )

    output = StringIO()
    output.write("Tur,Baslik,Kategori,Tutar,Tarih,Not\n")
    for income in incomes:
        note = (income.note or "").replace(",", " ")
        output.write(f"Gelir,{income.title},{income.category},{income.amount},{income.income_date},{note}\n")
    for expense in expenses:
        note = (expense.note or "").replace(",", " ")
        output.write(f"Gider,{expense.title},{expense.category},{expense.amount},{expense.expense_date},{note}\n")

    output.seek(0)
    filename = f"butce-raporu-{today.strftime('%Y-%m')}.csv"
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/vat-summary", response_model=VatSummary)
def vat_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    today = date.today()
    month_start = today.replace(day=1)
    invoices = (
        db.query(Invoice)
        .filter(Invoice.user_id == current_user.id, Invoice.due_date >= month_start)
        .all()
    )

    total_vat = sum(inv.vat_amount or 0 for inv in invoices)
    total_base = sum(inv.tax_base or 0 for inv in invoices)
    breakdown = [
        {
            "title": inv.title,
            "institution": inv.institution,
            "amount": inv.amount,
            "vat_rate": inv.vat_rate,
            "vat_amount": inv.vat_amount,
            "tax_base": inv.tax_base,
            "consumption": inv.consumption,
        }
        for inv in invoices
        if inv.vat_amount
    ]

    contract_alerts: list[str] = []
    for inv in invoices:
        if inv.contract_end_date:
            days = (inv.contract_end_date - today).days
            if 0 <= days <= 14:
                contract_alerts.append(
                    f"{inv.title} taahhudunuz {days} gun icinde bitiyor. Paketinizi yenilemeyi degerlendirin."
                )

    message = (
        f"Bu ay toplam {total_vat:,.0f} TL KDV gider olarak dusulebilir."
        if total_vat
        else "Bu ay KDV kayitli fatura bulunmuyor. OCR ile fatura yukleyin."
    )

    return VatSummary(
        total_vat_deductible=round(total_vat, 2),
        total_tax_base=round(total_base, 2),
        invoice_count=len(invoices),
        breakdown=breakdown,
        summary_message=message,
        contract_alerts=contract_alerts,
    )


@router.get("/invoices/export")
def export_invoices(
    format: str = Query("csv", pattern="^(csv|pdf)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    invoices = (
        db.query(Invoice)
        .filter(Invoice.user_id == current_user.id)
        .order_by(Invoice.due_date.desc())
        .all()
    )
    today = date.today().strftime("%Y-%m")

    if format == "pdf":
        content = generate_invoices_pdf(invoices)
        return Response(
            content=content,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="faturalar-{today}.pdf"'},
        )

    csv_content = generate_invoices_csv(invoices)
    return StreamingResponse(
        iter([csv_content]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="faturalar-{today}.csv"'},
    )
