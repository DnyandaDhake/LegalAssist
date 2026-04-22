from entity_extractor import ENTITY_KEYWORDS

def summary_to_text(summary_dict):
    return " ".join(
        f"{k} {v}".lower() for k, v in summary_dict.items()
    )

def calculate_coverage(document_entities, summary_text):
    covered = set()

    for entity in document_entities:
        keywords = ENTITY_KEYWORDS.get(entity, set())
        for kw in keywords:
            if kw in summary_text:
                covered.add(entity)
                break

    coverage_score = len(covered) / len(document_entities) if document_entities else 0
    return coverage_score, covered
