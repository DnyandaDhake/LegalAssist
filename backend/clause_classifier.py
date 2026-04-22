from transformers import pipeline

print("[CLAUSE] Loading zero-shot clause classifier...")

classifier = pipeline(
    "zero-shot-classification",
    model="facebook/bart-large-mnli",
    device=0 
)

LABELS = [
    "agreement type",
    "party information",
    "property description",
    "duration and dates",
    "payment details",
    "termination clause",
    "registration",
    "boilerplate"
]

def predict_clause(sentence: str):
    """
    Returns clause label + confidence
    """
    result = classifier(sentence, LABELS)

    return {
        "label": result["labels"][0],
        "confidence": float(result["scores"][0])
    }
