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

subscriptions = Blueprint("subscriptions", __name__) 

@subscriptions.route("/subscriptions")
def subscriptions_home():
    return jsonify("subscriptions")