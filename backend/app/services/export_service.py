from io import BytesIO

from fpdf import FPDF

from ..models import Invoice


class InvoicePDF(FPDF):
    def header(self):
        self.set_font("Helvetica", "B", 14)
        self.cell(0, 10, "AileFinans - Fatura Raporu", ln=True, align="C")
        self.ln(4)


def generate_invoices_pdf(invoices: list[Invoice]) -> bytes:
    pdf = InvoicePDF()
    pdf.add_page()
    pdf.set_font("Helvetica", size=9)

    headers = ["Tarih", "Kurum", "Baslik", "Tutar", "KDV", "Matrah", "Tuketim", "Odeme"]
    col_widths = [22, 28, 30, 22, 18, 22, 20, 18]

    for i, header in enumerate(headers):
        pdf.cell(col_widths[i], 8, header, border=1, align="C")
    pdf.ln()

    for inv in invoices:
        row = [
            str(inv.due_date),
            (inv.institution or "-")[:14],
            inv.title[:16],
            f"{inv.amount:.0f}",
            f"{inv.vat_amount:.0f}" if inv.vat_amount else "-",
            f"{inv.tax_base:.0f}" if inv.tax_base else "-",
            f"{inv.consumption:.0f}" if inv.consumption else "-",
            "Odendi" if inv.is_paid else "Bekliyor",
        ]
        for i, value in enumerate(row):
            pdf.cell(col_widths[i], 7, value, border=1)
        pdf.ln()

    buffer = BytesIO()
    pdf.output(buffer)
    return buffer.getvalue()


def generate_invoices_csv(invoices: list[Invoice]) -> str:
    lines = ["Tarih,Kurum,Baslik,Tutar,KDV Orani,KDV Tutari,Matrah,Tuketim,Son Odeme,Taahhut Bitis,Odeme Durumu"]
    for inv in invoices:
        lines.append(
            ",".join([
                str(inv.invoice_date or inv.due_date),
                f'"{inv.institution or ""}"',
                f'"{inv.title}"',
                str(inv.amount),
                str(inv.vat_rate or ""),
                str(inv.vat_amount or ""),
                str(inv.tax_base or ""),
                str(inv.consumption or ""),
                str(inv.due_date),
                str(inv.contract_end_date or ""),
                "Odendi" if inv.is_paid else "Bekliyor",
            ])
        )
    return "\n".join(lines)
