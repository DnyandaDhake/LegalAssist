import re

# Define entity → keyword mapping
ENTITY_KEYWORDS = {
    "rent": {"rent", "rs.", "rupees", "monthly"},
    "deposit": {"deposit", "security"},
    "duration": {"term", "months", "years"},
    "parties": {"licensor", "licensee", "lessor", "lessee"},
    "termination": {"terminate", "termination", "revocable", "notice"},
    "property": {"flat", "apartment", "property", "premises"}
}

def extract_important_entities(text):
    text = text.lower()
    entities = set()

    for entity, keywords in ENTITY_KEYWORDS.items():
        for kw in keywords:
            if re.search(rf"\b{kw}\b", text):
                entities.add(entity)
                break

    return entities
