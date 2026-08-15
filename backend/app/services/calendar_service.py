from datetime import date, datetime, timedelta


def generate_invoice_ics(
    title: str,
    due_date: date,
    amount: float,
    institution: str | None = None,
    description: str | None = None,
) -> str:
    uid = f"budgetai-{due_date.isoformat()}-{title.replace(' ', '-')[:20]}@budgetai.local"
    dtstamp = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
    due_dt = due_date.strftime("%Y%m%d")
    remind_dt = (due_date - timedelta(days=1)).strftime("%Y%m%d")

    summary = f"Fatura: {title}"
    if institution:
        summary = f"{institution} - {title}"

    desc = description or f"Odenecek tutar: {amount:.2f} TL"
    desc = desc.replace("\n", "\\n")

    return f"""BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//AileFinans//Fatura Hatirlatici//TR
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:{uid}
DTSTAMP:{dtstamp}
DTSTART;VALUE=DATE:{due_dt}
SUMMARY:{summary}
DESCRIPTION:{desc}
STATUS:CONFIRMED
BEGIN:VALARM
TRIGGER:-P1D
ACTION:DISPLAY
DESCRIPTION:Yarin fatura son odeme gunu: {title}
END:VALARM
BEGIN:VALARM
TRIGGER:-PT9H
ACTION:DISPLAY
DESCRIPTION:Bugun fatura son odeme gunu: {title}
END:VALARM
END:VEVENT
END:VCALENDAR
"""
