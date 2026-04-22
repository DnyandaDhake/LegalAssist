import os
import json
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(api_key=os.getenv("LANGUAGE_MODEL_KEY"))

def analyze_document(text: str) -> dict:
    prompt = f"""
You are a legal analysis engine specialised in Maharashtra
Leave and License Agreements.

TASK:
1. Clause-wise analysis

OUTPUT JSON ONLY:

{{
  "clauses": [
    {{
      "category": "",
      "title": "",
      "description": ""
    }}
  ],
  "risks": [
    {{
      "risk": "",
      "risk_level": "High | Medium | Low",
      "description": "",
      "mitigation": ""
    }}
  ]
}}

RULES:
- No empty arrays
- No "Unknown"
- Use Maharashtra legal context

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
        raise ValueError("Empty response from language model")

    return json.loads(content)  # 🔥 THIS FIXES YOUR ERROR
