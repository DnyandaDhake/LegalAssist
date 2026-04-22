# risk_analyzer.py
import os
import json
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(api_key=os.getenv("LANGUAGE_MODEL_KEY"))

def analyze_risks(text: str) -> list:
    """
    Extract ONLY risk analysis from a legal document.
    Returns risks with level and mitigation.
    """

    prompt = f"""

You are a legal risk assessment assistant specialised in Maharashtra Leave and License Agreements.

IMPORTANT:
If the PDF is scanned or image-based, first perform OCR and extract readable text before analysis.

TASK:
Read the uploaded agreement carefully and identify risks based ONLY on the contents of the document.

Focus strictly from the Licensee (tenant) perspective.

Assess risks using Maharashtra tenancy / Leave and License practices, registration norms, common enforceable contract principles, and practical tenant protections.

Give legally acceptable advice in the simplest possible language.

OUTPUT JSON ONLY:

{{
  "risks": [
    {{
      "risk": "",
      "risk_level": "High | Medium | Low",
      "mitigation": ""
    }}
  ]
}}

STRICT RULES:
- Output only valid JSON
- Do NOT include clauses
- Do NOT include summary
- Do NOT include description field
- Use only risks supported by the document text
- Do NOT invent facts not present in the agreement
- Focus only on Licensee / tenant risks
- Risk level must be only: High, Medium, Low
- Every risk must include medium sized mitigation
- Use simple English understandable by a common person
- Keep mitigation practical and legally sensible
- Avoid difficult legal jargon
- Do not repeat similar risks
- If a clause is missing, treat that absence as a possible risk
- Use Maharashtra Leave and License context only

CHECK FOR TENANT RISKS SUCH AS:
- Unregistered agreement
- No refund timeline for deposit
- One-sided termination clause
- Heavy penalty / lock-in without balance
- No notice period
- Rent increase unclear
- Maintenance charges unclear
- Repair responsibility unclear
- Eviction terms unfair
- Owner entry/privacy not defined
- Utility bill liability unclear
- Damage liability too broad
- No possession handover proof
- No stamp duty / registration compliance
- No dispute resolution clarity

STYLE OF MITIGATION:
Use short lines like:
- Add written refund timeline.
- Make notice period equal for both parties.
- Register the agreement.
- Clearly divide repair costs.
- Limit penalty with fair terms.
- Take signed possession record.




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
        raise ValueError("Empty risk analysis response")

    data = json.loads(content)

    return data.get("risks", [])
