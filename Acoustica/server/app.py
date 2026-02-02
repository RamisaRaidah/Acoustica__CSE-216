from flask import Flask, jsonify, request
from dotenv import load_dotenv
from db import init_db, execute_sql
import logging

# import the blueprints
from routes import demo

load_dotenv()

logging.basicConfig(
    filename = "app.log",
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s"
)

app = Flask(__name__)

# register the blueprints
app.register_blueprint(demo.demo)

@app.route("/")
def home():
    return "Home"

@app.route("/add_asset", methods = ["POST"])
def add_asset():
    data = request.get_json()
    asset_type = data.get("type")
    execute_sql("INSERT INTO asset (asset_type) VALUES (%s)", (asset_type,))
    return jsonify({"status": "insersion successful"})


@app.route("/assets")
def get_songs():
    res = execute_sql("SELECT * FROM asset", fetch_all = True)
    return jsonify(res)

if __name__ == "__main__":
    init_db()
    app.run(host = "127.0.0.1", port = 5000, debug = True)