import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv
import logging
import sqlparse

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
    
def init_db():
    connection = get_db_connection()
    if connection is None:
        logging.error("Database connection failed")
        return None
    try:
        with connection:
            with connection.cursor() as cursor:
                with open(r"C:\Users\ramis\Documents\Acoustica__CSE-216\Acoustica\database\db.sql", 'r') as f:
                    schema = f.read()
                commands = sqlparse.split(schema)
                for command in commands:
                    command = command.strip()
                    if command:
                        try:
                            cursor.execute(command)
                            connection.commit()
                        except psycopg2.errors.DuplicateObject:
                            connection.rollback()
                logging.info("Database created successfully")
    except Exception as e:
        logging.error(f"Database creation failed: {e}")
    finally:
        connection.close()

def execute_query(query, params = None, fetch_one = False, fetch_all = False):
    connection = get_db_connection()
    if connection is None:
        logging.error("Database connection failed")
        return None
    try:
        with connection:
            with connection.cursor(cursor_factory = RealDictCursor) as cursor:
                cursor.execute(query, params)
                if fetch_one:
                    result = cursor.fetchone()
                elif fetch_all:
                    result = cursor.fetchall()
                else:
                    result = None
                return result
    except Exception as e:
        logging.error(f"Query failed: {e}")
        return None
    finally:
        connection.close()