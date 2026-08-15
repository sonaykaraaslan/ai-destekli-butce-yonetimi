from datetime import date, timedelta

from sqlalchemy.orm import Session

from .auth import hash_password
from .database import SessionLocal
from .models import Category, Expense, FamilyMember, Income, Invoice, SavingsGoal, User


def seed_family_members(db: Session, user_id: int) -> None:
    existing = db.query(FamilyMember).filter(FamilyMember.user_id == user_id).first()
    if existing:
        return

    db.add_all(
        [
            FamilyMember(user_id=user_id, name="Ana Gelir", monthly_contribution=25000, note="Yetişkin — birincil maaş"),
            FamilyMember(user_id=user_id, name="İkinci Gelir", monthly_contribution=20000, note="Yetişkin — ikincil gelir"),
            FamilyMember(user_id=user_id, name="Yan Gelir", monthly_contribution=5000, note="Yetişkin — ek katkı / freelance"),
        ]
    )
    db.commit()


def migrate_legacy_family_labels(db: Session) -> None:
    legacy = {
        "Baba": ("Ana Gelir", "Yetişkin — birincil maaş"),
        "Anne": ("İkinci Gelir", "Yetişkin — ikincil gelir"),
        "Çocuk": ("Yan Gelir", "Yetişkin — ek katkı / freelance"),
    }
    for old_name, (new_name, note) in legacy.items():
        members = db.query(FamilyMember).filter(FamilyMember.name == old_name).all()
        for member in members:
            member.name = new_name
            member.note = note
    db.commit()


def migrate_demo_user(db: Session) -> None:
    for email in ("demo@demo.com", "sonay@sonay.com"):
        user = db.query(User).filter(User.email == email).first()
        if user and (user.full_name or "").strip().lower() in ("demo kullanici", "demo kullanıcı"):
            user.full_name = "Sonay Karaaslan"
    db.commit()


def ensure_sonay_demo_account(db: Session) -> None:
    if db.query(User).filter(User.email == "sonay@sonay.com").first():
        return
    demo = db.query(User).filter(User.email == "demo@demo.com").first()
    if not demo:
        return

    user = User(
        email="sonay@sonay.com",
        full_name="Sonay Karaaslan",
        hashed_password=demo.hashed_password,
    )
    db.add(user)
    db.flush()
    seed_family_members(db, user.id)
    seed_savings_goals(db, user.id)
    db.commit()


def seed_demo_data(db: Session) -> None:
    existing = (
        db.query(User)
        .filter(User.email.in_(["demo@demo.com", "sonay@sonay.com"]))
        .first()
    )
    if existing:
        return

    user = User(
        email="sonay@sonay.com",
        full_name="Sonay Karaaslan",
        hashed_password=hash_password("demo123"),
    )
    db.add(user)
    db.flush()

    categories = [
        Category(user_id=user.id, name="Maas", type="income"),
        Category(user_id=user.id, name="Kira", type="expense"),
        Category(user_id=user.id, name="Market", type="expense"),
        Category(user_id=user.id, name="Ulasim", type="expense"),
        Category(user_id=user.id, name="Eglence", type="expense"),
    ]
    db.add_all(categories)

    today = date.today()
    month_start = today.replace(day=1)

    db.add(
        Income(
            user_id=user.id,
            title="Maas",
            amount=40000,
            category="Maas",
            income_date=month_start,
        )
    )

    expenses = [
        ("Kira", 12000, "Kira"),
        ("Market", 5000, "Market"),
        ("Ulasim", 3000, "Ulasim"),
        ("Eglence", 4000, "Eglence"),
    ]
    for title, amount, category in expenses:
        db.add(
            Expense(
                user_id=user.id,
                title=title,
                amount=amount,
                category=category,
                expense_date=today - timedelta(days=5),
            )
        )

    db.add_all(
        [
            Invoice(
                user_id=user.id,
                title="Elektrik",
                institution="Boğaziçi Elektrik",
                amount=1200,
                due_date=today + timedelta(days=5),
                invoice_date=month_start,
                vat_rate=20,
                vat_amount=200,
                tax_base=1000,
                consumption=456.8,
                is_paid=False,
            ),
            Invoice(
                user_id=user.id,
                title="Internet",
                institution="Türk Telekom",
                amount=800,
                due_date=today + timedelta(days=8),
                invoice_date=month_start,
                vat_rate=20,
                vat_amount=133.33,
                tax_base=666.67,
                contract_end_date=today + timedelta(days=10),
                is_paid=False,
            ),
        ]
    )

    db.commit()
    seed_family_members(db, user.id)


def ensure_family_seed(db: Session) -> None:
    users = db.query(User).all()
    for user in users:
        seed_family_members(db, user.id)
    migrate_legacy_family_labels(db)


def seed_savings_goals(db: Session, user_id: int) -> None:
    existing = db.query(SavingsGoal).filter(SavingsGoal.user_id == user_id).first()
    if existing:
        return

    today = date.today()
    db.add_all(
        [
            SavingsGoal(
                user_id=user_id,
                title="Laptop Hedefi",
                target_amount=25000,
                current_amount=18000,
                deadline=today + timedelta(days=60),
                note="Yeni laptop almak icin",
            ),
            SavingsGoal(
                user_id=user_id,
                title="3 Ayda 15.000 TL",
                target_amount=15000,
                current_amount=6200,
                deadline=today + timedelta(days=75),
                note="Acil durum fonu",
            ),
        ]
    )
    db.commit()


def ensure_goals_seed(db: Session) -> None:
    users = db.query(User).all()
    for user in users:
        seed_savings_goals(db, user.id)


def run_seed() -> None:
    db = SessionLocal()
    try:
        seed_demo_data(db)
        print("Demo verileri olusturuldu.")
        print("Giris: sonay@sonay.com / demo123")
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
