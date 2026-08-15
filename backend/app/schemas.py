from datetime import date, datetime

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=255)
    password: str = Field(min_length=6, max_length=128)
    captcha_token: str
    captcha_answer: str


class CaptchaResponse(BaseModel):
    question: str
    captcha_token: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class IncomeCreate(BaseModel):
    title: str
    amount: float = Field(gt=0)
    category: str = "Genel"
    income_date: date
    note: str | None = None


class IncomeUpdate(BaseModel):
    title: str | None = None
    amount: float | None = Field(default=None, gt=0)
    category: str | None = None
    income_date: date | None = None
    note: str | None = None


class IncomeResponse(BaseModel):
    id: int
    title: str
    amount: float
    category: str
    income_date: date
    note: str | None

    model_config = {"from_attributes": True}


class ExpenseCreate(BaseModel):
    title: str
    amount: float = Field(gt=0)
    category: str = "Genel"
    expense_date: date
    note: str | None = None


class ExpenseUpdate(BaseModel):
    title: str | None = None
    amount: float | None = Field(default=None, gt=0)
    category: str | None = None
    expense_date: date | None = None
    note: str | None = None


class ExpenseResponse(BaseModel):
    id: int
    title: str
    amount: float
    category: str
    expense_date: date
    note: str | None

    model_config = {"from_attributes": True}


class InvoiceCreate(BaseModel):
    title: str
    amount: float = Field(gt=0)
    due_date: date
    is_paid: bool = False
    note: str | None = None
    institution: str | None = None
    invoice_date: date | None = None
    vat_rate: float | None = Field(default=None, ge=0, le=100)
    vat_amount: float | None = Field(default=None, ge=0)
    tax_base: float | None = Field(default=None, ge=0)
    consumption: float | None = Field(default=None, ge=0)
    contract_end_date: date | None = None


class InvoiceUpdate(BaseModel):
    title: str | None = None
    amount: float | None = Field(default=None, gt=0)
    due_date: date | None = None
    is_paid: bool | None = None
    note: str | None = None
    institution: str | None = None
    invoice_date: date | None = None
    vat_rate: float | None = Field(default=None, ge=0, le=100)
    vat_amount: float | None = Field(default=None, ge=0)
    tax_base: float | None = Field(default=None, ge=0)
    consumption: float | None = Field(default=None, ge=0)
    contract_end_date: date | None = None


class InvoiceResponse(BaseModel):
    id: int
    title: str
    amount: float
    due_date: date
    is_paid: bool
    image_path: str | None
    note: str | None
    institution: str | None = None
    invoice_date: date | None = None
    vat_rate: float | None = None
    vat_amount: float | None = None
    tax_base: float | None = None
    consumption: float | None = None
    contract_end_date: date | None = None

    model_config = {"from_attributes": True}


class OCRResult(BaseModel):
    amount: float | None
    due_date: date | None
    raw_text: str
    confidence: str
    suggested_title: str = "OCR Fatura"
    institution: str | None = None
    invoice_date: date | None = None
    vat_rate: float | None = None
    vat_amount: float | None = None
    tax_base: float | None = None
    consumption: float | None = None
    contract_end_date: date | None = None


class VatSummary(BaseModel):
    total_vat_deductible: float
    total_tax_base: float
    invoice_count: int
    breakdown: list[dict]
    summary_message: str
    contract_alerts: list[str] = []


class MonthlyReport(BaseModel):
    total_income: float
    total_expense: float
    remaining_budget: float
    expense_by_category: dict[str, float]
    unpaid_invoices_total: float
    upcoming_invoices: list[InvoiceResponse]
    overdue_invoices: list[InvoiceResponse] = []
    savings_rate: float = 0
    budget_usage_percent: float = 0
    monthly_budget_limit: float = 50000
    alerts: list[str] = []


class UserSettingsResponse(BaseModel):
    monthly_budget_limit: float
    savings_goal_percent: float

    model_config = {"from_attributes": True}


class UserSettingsUpdate(BaseModel):
    monthly_budget_limit: float | None = Field(default=None, gt=0)
    savings_goal_percent: float | None = Field(default=None, ge=0, le=100)


class DashboardStats(BaseModel):
    total_income: float
    total_expense: float
    remaining_budget: float
    savings_rate: float
    budget_usage_percent: float
    unpaid_invoices: int
    overdue_invoices: int
    upcoming_invoices: int
    alert_count: int


class FamilyMemberCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    monthly_contribution: float = Field(gt=0)
    note: str | None = None


class FamilyMemberUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    monthly_contribution: float | None = Field(default=None, gt=0)
    note: str | None = None


class FamilyMemberResponse(BaseModel):
    id: int
    name: str
    monthly_contribution: float
    note: str | None

    model_config = {"from_attributes": True}


class FamilyBudgetSummary(BaseModel):
    members: list[FamilyMemberResponse]
    total_contribution: float
    member_count: int


class SavingsGoalCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    target_amount: float = Field(gt=0)
    current_amount: float = Field(default=0, ge=0)
    deadline: date
    note: str | None = None


class SavingsGoalUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    target_amount: float | None = Field(default=None, gt=0)
    current_amount: float | None = Field(default=None, ge=0)
    deadline: date | None = None
    note: str | None = None


class SavingsGoalResponse(BaseModel):
    id: int
    title: str
    target_amount: float
    current_amount: float
    deadline: date
    note: str | None
    progress_percent: float = 0
    remaining_amount: float = 0
    days_left: int = 0

    model_config = {"from_attributes": True}


class GoalCoachMessage(BaseModel):
    goal_id: int
    goal_title: str
    message: str
    monthly_save_needed: float
    on_track: bool


class SavingsGoalsSummary(BaseModel):
    goals: list[SavingsGoalResponse]
    coach_messages: list[GoalCoachMessage]
    total_target: float
    total_saved: float


class AIAnalysisRequest(BaseModel):
    prompt: str = "Bu ay bütçemi analiz et"


class AIAnalysisResponse(BaseModel):
    summary: str
    total_income: float
    total_expense: float
    remaining_budget: float
    top_expense_category: str | None
    savings_suggestions: list[str]
    upcoming_invoices: list[str]
    agent_steps: list[str]
