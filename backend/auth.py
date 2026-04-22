from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from db import users
from bson.objectid import ObjectId
import datetime

auth_bp = Blueprint("auth", __name__)

# ------------------------------------------------------
# REGISTER
# ------------------------------------------------------
@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        data = request.json

        if not data or not data.get("email") or not data.get("password") or not data.get("username"):
            return jsonify({"msg": "Email, username and password are required"}), 400

        if users.find_one({"email": data["email"]}):
            return jsonify({"msg": "Email already exists"}), 400

        user = {
            "username": data["username"],
            "email": data["email"],
            "contact": data.get("contact", ""),
            "password": generate_password_hash(data["password"]),
            "created_at": datetime.datetime.utcnow()
        }

        inserted = users.insert_one(user)

        # ✅ CORRECT TOKEN CREATION
        token = create_access_token(identity=str(inserted.inserted_id))

        return jsonify({
            "msg": "Registered successfully",
            "token": token,
            "user": {
                "id": str(inserted.inserted_id),
                "username": user["username"],
                "email": user["email"],
                "contact": user.get("contact", "")
            }
        })

    except Exception as e:
        print("❌ Registration error:", e)
        return jsonify({"msg": "Server error"}), 500


# ------------------------------------------------------
# LOGIN
# ------------------------------------------------------
@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.json

        if not data or not data.get("email") or not data.get("password"):
            return jsonify({"msg": "Email and password are required"}), 400

        user = users.find_one({"email": data["email"]})

        if not user or not check_password_hash(user["password"], data["password"]):
            return jsonify({"msg": "Invalid credentials"}), 401

        # ✅ CORRECT TOKEN CREATION
        token = create_access_token(identity=str(user["_id"]))

        return jsonify({
            "token": token,
            "user": {
                "id": str(user["_id"]),
                "username": user["username"],
                "email": user["email"],
                "contact": user.get("contact", "")
            }
        })

    except Exception as e:
        print("❌ Login error:", e)
        return jsonify({"msg": "Server error"}), 500
