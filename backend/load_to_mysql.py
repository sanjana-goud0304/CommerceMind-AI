import pandas as pd
from sqlalchemy import create_engine

# MySQL connection
engine = create_engine(
    "mysql+pymysql://root:root%40123@localhost/commercemind_ai"
)

# Load datasets
customers = pd.read_csv(
    "../datasets/raw_data/olist_customers_dataset.csv"
)

orders = pd.read_csv(
    "../datasets/raw_data/olist_orders_dataset.csv"
)

payments = pd.read_csv(
    "../datasets/raw_data/olist_order_payments_dataset.csv"
)

products = pd.read_csv(
    "../datasets/raw_data/olist_products_dataset.csv"
)

order_items = pd.read_csv(
    "../datasets/raw_data/olist_order_items_dataset.csv"
)

# Push tables into MySQL
customers.to_sql(
    "customers",
    engine,
    if_exists="replace",
    index=False
)

orders.to_sql(
    "orders",
    engine,
    if_exists="replace",
    index=False
)

payments.to_sql(
    "payments",
    engine,
    if_exists="replace",
    index=False
)

products.to_sql(
    "products",
    engine,
    if_exists="replace",
    index=False
)

order_items.to_sql(
    "order_items",
    engine,
    if_exists="replace",
    index=False
)

print("All tables loaded into MySQL successfully!")