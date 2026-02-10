from flask import Blueprint, jsonify
from dotenv import load_dotenv
from db import execute_sql
import logging

load_dotenv()

logging.basicConfig(
    filename = "app.log",
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s"
)

auth = Blueprint("auth", __name__) 

@auth.get("/auth")
def health():
    return jsonify("auth")

@auth.post("/api/auth/sign-up")
def sign_up():
    return jsonify("sign_up")

@auth.post("/api/auth/sign-in")
def sign_in():
    return jsonify("sign_in")

@auth.post("/api/auth/sign-out")
def sign_out():
    return jsonify("sign_out")

@auth.post("/api/auth/refresh")
def refresh():
    return jsonify("refresh")