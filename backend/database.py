from dotenv import load_dotenv
from sqlalchemy import create_engine
import os

load_dotenv()

DB_HOST = os.getenv("MYSQLHOST")
DB_PORT = os.getenv("MYSQLPORT")
DB_USER = os.getenv("MYSQLUSER")
DB_PASSWORD = os.getenv("MYSQLPASSWORD")
DB_NAME = os.getenv("MYSQLDATABASE")

DATABASE_URL = (
    f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}"
    f"@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=180,
    pool_timeout=60,
    pool_size=5,
    max_overflow=10,
    connect_args={
        "connect_timeout": 120,
        "read_timeout": 120,
        "write_timeout": 120
    }
)