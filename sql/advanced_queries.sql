/*QUERY 1 — Top Revenue Categories*/
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

/*Top Spending Customers*/

SELECT
    c.customer_unique_id,
    ROUND(
        SUM(pay.payment_value),
        2
    ) AS total_spent
FROM customers c
JOIN orders o
ON c.customer_id = o.customer_id
JOIN payments pay
ON o.order_id = pay.order_id
GROUP BY c.customer_unique_id
ORDER BY total_spent DESC
LIMIT 10;

/*QUERY 3 — Repeat Customers*/
SELECT
    c.customer_unique_id,
    COUNT(o.order_id)
    AS total_orders
FROM customers c
JOIN orders o
ON c.customer_id = o.customer_id
GROUP BY c.customer_unique_id
HAVING total_orders > 1
ORDER BY total_orders DESC;

/*QUERY 4 — Monthly Revenue Trend*/
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

/*QUERY 5 — Average Order Value (AOV)*/
SELECT
    ROUND(
        AVG(payment_value),
        2
    ) AS average_order_value
FROM payments;

/*QUERY 6 — Customer Segmentation Using CASE*/
SELECT
    c.customer_unique_id,
    ROUND(
        SUM(pay.payment_value),
        2
    ) AS total_spent,
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
ORDER BY total_spent DESC;

/*QUERY 7 — Top Products Per Month (WINDOW FUNCTION)*/
WITH product_sales AS (
    SELECT
        MONTH(o.order_purchase_timestamp)
        AS month,
        p.product_category_name,
        ROUND(
            SUM(pay.payment_value),
            2
        ) AS revenue
    FROM orders o
    JOIN payments pay
    ON o.order_id = pay.order_id
    JOIN order_items oi
    ON o.order_id = oi.order_id
    JOIN products p
    ON oi.product_id = p.product_id
    GROUP BY month, p.product_category_name
),

ranked_products AS (
    SELECT *,
    RANK() OVER(
        PARTITION BY month
        ORDER BY revenue DESC
    ) AS ranking
    FROM product_sales
)
SELECT *
FROM ranked_products
WHERE ranking = 1;