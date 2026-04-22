import re
from transformers import pipeline

ner_pipeline = pipeline(
    "ner",
    model="dslim/bert-base-NER",
    aggregation_strategy="simple"
)

def clean_name(name: str) -> str:
    name = re.sub(r"\s+", " ", name)
    name = name.split("Age")[0]
    name = name.split("Occ")[0]
    name = name.split(",")[0]
    return name.strip()


def extract_entities(text: str):
    owner = None
    tenant = None

    # ---------- OWNER ----------
    owner_match = re.search(
        r"(?:Name\s+and\s+Address\s+of\s+the\s+Licensor|"
        r"Licensor\s+Name\s+and\s+Address)\s*[:\-]?\s*"
        r"Mr\.?\s*\n*\s*([A-Za-z\s]{3,})",
        text,
        re.IGNORECASE
    )

    if owner_match:
        owner = clean_name("Mr. " + owner_match.group(1))

    # ---------- TENANT ----------
    tenant_match = re.search(
        r"(?:Name\s+and\s+Address\s+of\s+the\s+Licensee|"
        r"Licensee\s+Name\s+and\s+Address)\s*[:\-]?\s*"
        r"Mr\.?\s*\n*\s*([A-Za-z\s]{3,})",
        text,
        re.IGNORECASE
    )

    if tenant_match:
        tenant = clean_name("Mr. " + tenant_match.group(1))

    # ---------- FALLBACK ----------
    if not owner or not tenant:
        persons = [ent["word"] for ent in ner_pipeline(text)
                   if ent["entity_group"] == "PERSON"]

        if not owner and len(persons) >= 1:
            owner = persons[0]
        if not tenant and len(persons) >= 2:
            tenant = persons[1]

    return {
        "owner": owner,
        "tenant": tenant
    }
