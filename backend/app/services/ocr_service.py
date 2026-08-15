import re
import sys
import unicodedata
from datetime import date
from pathlib import Path

import numpy as np
from dateutil import parser as date_parser
from PIL import Image, ImageEnhance, ImageFilter, ImageOps

from ..schemas import OCRResult

_reader = None


def _silence_easyocr_download_bar() -> None:
    try:
        import easyocr.utils as easyocr_utils

        def _noop_progress(count, block_size, total_size, prefix="Progress"):
            return None

        easyocr_utils.progress_hook = _noop_progress
    except Exception:
        pass


def _get_reader():
    global _reader
    if _reader is None:
        _silence_easyocr_download_bar()
        import easyocr

        _reader = easyocr.Reader(["tr", "en"], gpu=False, verbose=False)
    return _reader


def prewarm_ocr_reader() -> None:
    try:
        _get_reader()
    except Exception as exc:
        print(f"OCR hazirlik uyarisi: {exc}", file=sys.stderr)


def _preprocess_pil_image(img: Image.Image) -> Image.Image:
    img = ImageOps.exif_transpose(img)
    img = img.convert("L")

    min_side = 1200
    if max(img.size) < min_side:
        scale = min_side / max(img.size)
        img = img.resize((int(img.size[0] * scale), int(img.size[1] * scale)), Image.LANCZOS)

    img = ImageEnhance.Contrast(img).enhance(2.0)
    img = ImageEnhance.Sharpness(img).enhance(1.6)
    img = img.filter(ImageFilter.MedianFilter(size=3))

    max_side = 2400
    if max(img.size) > max_side:
        ratio = max_side / max(img.size)
        img = img.resize((int(img.size[0] * ratio), int(img.size[1] * ratio)), Image.LANCZOS)

    return img


def _pil_to_array(img: Image.Image) -> np.ndarray:
    return np.array(_preprocess_pil_image(img))


def _get_scan_regions(image_path: Path) -> list[np.ndarray]:
    base = Image.open(image_path)
    processed = _preprocess_pil_image(base)
    regions = [np.array(processed)]

    width, height = processed.size
    crops = [
        (0, 0, width, int(height * 0.42)),
        (0, int(height * 0.08), width, int(height * 0.55)),
    ]
    for box in crops:
        crop = processed.crop(box)
        if crop.size[0] > 100 and crop.size[1] > 100:
            regions.append(np.array(crop))

    return regions


def _read_text_from_image(reader, image: np.ndarray) -> str:
    lines: list[str] = []

    paragraph_results = reader.readtext(image, detail=0, paragraph=True)
    if isinstance(paragraph_results, list):
        lines.extend(str(item).strip() for item in paragraph_results if item)

    detailed_results = reader.readtext(image, detail=1, paragraph=False)
    detailed_results.sort(key=lambda item: (item[0][0][1], item[0][0][0]))
    lines.extend(str(item[1]).strip() for item in detailed_results if len(item) > 1 and item[1])

    deduped: list[str] = []
    seen: set[str] = set()
    for line in lines:
        key = line.lower()
        if line and key not in seen:
            seen.add(key)
            deduped.append(line)

    return "\n".join(deduped)


def _normalize_text(text: str) -> str:
    normalized = unicodedata.normalize("NFKD", text)
    normalized = "".join(ch for ch in normalized if not unicodedata.combining(ch))
    normalized = normalized.replace("₺", " TL").replace("TRY", "TL")
    normalized = normalized.replace("O DENECEK", "ODENECEK")
    normalized = normalized.replace("0 DENECEK", "ODENECEK")
    return normalized


def _fix_ocr_date_string(raw: str) -> str:
    fixed = raw.strip()
    fixed = re.sub(r"(\d{2}),(\d{2})\.(\d{4})", r"\1.\2.\3", fixed)
    fixed = re.sub(r"(\d{2})\.(\d{2}),(\d{4})", r"\1.\2.\3", fixed)
    fixed = re.sub(r"(\d{2}),(\d{2}),(\d{4})", r"\1.\2.\3", fixed)
    fixed = re.sub(r"(\d{2})/(\d{2})/(\d{4})", r"\1.\2.\3", fixed)
    return fixed


def _to_float(raw: str) -> float | None:
    cleaned = raw.strip().replace(" ", "")
    if not cleaned:
        return None

    if "," in cleaned and "." in cleaned:
        cleaned = cleaned.replace(".", "").replace(",", ".")
    elif "," in cleaned:
        parts = cleaned.split(",")
        if len(parts[-1]) == 2:
            cleaned = cleaned.replace(",", ".")
        else:
            cleaned = cleaned.replace(",", "")

    try:
        value = float(cleaned)
    except ValueError:
        return None
    return value if 0 < value < 10_000_000 else None


def _context_window(text: str, start: int, end: int, radius: int = 40) -> str:
    return text[max(0, start - radius): min(len(text), end + radius)].lower()


def _is_noise_amount(context: str) -> bool:
    noise_keywords = [
        "kwh",
        "kw/g",
        "kw ",
        "trafo",
        "tuketim bedeli",
        "sayac",
        "okuma donemi",
        "sonraki okuma",
        "birim fiyat",
        "endeks",
        "aktif t",
        "reaktif",
        "ort. tuk",
    ]
    return any(keyword in context for keyword in noise_keywords)


def _parse_amount(text: str) -> float | None:
    normalized = _normalize_text(text)
    lowered = normalized.lower()
    scored: list[tuple[float, int]] = []

    patterns = [
        (r"([\d]{1,3}(?:\.\d{3})*,\d{2})\s*(?:tl\s*)?odenecek\s*tutar", 100),
        (r"odenecek\s*tutar\s*[:\s-]*([\d]{1,3}(?:\.\d{3})*,\d{2})", 100),
        (r"([\d]+,\d{2})\s*odenecek\s*tutar", 98),
        (r"fatura\s*tutar(?:i|n|ı)?\s*[:\s-]*([\d]{1,4}(?:\.\d{3})*,\d{2})", 96),
        (r"([\d]{1,4}(?:\.\d{3})*,\d{2})\s*tl", 88),
        (r"([\d]{1,4},\d{2})\s*tl", 85),
        (r"tahakkuk\s*[:\s-]*([\d]{1,3}(?:\.\d{3})*,\d{2})", 85),
        (r"genel\s*toplam\s*[:\s-]*([\d]{1,3}(?:\.\d{3})*,\d{2})", 80),
    ]

    for pattern, score in patterns:
        for match in re.finditer(pattern, lowered):
            value = _to_float(match.group(1))
            if not value or value < 5:
                continue
            context = _context_window(lowered, match.start(), match.end())
            if _is_noise_amount(context) and score < 90:
                continue
            scored.append((value, score))

    if not scored:
        return None

    scored.sort(key=lambda item: (-item[1], -item[0]))
    return scored[0][0]


def _parse_single_date(raw: str) -> date | None:
    fixed = _fix_ocr_date_string(raw)
    try:
        parsed = date_parser.parse(fixed, dayfirst=True, fuzzy=False)
        if parsed.year < 2000 or parsed.year > 2100:
            return None
        return parsed.date()
    except (ValueError, OverflowError):
        return None


def _extract_date_candidates(text: str) -> list[tuple[date, int]]:
    normalized = _normalize_text(text)
    lowered = normalized.lower()
    candidates: list[tuple[date, int]] = []

    due_patterns = [
        (r"(?:son\s*odeme\s*tarih(?:i|ı)?|vade\s*tarih(?:i|ı)?|son\s*odeme)[^\d\n]{0,40}(\d{2}[.,/]\d{2}[.,/]\d{4})", 100),
        (r"(?:fatura\s*tutar(?:i|n|ı)?)[^\d\n]{0,80}(\d{2}[.,/]\d{2}[.,/]\d{4})", 70),
        (r"(\d{2}[.,/]\d{2}[.,/]\d{4})", 30),
    ]

    for pattern, score in due_patterns:
        for match in re.finditer(pattern, lowered, re.IGNORECASE):
            context = _context_window(lowered, match.start(), match.end(), radius=25)
            if any(skip in context for skip in ["okuma gunu", "okuma donemi", "sonraki okuma", "fatura tarih"]):
                if score < 100:
                    continue
            parsed = _parse_single_date(match.group(1))
            if parsed:
                candidates.append((parsed, score))

    return candidates


def _parse_date(text: str, amount: float | None = None) -> date | None:
    candidates = _extract_date_candidates(text)

    if amount is not None:
        amount_token = str(int(amount)) if float(amount).is_integer() else str(amount)
        amount_idx = text.lower().find(amount_token)
        if amount_idx >= 0:
            window = text[amount_idx: amount_idx + 120]
            near_match = re.search(r"(\d{2}[.,/]\d{2}[.,/]\d{4})", window)
            if near_match:
                near_date = _parse_single_date(near_match.group(1))
                if near_date:
                    candidates.append((near_date, 95))

    if not candidates:
        return None

    candidates.sort(key=lambda item: -item[1])
    return candidates[0][0]


def _detect_title(text: str) -> str:
    lowered = _normalize_text(text).lower()
    if any(keyword in lowered for keyword in ["elektrik", "enerji", "bogazici", "aedas", "bedas", "uedas"]):
        return "Elektrik Faturası"
    if "internet" in lowered or "turk telekom" in lowered or "superonline" in lowered:
        return "İnternet Faturası"
    if "gsm" in lowered or "turkcell" in lowered or "vodafone" in lowered:
        return "GSM Faturası"
    if "su fatura" in lowered or "iski" in lowered or "buski" in lowered:
        return "Su Faturası"
    if "dogalgaz" in lowered or "igdas" in lowered:
        return "Doğalgaz Faturası"
    return "OCR Fatura"


def _parse_institution(text: str) -> str | None:
    lowered = _normalize_text(text).lower()
    institutions = [
        (["bogazici", "enerji"], "Boğaziçi Elektrik"),
        (["enerji"], "Enerji SA"),
        (["turk telekom", "ttnet"], "Türk Telekom"),
        (["turkcell"], "Turkcell"),
        (["vodafone"], "Vodafone"),
        (["iski"], "İSKİ"),
        (["igdas"], "İGDAŞ"),
        (["aedas"], "AEDAŞ"),
    ]
    for keywords, name in institutions:
        if any(k in lowered for k in keywords):
            return name
    return None


def _parse_vat_amount(text: str) -> float | None:
    lowered = _normalize_text(text).lower()
    patterns = [
        r"kdv\s*[:\s-]*([\d]{1,3}(?:\.\d{3})*,\d{2})",
        r"kdv\s*[:\s-]*([\d]+,\d{2})",
        r"vergi ve fonlar\s*[:\s-]*([\d]{1,3}(?:\.\d{3})*,\d{2})",
        r"vergi ve fonlar\s*[:\s-]*([\d]+,\d{2})",
    ]
    for pattern in patterns:
        match = re.search(pattern, lowered)
        if match:
            value = _to_float(match.group(1))
            if value and value > 0:
                return value
    return None


def _parse_vat_rate(text: str) -> float | None:
    lowered = _normalize_text(text).lower()
    match = re.search(r"kdv\s*[%\s]*(\d{1,2})", lowered)
    if match:
        return float(match.group(1))
    if re.search(r"%20|kdv.?20", lowered):
        return 20.0
    if re.search(r"%10|kdv.?10", lowered):
        return 10.0
    return None


def _parse_tax_base(text: str, amount: float | None, vat_amount: float | None, vat_rate: float | None) -> float | None:
    lowered = _normalize_text(text).lower()
    match = re.search(r"matrah\s*[:\s-]*([\d]{1,3}(?:\.\d{3})*,\d{2})", lowered)
    if match:
        value = _to_float(match.group(1))
        if value:
            return value
    if amount and vat_amount:
        return round(amount - vat_amount, 2)
    if amount and vat_rate:
        return round(amount / (1 + vat_rate / 100), 2)
    return None


def _parse_consumption(text: str) -> float | None:
    lowered = _normalize_text(text).lower()
    patterns = [
        r"([\d]{1,4}(?:\.\d{3})*,\d{3})\s*kwh",
        r"fark\s*[:\s-]*([\d]{1,4}(?:\.\d{3})*,\d{3})",
        r"([\d]+,\d{2,3})\s*kwh",
    ]
    for pattern in patterns:
        match = re.search(pattern, lowered)
        if match:
            raw = match.group(1).replace(".", "").replace(",", ".")
            try:
                return float(raw)
            except ValueError:
                continue
    return None


def _parse_invoice_date(text: str) -> date | None:
    lowered = _normalize_text(text).lower()
    match = re.search(
        r"fatura\s*tarih(?:i|ı)?(?:/donemi)?[^\d\n]{0,20}(\d{2}[.,/]\d{2}[.,/]\d{4})",
        lowered,
    )
    if match:
        return _parse_single_date(match.group(1))
    return None


def _parse_contract_end(text: str) -> date | None:
    lowered = _normalize_text(text).lower()
    patterns = [
        r"taahhut\s*bitis\s*tarih(?:i|ı)?[^\d\n]{0,25}(\d{2}[.,/]\d{2}[.,/]\d{4})",
        r"sozlesme\s*bitis[^\d\n]{0,25}(\d{2}[.,/]\d{2}[.,/]\d{4})",
        r"taahhut\s*bitis[^\d\n]{0,25}(\d{2}[.,/]\d{2}[.,/]\d{4})",
        r"kampanya\s*bitis[^\d\n]{0,25}(\d{2}[.,/]\d{2}[.,/]\d{4})",
    ]
    for pattern in patterns:
        match = re.search(pattern, lowered)
        if match:
            parsed = _parse_single_date(match.group(1))
            if parsed:
                return parsed
    return None


def extract_invoice_data(image_path: Path) -> OCRResult:
    reader = _get_reader()
    regions = _get_scan_regions(image_path)

    chunks: list[str] = []
    for region in regions:
        chunk = _read_text_from_image(reader, region)
        if chunk.strip():
            chunks.append(chunk)

    raw_text = "\n".join(chunks)
    amount = _parse_amount(raw_text)
    due_date = _parse_date(raw_text, amount)
    suggested_title = _detect_title(raw_text)
    institution = _parse_institution(raw_text)
    vat_amount = _parse_vat_amount(raw_text)
    vat_rate = _parse_vat_rate(raw_text) or (20.0 if vat_amount else None)
    tax_base = _parse_tax_base(raw_text, amount, vat_amount, vat_rate)
    consumption = _parse_consumption(raw_text)
    invoice_date = _parse_invoice_date(raw_text)
    contract_end_date = _parse_contract_end(raw_text)

    if amount and due_date and vat_amount:
        confidence = "yuksek"
    elif amount and due_date:
        confidence = "yuksek"
    elif amount or due_date:
        confidence = "orta"
    else:
        confidence = "dusuk"

    return OCRResult(
        amount=amount,
        due_date=due_date,
        raw_text=raw_text,
        confidence=confidence,
        suggested_title=suggested_title,
        institution=institution,
        invoice_date=invoice_date,
        vat_rate=vat_rate,
        vat_amount=vat_amount,
        tax_base=tax_base,
        consumption=consumption,
        contract_end_date=contract_end_date,
    )
