from flask import Flask, jsonify, request
from dotenv import load_dotenv
from db import get_db_connection, init_db, execute_query
import logging

app = Flask(__name__)
load_dotenv()

@app.route("/")
def home():
    return "Home"

@app.route("/add_asset", methods = ["POST"])
def add_asset():
    type = request.form.get("type")
    connection = get_db_connection()
    if connection is None:
        logging.error("Database connection failed")
        return None
    try:
        with connection:
            with connection.cursor() as cursor:
                cursor.execute("INSERT INTO asset (asset_type) VALUES (%s)", (type))
                logging.info("Inserted successfully")
    except Exception as e:
        logging.error(f"Insertion failed: {e}")
    finally:
        connection.close()
    return jsonify("Null")


@app.route("/assets")
def get_songs():
    res = execute_query("SELECT * FROM asset", fetch_all = True)
    return jsonify(res)

if __name__ == "__main__":
    init_db()
    app.run(host = "127.0.0.1", port = 5000, debug = False)