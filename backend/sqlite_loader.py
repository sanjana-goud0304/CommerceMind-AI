import pandas as pd
import sqlite3

conn = sqlite3.connect("commerce.db")

datasets = {
    "customers": "../datasets/raw_data/olist_customers_dataset.csv",
    "orders": "../datasets/raw_data/olist_orders_dataset.csv",
    "payments": "../datasets/raw_data/olist_order_payments_dataset.csv",
    "products": "../datasets/raw_data/olist_products_dataset.csv",
    "order_items": "../datasets/raw_data/olist_order_items_dataset.csv"
}

for table, path in datasets.items():

    print(f"Loading {table}...")

    df = pd.read_csv(path)

    df.to_sql(
        table,
        conn,
        if_exists="replace",
        index=False
    )

    print(f"{table} loaded!")

conn.close()

print("SQLite database ready!")