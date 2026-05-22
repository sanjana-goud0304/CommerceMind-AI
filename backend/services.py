import pandas as pd
from database import engine


# ─────────────────────────────────────────────
# TOP CATEGORIES
# ─────────────────────────────────────────────
def get_top_categories():

    query = """
    WITH payment_per_order AS (

        SELECT
            order_id,
            SUM(payment_value) AS total_payment

        FROM payments

        GROUP BY order_id
    ),

    item_counts AS (

        SELECT
            order_id,
            COUNT(*) AS item_count

        FROM order_items

        GROUP BY order_id
    )

    SELECT

        p.product_category_name,

        ROUND(
            SUM(
                ppo.total_payment / ic.item_count
            ),
            2
        ) AS total_revenue

    FROM order_items oi

    JOIN products p
    ON oi.product_id = p.product_id

    JOIN payment_per_order ppo
    ON oi.order_id = ppo.order_id

    JOIN item_counts ic
    ON oi.order_id = ic.order_id

    GROUP BY p.product_category_name

    ORDER BY total_revenue DESC

    LIMIT 10;
    """

    result = pd.read_sql(query, engine)

    return result.to_dict(orient="records")


# ─────────────────────────────────────────────
# MONTHLY REVENUE
# ─────────────────────────────────────────────
def get_monthly_revenue():

    query = """
    SELECT

        YEAR(o.order_purchase_timestamp) AS year,

        MONTH(o.order_purchase_timestamp) AS month,

        ROUND(
            SUM(pay.payment_value),
            2
        ) AS revenue,

        COUNT(DISTINCT o.order_id)
        AS orders

    FROM orders o

    JOIN payments pay
    ON o.order_id = pay.order_id
    GROUP BY year, month
    HAVING revenue > 0
    ORDER BY year, month;
    """

    result = pd.read_sql(query, engine)

    return result.to_dict(orient="records")


# ─────────────────────────────────────────────
# CUSTOMER SEGMENTS
# ─────────────────────────────────────────────
def get_customer_segments():

    query = """
    SELECT

        customer_segment,

        COUNT(*) AS count,

        ROUND(
            SUM(total_spent),
            2
        ) AS revenue

    FROM (

        SELECT

            c.customer_unique_id,

            SUM(pay.payment_value)
            AS total_spent,

            CASE

    WHEN SUM(pay.payment_value) > 1000
    THEN 'VIP'

    WHEN SUM(pay.payment_value) > 500
    THEN 'Premium'

    ELSE 'Regular'

END AS customer_segment

        FROM customers c

        JOIN orders o
            ON c.customer_id = o.customer_id

        JOIN payments pay
            ON o.order_id = pay.order_id

        GROUP BY c.customer_unique_id

    ) segmented

    GROUP BY customer_segment;
    """

    df = pd.read_sql(query, engine)

    return df.to_dict(orient="records")


# ─────────────────────────────────────────────
# CATEGORY REVENUE
# ─────────────────────────────────────────────
def get_category_revenue():

    query = """
    WITH payment_per_order AS (

        SELECT
            order_id,
            SUM(payment_value) AS total_payment

        FROM payments

        GROUP BY order_id
    ),

    item_counts AS (

        SELECT
            order_id,
            COUNT(*) AS item_count

        FROM order_items

        GROUP BY order_id
    )

    SELECT

        p.product_category_name AS category,

        ROUND(
            SUM(
                ppo.total_payment / ic.item_count
            ),
            2
        ) AS revenue

    FROM orders o

    JOIN payment_per_order ppo
    ON o.order_id = ppo.order_id

    JOIN order_items oi
    ON o.order_id = oi.order_id

    JOIN products p
    ON oi.product_id = p.product_id

    JOIN item_counts ic
    ON o.order_id = ic.order_id

    GROUP BY p.product_category_name

    ORDER BY revenue DESC

    LIMIT 10;
    """

    result = pd.read_sql(query, engine)

    return result.to_dict(orient="records")


# ─────────────────────────────────────────────
# MONTHLY CATEGORY REVENUE
# ─────────────────────────────────────────────
def get_monthly_category_revenue():

    query = """
    WITH top_categories AS (

        SELECT

            p.product_category_name

        FROM order_items oi

        JOIN products p
        ON oi.product_id = p.product_id

        GROUP BY p.product_category_name

        ORDER BY SUM(oi.price) DESC

        LIMIT 5
    )

    SELECT

        YEAR(o.order_purchase_timestamp) AS year,

        MONTH(o.order_purchase_timestamp) AS month,

        p.product_category_name AS category,

        ROUND(
            SUM(oi.price),
            2
        ) AS revenue

    FROM orders o

    JOIN order_items oi
    ON o.order_id = oi.order_id

    JOIN products p
    ON oi.product_id = p.product_id

    JOIN top_categories tc
    ON p.product_category_name =
       tc.product_category_name

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


# ─────────────────────────────────────────────
# KPI SUMMARY
# ─────────────────────────────────────────────
def get_kpis():

    query = """
    SELECT

        ROUND(
            SUM(payment_value),
            2
        ) AS total_revenue,

        COUNT(DISTINCT orders.order_id)
        AS total_orders

    FROM orders

    JOIN payments
    ON orders.order_id = payments.order_id;
    """

    result = pd.read_sql(query, engine)

    return result.to_dict(orient="records")


# ─────────────────────────────────────────────
# PAYMENT BREAKDOWN
# ─────────────────────────────────────────────
def get_payment_breakdown():

    query = """
    SELECT

        payment_type,

        ROUND(
            SUM(payment_value),
            2
        ) AS revenue

    FROM payments

    GROUP BY payment_type

    ORDER BY revenue DESC;
    """

    result = pd.read_sql(query, engine)

    return result.to_dict(orient="records")


# ─────────────────────────────────────────────
# REPEAT CUSTOMERS
# ─────────────────────────────────────────────
def get_repeat_customers():

    query = """
    WITH customer_orders AS (

        SELECT

            c.customer_unique_id,

            COUNT(DISTINCT o.order_id)
            AS total_orders

        FROM customers c

        JOIN orders o
        ON c.customer_id = o.customer_id

        GROUP BY c.customer_unique_id
    )

    SELECT

        SUM(
            CASE
                WHEN total_orders = 1
                THEN 1
                ELSE 0
            END
        ) AS single_purchase,

        SUM(
            CASE
                WHEN total_orders > 1
                THEN 1
                ELSE 0
            END
        ) AS repeat_purchase

    FROM customer_orders;
    """

    result = pd.read_sql(query, engine)

    return result.to_dict(orient="records")


# ─────────────────────────────────────────────
#TOP CUSTOMERS
# ─────────────────────────────────────────────
def get_top_customers():

    query = """
    SELECT

        c.customer_unique_id AS customer_id,

        ROUND(
            SUM(pay.payment_value),
            2
        ) AS total_spend,

        COUNT(DISTINCT o.order_id)
        AS orders

    FROM customers c

    JOIN orders o
    ON c.customer_id = o.customer_id

    JOIN payments pay
    ON o.order_id = pay.order_id

    GROUP BY c.customer_unique_id

    ORDER BY total_spend DESC

    LIMIT 10;
    """

    result = pd.read_sql(query, engine)

    return result.to_dict(orient="records")


