# clause_analyzer.py
import os
import json
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(api_key=os.getenv("LANGUAGE_MODEL_KEY"))

def analyze_clauses(text: str) -> list:
    """
    Extract ONLY clause analysis from a legal document.
    Returns a list of clauses for DB + frontend usage.
    """

    prompt = f"""
You are a legal clause extraction engine specialised in
Maharashtra Leave and License Agreements.
DO OCR if the pdf is scanned and extract text before clause analysis.

TASK:
Identify and name the clause and explain important clauses and write descriptions in very brief.
for each clause in after the title add keyword 'clause'.
example output:  'Termination Clause' title like this, add description also in single line and simple english
OUTPUT JSON ONLY:

{{
  "clauses": [
    {{
      
      "title": "",
      "description": ""
    }}
  ]
}}

RULES:
- Do NOT include risks
- Do NOT include mitigation
- Do NOT include summaries
- No empty fields
- Use clear legal language
- Maharashtra legal context only

DOCUMENT:
{text[:7000]}
"""

    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
        response_format={"type": "json_object"}
    )

    content = response.choices[0].message.content
    if not content:
        raise ValueError("Empty clause analysis response")

    data = json.loads(content)

    return data.get("clauses", [])
