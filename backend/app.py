import os
import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from bson.objectid import ObjectId
from report_generator import generate_pdf_report
from flask import send_file
from semantic_analyser.section_explainer import get_section_explanations
from pdf_reader import extract_text_from_pdf
from encryption_utils import encrypt_file
from encryption_utils import decrypt_file, delete_temp_file



from flask_jwt_extended import (
    JWTManager,
    jwt_required,
    get_jwt_identity
)

# ---------------- LOCAL IMPORTS ----------------
from auth import auth_bp
from config import UPLOAD_FOLDER
from db import users, documents, clauses, summaries, risks
from nlp_pipeline import process_document
from datetime import timedelta

# ------------------------------------------------------
# Flask App Initialization (ONLY ONCE)
# ------------------------------------------------------
app = Flask(__name__)

# ---------------- JWT CONFIG ----------------

# ⚠️ This is ONLY for auth token signing
app.config["JWT_SECRET_KEY"] = "1101724"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)
app.config["JWT_TOKEN_LOCATION"] = ["headers"]
app.config["JWT_HEADER_NAME"] = "Authorization"
app.config["JWT_HEADER_TYPE"] = "Bearer"

jwt = JWTManager(app)

# ---------------- CORS ----------------
CORS(app)

# ---------------- AUTH ROUTES ----------------
app.register_blueprint(auth_bp)

# ---------------- UPLOAD FOLDER ----------------
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ======================================================
# 📤 UPLOAD DOCUMENT
# ======================================================
@app.route("/upload", methods=["POST"])
@jwt_required()
def upload_document():
    user_id = get_jwt_identity()

    if "file" not in request.files:
        return jsonify({"msg": "No file uploaded"}), 400

    file = request.files["file"]

    if not file.filename.lower().endswith(".pdf"):
        return jsonify({"msg": "Only PDF files allowed"}), 400

    filename = f"{datetime.datetime.utcnow().timestamp()}_{file.filename}"
    save_path = os.path.join(UPLOAD_FOLDER, filename)

    print("[DEBUG] Saving PDF to:", save_path)
    file.save(save_path)
    encrypt_file(save_path)
    doc_id = documents.insert_one({
        "user_id": user_id,
        "filename": filename,
        "original_filename": file.filename,
        "path": save_path,
        "status": "processing",
        "uploaded_at": datetime.datetime.utcnow()
    }).inserted_id

    try:
        process_document(str(doc_id), save_path, user_id)
    except Exception as e:
        print("[PIPELINE ERROR]", e)
        documents.update_one(
            {"_id": doc_id},
            {"$set": {"status": "error", "error": str(e)}}
        )
        return jsonify({"msg": "Error processing document"}), 500

    return jsonify({
        "msg": "Document uploaded and processing started",
        "doc_id": str(doc_id)
    })

# ======================================================
# 📊 GET FINAL RESULT (SUMMARY + CLAUSES + RISKS)
# ======================================================
@app.route("/result/<doc_id>", methods=["GET"])
@jwt_required()
def get_result(doc_id):
    user_id = get_jwt_identity()

    document = documents.find_one({"_id": ObjectId(doc_id)})
    if not document:
        return jsonify({"msg": "Document not found"}), 404

    if str(document["user_id"]) != str(user_id):
        return jsonify({"msg": "Access denied"}), 403
    
    summary_doc = summaries.find_one({"document_id": doc_id})

    summary_text = summary_doc["summary_text"] if summary_doc else ""

    sections_explained = get_section_explanations(summary_text)

    clause_docs = list(clauses.find({"document_id": doc_id}))
    risk_docs = list(risks.find({"document_id": doc_id}))
    summary_text = summary_doc["summary_text"] if summary_doc else ""

# 🔥 Extract full document text
   
    temp_pdf = decrypt_file(document["path"])

    try:
        full_text = extract_text_from_pdf(temp_pdf)
    finally:
        delete_temp_file(temp_pdf)

    # 🔥 Get section explanations
    sections_explained = get_section_explanations(full_text)


    return jsonify({
       "summary": summary_text,
       "sections_explained": sections_explained,


        "clauses": [
            {
                "category": c.get("category"),
                "title": c.get("title"),
                "description": c.get("description")
            }
            for c in clause_docs
        ],

        "risks": [
            {
                "risk": r.get("risk"),
                "risk_level": r.get("risk_level"),
                "description": r.get("description"),
                "mitigation": r.get("mitigation_strategy")
            }
            for r in risk_docs
        ]
    })

# ======================================================
# ⏳ CHECK STATUS
# ======================================================
@app.route("/status/<doc_id>", methods=["GET"])
@jwt_required()
def get_status(doc_id):
    doc = documents.find_one({"_id": ObjectId(doc_id)})
    if not doc:
        return jsonify({"msg": "Document not found"}), 404

    return jsonify({
        "status": doc.get("status", "unknown"),
        "filename": doc.get("original_filename", "")
    })

# ======================================================
# 📜 USER HISTORY
# ======================================================
@app.route("/history", methods=["GET"])
@jwt_required()
def history():
    user_id = get_jwt_identity()

    docs = list(documents.find({"user_id": user_id}).sort("uploaded_at", -1))
    for d in docs:
        d["_id"] = str(d["_id"])
        summary = summaries.find_one({"document_id": d["_id"]})
        d["has_summary"] = summary is not None

    return jsonify(docs)

# ======================================================
# 👤 PROFILE
# ======================================================
@app.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = users.find_one({"_id": ObjectId(user_id)})

    if not user:
        return jsonify({"msg": "User not found"}), 404

    user["_id"] = str(user["_id"])
    user.pop("password", None)

    return jsonify(user)

@app.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    data = request.json or {}

    update_data = {}
    if "username" in data:
        update_data["username"] = data["username"]
    if "contact" in data:
        update_data["contact"] = data["contact"]

    if update_data:
        users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )

    return jsonify({"msg": "Profile updated"})

# ======================================================
# 📥 DOWNLOAD (PLACEHOLDER)
# ======================================================
@app.route("/download/<doc_id>", methods=["GET"])
@jwt_required()
def download_report(doc_id):
    user_id = get_jwt_identity()

    document = documents.find_one({"_id": ObjectId(doc_id)})
    if not document:
        return jsonify({"msg": "Document not found"}), 404

    if str(document["user_id"]) != str(user_id):
        return jsonify({"msg": "Access denied"}), 403

    # --------------------------------------------------
    # FETCH DATA FROM DB
    # --------------------------------------------------
    summary_doc = summaries.find_one({"document_id": doc_id})
    clause_docs = list(clauses.find({"document_id": doc_id}))
    risk_docs = list(risks.find({"document_id": doc_id}))

    summary_text = summary_doc["summary_text"] if summary_doc else ""

    # --------------------------------------------------
    # FILE PATH
    # --------------------------------------------------
    reports_dir = "./reports"
    os.makedirs(reports_dir, exist_ok=True)

    file_path = os.path.join(
        reports_dir,
        f"legal_report_{doc_id}.pdf"
    )

    # --------------------------------------------------
    # GENERATE PDF
    # --------------------------------------------------
    generate_pdf_report(
        output_path=file_path,
        summary_text=summary_text,
        clauses=clause_docs,
        risks=risk_docs
    )

    # --------------------------------------------------
    # SEND FILE
    # --------------------------------------------------
    return send_file(
        file_path,
        as_attachment=True,
        download_name="Legal_Analysis_Report.pdf"
    )
#Delete Document
@app.route("/delete/<doc_id>", methods=["DELETE"])
@jwt_required()
def delete_document(doc_id):
    user_id = get_jwt_identity()

    document = documents.find_one({"_id": ObjectId(doc_id)})
    if not document:
        return jsonify({"msg": "Document not found"}), 404

    if str(document["user_id"]) != str(user_id):
        return jsonify({"msg": "Access denied"}), 403

    # Delete related data
    summaries.delete_many({"document_id": doc_id})
    clauses.delete_many({"document_id": doc_id})
    risks.delete_many({"document_id": doc_id})

    # Delete document record
    documents.delete_one({"_id": ObjectId(doc_id)})

    return jsonify({"msg": "Document deleted successfully"})

def calculate_risk_score(risk_docs):
    if not risk_docs:
        return 0

    high_count = sum(1 for r in risk_docs if r.get("risk_level") == "High")
    medium_count = sum(1 for r in risk_docs if r.get("risk_level") == "Medium")
    low_count = sum(1 for r in risk_docs if r.get("risk_level") == "Low")

    base_score = (high_count * 15) + (medium_count * 5) + (low_count * 1)

    # Critical escalation rule
    if high_count >= 1:
        base_score += 20  # escalate due to serious exposure

    return min(round(base_score, 2), 100)


# ======================================================
# 📊 OVERALL KPI DASHBOARD
# ======================================================
@app.route("/dashboard/kpi", methods=["GET"])

@jwt_required()
def dashboard_kpi():
    user_id = get_jwt_identity()

    # Get all user's documents
    user_docs = list(documents.find({"user_id": user_id}))

    if not user_docs:
     return jsonify({
        "overall_risk": 0,
        "overall_compliance": 100,
        "total_documents": 0,
        "total_risks": 0
    })


    all_risks = []

    for doc in user_docs:
        doc_id = str(doc["_id"])
        doc_risks = list(risks.find({"document_id": doc_id}))
        all_risks.extend(doc_risks)

    overall_risk = calculate_risk_score(all_risks)
    overall_compliance = 100 - overall_risk

    return jsonify({
        "overall_risk": overall_risk,
        "overall_compliance": overall_compliance,
        "total_documents": len(user_docs),
        "total_risks": len(all_risks)
    })

# ======================================================
# 🚀 MAIN
# ======================================================
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
