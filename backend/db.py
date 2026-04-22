from pymongo import MongoClient
from config import MONGO_URI
from bson.objectid import ObjectId

# --------------------------------------------------
# MongoDB Client
# --------------------------------------------------
client = MongoClient(MONGO_URI)

# Main Database
db = client["legal_advisor"]

# --------------------------------------------------
# Collections
# --------------------------------------------------

# User accounts
users = db["users"]

# Uploaded PDF documents
documents = db["documents"]

# Clause detection results
clauses = db["clauses"]

# Summary results
summaries = db["summaries"]

# Risk assessment results
risks = db["risks"]

# --------------------------------------------------
# Helper Functions
# --------------------------------------------------

def create_indexes():
    """
    Creates helpful indexes for faster queries.
    Run ONLY once during setup.
    """

    # Users
    users.create_index("email", unique=True)

    # Documents
    documents.create_index("user_id")
    documents.create_index("uploaded_at")

    # Clauses (IMPORTANT: document_id)
    clauses.create_index("document_id")
    clauses.create_index("category")

    # Summaries
    summaries.create_index("document_id")

    # Risks
    risks.create_index("document_id")
    risks.create_index("risk")

    print("[MongoDB] Indexes created successfully.")


def get_user_by_id(uid):
    """Find user by ObjectId"""
    try:
        return users.find_one({"_id": ObjectId(uid)})
    except:
        return None


def convert_id(doc):
    """Convert ObjectId to string before sending to frontend"""
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc


# --------------------------------------------------
# Database Initialization
# --------------------------------------------------
print("[MongoDB] Connected to:", MONGO_URI)
print("[MongoDB] Database: legal_advisor")

# Create indexes on first run
try:
    create_indexes()
except Exception as e:
    print("[MongoDB] Index creation skipped:", e)
