import mysql.connector
from mysql.connector import Error
import os

def get_db_connection():
    return mysql.connector.connect(
        host=os.environ.get('MYSQL_HOST', 'localhost'),
        user=os.environ.get('MYSQL_USER', 'root'),
        password=os.environ.get('MYSQL_PASSWORD', ''),
        database=os.environ.get('MYSQL_DB', 'pharmalens'),
        port=int(os.environ.get('MYSQL_PORT', 3306))
    )
