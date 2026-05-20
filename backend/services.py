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
        YEAR(o.order_purchase_timestamp)
        AS year,

        MONTH(o.order_purchase_timestamp)
        AS month,

        ROUND(
            SUM(pay.payment_value),
            2
        ) AS revenue

    FROM orders o

    JOIN payments pay
    ON o.order_id = pay.order_id

    GROUP BY year, month

    ORDER BY year, month;
    """

    df = pd.read_sql(query, engine)

    return df.to_dict(orient="records")


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