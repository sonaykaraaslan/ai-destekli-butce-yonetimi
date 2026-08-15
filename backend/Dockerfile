FROM python:3.12-slim-bookworm

WORKDIR /app

ENV PIP_DEFAULT_TIMEOUT=600
ENV PIP_DISABLE_PIP_VERSION_CHECK=1

# OpenCV / EasyOCR sistem kutuphaneleri
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Once GPU/CUDA paketleri (~1GB) yerine CPU-only PyTorch (~200MB)
RUN pip install --no-cache-dir \
    torch==2.5.1 torchvision==0.20.1 \
    --index-url https://download.pytorch.org/whl/cpu

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

RUN mkdir -p database uploads

# OCR modellerini image icine al (ilk calistirmada indirme beklemesin)
RUN python -c "import easyocr; easyocr.Reader(['tr', 'en'], gpu=False, verbose=False)"

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
