import os
import psycopg2

# Database configuration settings read from environment (safe defaults for dev)
DB_CONFIG = {
    'dbname': os.environ.get('DB_NAME', 'rsa'),
    'user': os.environ.get('DB_USER', 'postgres'),
    'password': os.environ.get('DB_PASSWORD', 'postgres'),
    'host': os.environ.get('DB_HOST', 'localhost'),
    'port': os.environ.get('DB_PORT', '5432'),
}

def get_db_connection():
    """Return a new psycopg2 connection using `DB_CONFIG`.

    This avoids opening a connection at import time (which fails in containers
    when the database isn't yet available).
    """
    return psycopg2.connect(**DB_CONFIG)

#Please use the below code for Email connection

email_from = os.environ.get('EMAIL_FROM', '')
email_password  = os.environ.get('EMAIL_PASSWORD', '')


#Please use the below snipppet for path storing (For images/videos/files or any other stotages)

rsa_path = os.environ.get('RSA_PATH', 'D:/IITM/RSA/')
rsa_user_images = os.environ.get('RSA_USER_IMAGES', 'D:/IITM/RSA/User Images/')
parent_dir = os.environ.get('PARENT_DIR', 'C:/Users/CoERS_VISHAL/Documents/RSA/')
send_from = os.environ.get('SEND_FROM', '')
send_pwd = os.environ.get('SEND_PWD', '')