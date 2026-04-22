def is_legal_document(text: str) -> bool:
    LEGAL_KEYWORDS = [
        "agreement", "license", "licensor", "licensee",
        "tenant", "owner", "rent", "deposit",
        "termination", "notice", "premises",
        "hereby", "registered",
        "stamp duty", "jurisdiction"
    ]

    text_lower = text.lower()

    match_count = sum(1 for kw in LEGAL_KEYWORDS if kw in text_lower)

    # ✅ Threshold (important)
    return match_count >= 3
