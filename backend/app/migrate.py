"""SQLite migration - yeni kolonlari mevcut DB'ye ekler."""

from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine


INVOICE_COLUMNS = [
    ("institution", "VARCHAR(255)"),
    ("invoice_date", "DATE"),
    ("vat_rate", "FLOAT"),
    ("vat_amount", "FLOAT"),
    ("tax_base", "FLOAT"),
    ("consumption", "FLOAT"),
    ("contract_end_date", "DATE"),
]


def run_migrations(engine: Engine) -> None:
    inspector = inspect(engine)
    if "invoices" not in inspector.get_table_names():
        return

    existing = {col["name"] for col in inspector.get_columns("invoices")}
    with engine.begin() as conn:
        for name, col_type in INVOICE_COLUMNS:
            if name not in existing:
                conn.execute(text(f"ALTER TABLE invoices ADD COLUMN {name} {col_type}"))
