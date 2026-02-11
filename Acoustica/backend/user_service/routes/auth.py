from flask import Blueprint, jsonify
import logging

from user_service.services import auth

logging.basicConfig(
    filename = "app.log",
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s"
)

auth_bp = Blueprint("auth", __name__) 

@auth_bp.get("/api/auth/health")
def health():
    return jsonify("auth")

@auth_bp.post("/api/auth/sign-up")
def sign_up():
    return jsonify("sign_up")

@auth_bp.post("/api/auth/sign-in")
def sign_in():
    return jsonify("sign_in")

@auth_bp.post("/api/auth/sign-out")
def sign_out():
    return jsonify("sign_out")

@auth_bp.post("/api/auth/refresh")
def refresh():
    return jsonify("refresh")