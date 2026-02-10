from flask import Blueprint, render_template, jsonify
from dotenv import load_dotenv
from db import execute_sql
import logging

load_dotenv()

logging.basicConfig(
    filename = "app.log",
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s"
)

admins = Blueprint("admins", __name__) 

@admins.route("/admins")
def admins_home():
    return jsonify("admins")