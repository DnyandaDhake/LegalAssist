from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch, json, re

MODEL_NAME = "google/flan-t5-large"

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSeq2SeqLM.from_pretrained(
    MODEL_NAME,
    device_map="auto"
)
model.eval()

def extract_structured_data(document_text: str) -> dict:
    prompt = f"""
You are a legal document analysis AI.

Extract information from the Leave and License Agreement below.
Return ONLY valid JSON in the exact structure shown.

{{
  "agreement_type": "",
  "owner": "",
  "tenant": "",
  "property": "",
  "duration": "",
  "start_date": "",
  "end_date": "",
  "rent": "",
  "deposit": "",
  "use": "",
  "termination": "",
  "registration": ""
}}

Rules:
- Use exact words from the document
- If a value is missing, write "Not specified"
- Do NOT explain anything
- Output ONLY JSON

Document:
{document_text[:4000]}
"""

    inputs = tokenizer(prompt, return_tensors="pt", truncation=True)
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_length=700,
            do_sample=False
        )

    raw = tokenizer.decode(outputs[0], skip_special_tokens=True)

    # Safety: extract JSON block only
    match = re.search(r'\{.*\}', raw, re.S)
    if not match:
        return {}

    try:
        return json.loads(match.group())
    except:
        return {}
