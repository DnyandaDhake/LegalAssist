from datetime import datetime
import time

from pdf_reader import extract_text_from_pdf
from db import documents, summaries, clauses, risks
from legal_document_validator import is_legal_document
from semantic_analyser.document_summarizer import generate_document_summary
from semantic_analyser.clause_analyzer import analyze_clauses
from semantic_analyser.risk_analyzer import analyze_risks
from bson.objectid import ObjectId
from legal_document_validator import is_legal_document
from encryption_utils import decrypt_file, delete_temp_file


def process_document(doc_id, pdf_path, user_id=None):
    try:
        start = time.time()

        print("[PIPELINE] Extracting PDF text...")
        temp_pdf = decrypt_file(pdf_path)

        try:
            full_text = extract_text_from_pdf(temp_pdf)
        finally:
            delete_temp_file(temp_pdf)

        # --------------------------------------------------
        # 1️⃣ Validate legal document (MANDATORY CHECK)
        # --------------------------------------------------
        if not is_legal_document(full_text):
            summaries.insert_one({
                "document_id": doc_id,
                "summary_text": "Uploaded document is not a legal agreement.",
                "created_at": datetime.utcnow()
            })

            documents.update_one(
                {"_id": ObjectId(doc_id)},
                {"$set": {
                    "status": "completed",
                    "processed_at": datetime.utcnow()
                }}
            )
            return {"success": True}

        # --------------------------------------------------
        # 2️⃣ Executive Summary
        # --------------------------------------------------
        print("[PIPELINE] Generating executive summary...")
        summary = generate_document_summary(full_text)

        summaries.insert_one({
            "document_id": doc_id,
            "summary_text": summary,
            "created_at": datetime.utcnow()
        })

        # --------------------------------------------------
        # 3️⃣ Clause Analysis (ONLY clauses)
        # --------------------------------------------------
        print("[PIPELINE] Running clause analysis...")
        clause_results = analyze_clauses(full_text)

        for clause in clause_results:
            clauses.insert_one({
                "document_id": doc_id,
                "category": clause.get("category"),
                "title": clause.get("title"),
                "description": clause.get("description"),
                "created_at": datetime.utcnow()
            })

        # --------------------------------------------------
        # 4️⃣ Risk Analysis (ONLY risks + mitigation)
        # --------------------------------------------------
        print("[PIPELINE] Running risk analysis...")
        risk_results = analyze_risks(full_text)

        for risk in risk_results:
            risks.insert_one({
                "document_id": doc_id,
                "risk": risk.get("risk"),
                "risk_level": risk.get("risk_level"),
                "description": risk.get("description"),
                "mitigation_strategy": risk.get("mitigation"),
                "created_at": datetime.utcnow()
            })

        # --------------------------------------------------
        # 5️⃣ Mark document as completed
        # --------------------------------------------------
        documents.update_one(
            {"_id": ObjectId(doc_id)},
            {"$set": {
                "status": "completed",
                "processed_at": datetime.utcnow()
            }}
        )

        print(f"[PIPELINE DONE] {time.time() - start:.2f}s")
        return {"success": True}

    except Exception as err:
        print("🔥 PIPELINE ERROR:", err)

        documents.update_one(
            {"_id": ObjectId(doc_id)},
            {"$set": {
                "status": "error",
                "error": str(err)
            }}
        )
        return {"success": False}
