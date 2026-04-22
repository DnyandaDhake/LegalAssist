import re

def extract_dates(text):
    date_pattern = r"\b\d{1,2}[/-]\d{1,2}[/-]\d{4}\b"
    return set(re.findall(date_pattern, text))


def extract_amounts(text):
    """
    Extracts full monetary values like:
    Rs. 12,500
    Rs 25000
    Rs.25,000
    """

    # Capture 'rs' + full number (with commas)
    pattern = r"rs\.?\s*\d{1,3}(?:,\d{3})+|\brs\.?\s*\d{4,6}\b"

    matches = re.findall(pattern, text.lower())

    normalized = set()
    for amt in matches:
        # remove everything except digits
        digits = re.sub(r"[^\d]", "", amt)
        if digits:
            normalized.add(digits)

    return normalized


def check_consistency(doc_text, summary_text):
    doc_dates = extract_dates(doc_text)
    summary_dates = extract_dates(summary_text)

    doc_amounts = extract_amounts(doc_text)
    summary_amounts = extract_amounts(summary_text)

    date_consistent = summary_dates.issubset(doc_dates)
    amount_consistent = summary_amounts.issubset(doc_amounts)

    consistency_score = ((date_consistent + amount_consistent) / 2) * 100

    return {
        "doc_dates": doc_dates,
        "summary_dates": summary_dates,
        "doc_amounts": doc_amounts,
        "summary_amounts": summary_amounts,
        "date_consistent": date_consistent,
        "amount_consistent": amount_consistent,
        "consistency_score": consistency_score
    }
