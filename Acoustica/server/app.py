from flask import Flask, jsonify
from dotenv import load_dotenv
from db import get_db_connection, init_db, execute_query

app = Flask(__name__)
load_dotenv()

@app.route("/")
def home():
    res = execute_query("SELECT * FROM country;", fetch_all = True)
    return jsonify(res)

if __name__ == "__main__":
    init_db()
    app.run(host = "127.0.0.1", port = 5000, debug = True)