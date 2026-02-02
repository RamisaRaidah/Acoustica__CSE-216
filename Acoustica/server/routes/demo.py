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

demo = Blueprint("demo", __name__) # set the blueprint name and add the blueprint to app.py

@demo.route("/demo")
def demo_home():
    return render_template("demo.html")