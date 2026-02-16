import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv
import logging
import sqlparse
import urllib.parse as up
import sys

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout
)


def get_db_connection():
    try:
        database_url = os.environ.get("DATABASE_URL")
        if database_url:
            # For docker database
            # connection = psycopg2.connect(database_url)

            #For supabase database
            result=up.urlparse(database_url)
            connection=psycopg2.connect(
                dbname=result.path[1:],
                user=result.username,
                password=result.password,
                host=result.hostname,
                port=result.port,
                sslmode="require"
            )
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
                with open(os.environ["ARANA_SCHEMA_LOCATION"], 'r', encoding = 'utf-8') as f:
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

def execute_sql(sql_command, param = None, fetch_one = False, fetch_all = False):
    connection = get_db_connection()
    if connection is None:
        logging.error("Database connection failed")
        return None
    try:
        with connection:
            with connection.cursor(cursor_factory = RealDictCursor) as cursor:
                cursor.execute(sql_command, param)
                if fetch_one:
                    result = cursor.fetchone()
                elif fetch_all:
                    result = cursor.fetchall()
                else:
                    result = None
                return result
    except Exception as e:
        logging.error(f"Execution failed: {e}")
        return None
    finally:
        connection.close()