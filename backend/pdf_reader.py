# pdf_reader.py
import fitz  # PyMuPDF
import re
import os

def extract_text_from_pdf(pdf_path):
    print("[DEBUG] PDF PATH RECEIVED:", pdf_path)

    if not pdf_path or not os.path.exists(pdf_path):
        raise ValueError(f"Invalid PDF path: {pdf_path}")

    full_text = []

    doc = fitz.open(pdf_path)

    for page in doc:
        blocks = page.get_text("blocks")  # layout-aware
        for block in blocks:
            text = block[4]
            if text and len(text.strip()) > 3:
                full_text.append(text.strip())

    doc.close()

    text = "\n".join(full_text)

    # 🔥 REMOVE LEGAL GARBAGE
    text = re.sub(r'Page\s+\d+\s+of\s+\d+', '', text, flags=re.I)
    text = re.sub(r'Registered as Document No\.\d+.*', '', text, flags=re.I)
    text = re.sub(r'\s+', ' ', text)

    if len(text) < 200:
        raise ValueError("PDF extraction too small / corrupted")

    return text.strip()
