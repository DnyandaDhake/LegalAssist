from transformers import pipeline

rewriter = pipeline(
    "text2text-generation",
    model="google/flan-t5-base"
)

def rewrite_simple(text: str) -> str:
    prompt = (
        "You are a legal assistant.\n"
        "Rewrite the following legal content into ONE clear, professional "
        "paragraph in formal Indian legal English.\n\n"
        "Rules:\n"
        "- Do NOT repeat sentences\n"
        "- Remove contradictions\n"
        "- Do NOT list points\n"
        "- Do NOT use raw labels like 'start date:' or 'duration:'\n"
        "- Use proper legal wording (agreement, licensee, termination, notice)\n"
        "- Do NOT invent missing facts\n\n"
        "Legal Content:\n"
        f"{text}"
    )

    result = rewriter(
        prompt,
        max_length=220,
        do_sample=False,
        temperature=0.0
    )

    return result[0]["generated_text"].strip()
