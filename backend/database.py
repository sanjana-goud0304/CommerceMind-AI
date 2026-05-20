from sqlalchemy import create_engine

DATABASE_URL = (
    "mysql+pymysql://root:root%40123@localhost/commercemind_ai"
)

engine = create_engine(DATABASE_URL)