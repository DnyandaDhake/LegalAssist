import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(api_key=os.getenv("LANGUAGE_MODEL_KEY"))

def generate_document_summary(text: str):
    prompt = f"""
Generate an EXECUTIVE SUMMARY (POINTWISE) of a
Maharashtra Leave and License Agreement.
DO OCR if the pdf is scanned and extract text before summarization.
STRICT RULES:
- Bullet points only
- Maximum 12 points
- Each point must be one line
- Use clear legal language
- Do NOT add explanations or paragraphs

FORMAT:
Agreement Type:
Governing Law:
Licensor:
Licensee:
Property:
Area:
Usage:
Term:
Rent:
Deposit:
Notice Period:
Registration:
Overstay Consequence:
Remove "-" from the starting of each point.
DOCUMENT:
{text[:6000]}
"""

    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0
    )

    content = response.choices[0].message.content
    if not content or content.strip() == "":
        raise ValueError("Empty summary generated")

    return content.strip()
