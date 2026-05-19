import pandas as pd

customers = pd.read_csv(
    "../datasets/raw_data/olist_customers_dataset.csv"
)

orders = pd.read_csv(
    "../datasets/raw_data/olist_orders_dataset.csv"
)

payments = pd.read_csv(
    "../datasets/raw_data/olist_order_payments_dataset.csv"
)

order_items = pd.read_csv(
    "../datasets/raw_data/olist_order_items_dataset.csv"
)

products = pd.read_csv(
    "../datasets/raw_data/olist_products_dataset.csv"
)

orders["order_purchase_timestamp"] = pd.to_datetime(
    orders["order_purchase_timestamp"]
)

orders["purchase_month"] = (
    orders["order_purchase_timestamp"]
    .dt.month
)

orders_payments = orders.merge(
    payments,
    on="order_id",
    how="inner"
)

master_df = (
    orders_payments.merge(
        order_items,
        on="order_id",
        how="inner"
    )
)

master_df = master_df.merge(
    products,
    on="product_id",
    how="inner"
)

master_df = master_df.merge(
    customers,
    on="customer_id",
    how="inner"
)