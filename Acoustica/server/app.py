from flask import Flask, jsonify
from dotenv import load_dotenv
from db import get_db_connection, execute_query

app = Flask(__name__)
load_dotenv()

@app.route("/")
def home():
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(""" 
                DROP TABLE user_demo;
            """)
    res = execute_query("SELECT * FROM user_demo;", fetch_all = True)
    return jsonify(res)

if __name__ == "__main__":
    app.run(host = "127.0.0.1", port = 5000, debug = True)