import pandas as pd
from database import engine


def get_top_categories():

    query = """
    SELECT
        p.product_category_name,

        ROUND(
            SUM(pay.payment_value),
            2
        ) AS total_revenue

    FROM order_items oi

    JOIN payments pay
    ON oi.order_id = pay.order_id

    JOIN products p
    ON oi.product_id = p.product_id

    GROUP BY p.product_category_name

    ORDER BY total_revenue DESC

    LIMIT 10;
    """

    df = pd.read_sql(query, engine)

    return df.to_dict(orient="records")


def get_monthly_revenue():

    query = """
    SELECT
        YEAR(order_purchase_timestamp) AS year,
        MONTH(order_purchase_timestamp) AS month,
        ROUND(SUM(payment_value), 2) AS revenue,
        COUNT(DISTINCT orders.order_id) AS orders

    FROM orders

    JOIN payments
        ON orders.order_id = payments.order_id

    GROUP BY year, month

    ORDER BY year, month;
    """

    result = pd.read_sql(query, engine)

    return result.to_dict(orient="records")


def get_customer_segments():

    query = """
    SELECT
    customer_segment,
    COUNT(*) AS total_customers

FROM (

    SELECT

        c.customer_unique_id,

        CASE

            WHEN SUM(pay.payment_value) > 5000
            THEN 'VIP'

            WHEN SUM(pay.payment_value) > 2000
            THEN 'Premium'

            ELSE 'Regular'

        END AS customer_segment

    FROM customers c

    JOIN orders o
    ON c.customer_id = o.customer_id

    JOIN payments pay
    ON o.order_id = pay.order_id

    GROUP BY c.customer_unique_id

) AS segmented_customers

GROUP BY customer_segment;
    """

    df = pd.read_sql(query, engine)

    return df.to_dict(orient="records")

def get_category_revenue():

    query = """
    SELECT
        products.product_category_name AS category,

        ROUND(SUM(payments.payment_value), 2) AS revenue

    FROM orders

    JOIN order_items
        ON orders.order_id = order_items.order_id

    JOIN products
        ON order_items.product_id = products.product_id

    JOIN payments
        ON orders.order_id = payments.order_id

    GROUP BY products.product_category_name

    ORDER BY revenue DESC

    LIMIT 10;
    """

    result = pd.read_sql(query, engine)

    return result.to_dict(orient="records")

def get_monthly_category_revenue():

    query = """
    SELECT
        YEAR(o.order_purchase_timestamp) AS year,

        MONTH(o.order_purchase_timestamp) AS month,

        p.product_category_name AS category,

        ROUND(SUM(oi.price), 2) AS revenue

    FROM orders o

    JOIN order_items oi
        ON o.order_id = oi.order_id

    JOIN products p
        ON oi.product_id = p.product_id

    WHERE p.product_category_name IN (
        'beleza_saude',
        'relogios_presentes',
        'cama_mesa_banho',
        'esporte_lazer',
        'informatica_acessorios'
    )

    GROUP BY
        YEAR(o.order_purchase_timestamp),
        MONTH(o.order_purchase_timestamp),
        p.product_category_name

    ORDER BY
        YEAR(o.order_purchase_timestamp),
        MONTH(o.order_purchase_timestamp);
    """

    result = pd.read_sql(query, engine)

    return result.to_dict(orient="records")

    
    