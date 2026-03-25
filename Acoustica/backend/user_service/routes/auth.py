from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt, jwt_required, get_jwt_identity
import logging
import sys

from user_service.services import auth

logging.basicConfig(
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout
)

auth_bp = Blueprint("auth", __name__) 

@auth_bp.get("/api/auth/health")
def health():
    return jsonify("auth is alive!!!")

@auth_bp.post("/api/auth/sign-up")
def sign_up_route():
    data=request.json
    result,status=auth.sign_up(data)
    return jsonify(result),status

@auth_bp.post("/api/auth/sign-in")
def sign_in_route():
    data=request.json
    result,status=auth.sign_in(data.get("email"),data.get("password"))
    return jsonify(result),status

@auth_bp.post("/api/auth/sign-out")
@jwt_required()
def sign_out_route():
    return jsonify(auth.sign_out())

@auth_bp.post("/api/auth/refresh")
@jwt_required()
def refresh_route():
    identity=get_jwt_identity()
    result,status=auth.refresh(identity)
    return jsonify(result),status

