import os
import json
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
client = OpenAI(api_key=os.getenv("LANGUAGE_MODEL_KEY"))

# --------------------------------------------------
# SUMMARY FORMATTER (UNCHANGED)
# --------------------------------------------------
def refine_summary(summary_text: str) -> str:
    prompt = f"""
Generate an EXECUTIVE SUMMARY (POINTWISE) of a
Maharashtra Leave and License Agreement.

STRICT RULES:
- Bullet points only
- Maximum 12 points
- Each point must be one line
- Use clear legal language
- Do NOT add explanations or paragraphs
- If information is missing, write "Not specified"

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

SUMMARY CONTENT:
{summary_text}
"""

    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0
    )

    return response.choices[0].message.content.strip()


# --------------------------------------------------
# CLAUSE NAMING + SIMPLIFICATION (FINAL)
# --------------------------------------------------
def refine_clauses(clauses: list) -> list:
    """
    Generates clause CATEGORY (title) and simplifies text
    without changing legal meaning.
    """

    prompt = f"""
You are a legal clause naming and simplification engine
specialised in Maharashtra Leave and License Agreements.

TASK:
For each clause:
1. Identify the correct STANDARD legal clause name
2. Rewrite the clause text in SIMPLE English
3. Do NOT change legal meaning

RULES:
- Use clause names like:
  Period Clause, License Fee and Deposit Clause,
  Payment of Deposit Clause, Maintenance Charges Clause,
  Electricity Charges Clause, Use Clause,
  Alteration Clause, No Tenancy Clause,
  Termination Clause, Registration Clause
- Use key name "category" for clause title
- Description must be ONE LINE
- Do NOT add or remove clauses
- Maharashtra legal context only

OUTPUT JSON ONLY:
{{
  "clauses": [
    {{
      "category": "",
      "description": ""
    }}
  ]
}}

INPUT CLAUSES:
{clauses}
"""

    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
        response_format={"type": "json_object"}
    )

    parsed = json.loads(response.choices[0].message.content)
    return parsed["clauses"]
