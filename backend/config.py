import os

MONGO_URI = os.environ.get("MONGO_URI")
SECRET_KEY = os.environ.get("JWT_SECRET")

UPLOAD_FOLDER = os.environ.get("UPLOAD_FOLDER", "./uploads")

# EXACT path to your model (matches screenshot)
CLAUSE_MODEL_PATH = "./models/clause_classifier"
FERNET_KEY = os.environ.get("FERNET_KEY")
# If you add risk KB later
# RISK_KB_PATH = "./risk_kb.json"