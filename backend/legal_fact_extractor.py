import re

def extract_key_facts(text: str):
    facts = {}

    # ---------------- DATES ----------------
    dates = re.findall(r"\d{2}/\d{2}/\d{4}", text)
    if len(dates) >= 1:
        facts["execution_date"] = dates[0]
    if len(dates) >= 2:
        facts["start_date"] = dates[0]
        facts["end_date"] = dates[1]

    # ---------------- DURATION ----------------
    dur = re.search(r"(\d{1,2}\s*Months?)", text, re.IGNORECASE)
    if dur:
        facts["duration"] = dur.group(1)

    # ---------------- RENT (MATCHES Rs.12500/-) ----------------
    rent = re.search(
        r"(licen[cs]e\s*fee)[^\d]{0,20}rs\.?\s*(\d{4,6})",
        text,
        re.IGNORECASE
    )
    if rent:
        facts["rent"] = f"₹{rent.group(2)} per month"

    # ---------------- DEPOSIT (MATCHES Rs.25000/-) ----------------
    deposit = re.search(
        r"(deposit|security)[^\d]{0,30}rs\.?\s*(\d{4,6})",
        text,
        re.IGNORECASE
    )
    if deposit:
        facts["deposit"] = f"₹{deposit.group(2)}"

    # ---------------- PURPOSE ----------------
    if "residential" in text.lower():
        facts["purpose"] = "Residential"

    return facts
