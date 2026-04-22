import re
import os
from openai import OpenAI
from dotenv import load_dotenv
load_dotenv()


client = OpenAI(api_key=os.getenv("LANGUAGE_MODEL_KEY"))

# --------------------------------------------
# Detect Section + Act together
# --------------------------------------------
def detect_sections(text: str):
    if not text:
        return []

    matches = re.findall(
        r"(Section\s+\d+[A-Za-z]*)\s+of\s+the\s+([A-Za-z\s]+?Act[, ]*\d*)",
        text,
        re.IGNORECASE
    )

    return list(set(matches))


# --------------------------------------------
# Explain actual section content
# --------------------------------------------
def explain_section(section_name: str, act_name: str):
    prompt = f"""
You are a legal expert.

Explain what {section_name} of the {act_name} actually contains.

Rules:
- Explain the real purpose of the section
- Mention rights, duties, or legal mechanism it provides
- Maximum 4 lines
- Use simple English
- Do not give legal advice
"""

    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2
    )

    return response.choices[0].message.content.strip()


# --------------------------------------------
# Main function to call from app.py
# --------------------------------------------
def get_section_explanations(text: str):
    detected = detect_sections(text)

    explanations = []

    for section, act in detected:
        explanation = explain_section(section, act)
        explanations.append({
            "section": section,
            "act": act,
            "explanation": explanation
        })

    return explanations
