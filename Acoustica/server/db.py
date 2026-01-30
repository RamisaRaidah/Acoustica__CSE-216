import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv
import logging

load_dotenv()

logging.basicConfig(
    filename = "app.log",
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s"
)

def get_db_connection():
    try:
        if os.environ.get("DATABASE_URL"):
            connection = psycopg2.connect(os.environ["DATABASE_URL"])
        else:
            connection = psycopg2.connect(
                host=os.environ["DB_HOST"],
                database=os.environ["DB_NAME"], 
                user=os.environ["DB_USER"],
                password=os.environ["DB_PASSWORD"]
            )
        logging.info("db connected")
        return connection  
    except Exception as e:
        logging.error(f"Database connection failed: {e}")
        return None
    

def execute_query(query, params = None, fetch_one = False, fetch_all = False):
    connection = get_db_connection()
    if connection is None:
        logging.error("Database connection failed")
        return None
    with connection:
        with connection.cursor(cursor_factory = RealDictCursor) as cursor:
            try:
                cursor.execute(query, params)
                if fetch_one:
                    result = cursor.fetchone()
                elif fetch_all:
                    result = cursor.fetchall()
                else:
                    result = None
                connection.commit()
                return result
            except Exception as e:
                connection.rollback()
                logging.error(f"Query failed: {e}")
                return None
