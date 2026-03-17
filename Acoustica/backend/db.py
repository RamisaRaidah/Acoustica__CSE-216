import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv
import logging
import sqlparse
import urllib.parse as up
import sys
from psycopg2 import pool

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout
)

connection_pool = None


def get_db_connection():
    try:
        database_url = os.environ.get("DATABASE_URL")
        if database_url:

            #connection pooling to reduce latency
            global connection_pool
            if connection_pool is None:
                init_connection_pool()

            if connection_pool is None:
                logging.error("Connection pool not initialized")
                return None
            

            connection = connection_pool.getconn()
            logging.info("Got connection from pool")
            return connection
        
            # For docker database
            # connection = psycopg2.connect(database_url)

            #For supabase database  -- without pooling
            # result=up.urlparse(database_url)
            # connection=psycopg2.connect(
            #     dbname=result.path[1:],
            #     user=result.username,
            #     password=result.password,
            #     host=result.hostname,
            #     port=result.port,
            #     sslmode="require"
            # )
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


def init_connection_pool():
    global connection_pool

    if connection_pool is not None:
        return

    database_url = os.environ.get("DATABASE_URL")
    
    if not database_url:
        logging.error("DATABASE_URL not found")
        return

    result = up.urlparse(database_url)

    try:
        connection_pool = pool.SimpleConnectionPool(
            minconn=1,
            maxconn=10,
            dbname=result.path[1:],
            user=result.username,
            password=result.password,
            host=result.hostname,
            port=result.port,
            sslmode="require"
        )
        logging.info("Connection pool initialized")
    except Exception as e:
        logging.error(f"Failed to initialize connection pool: {e}")

def release_connection(connection):
    if connection and connection_pool:
        connection_pool.putconn(connection)
        logging.info("Connection returned to pool")


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
                    result = True
                return result
    except Exception as e:
        logging.error(f"Execution failed: {e}")
        return None
    finally:
        release_connection(connection)

def close_pool():
    global connection_pool
    if connection_pool:
        connection_pool.closeall()
        logging.info("Connection pool closed")