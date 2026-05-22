from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from services import (
    get_top_categories,
    get_monthly_revenue,
    get_customer_segments,
    get_category_revenue,
    get_monthly_category_revenue,
    get_kpis,
    get_payment_breakdown,
    get_repeat_customers,
    get_top_customers
)

app = FastAPI()

# ─────────────────────────────────────────────
# CORS
# ─────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# ROOT
# ─────────────────────────────────────────────
@app.get("/")
def home():

    return {
        "message": "CommerceMind AI Backend Running"
    }

# ─────────────────────────────────────────────
# TOP CATEGORIES
# ─────────────────────────────────────────────
@app.get("/top-categories")
def top_categories():

    return get_top_categories()

# ─────────────────────────────────────────────
# MONTHLY REVENUE
# ─────────────────────────────────────────────
@app.get("/monthly-revenue")
def monthly_revenue():

    return get_monthly_revenue()

# ─────────────────────────────────────────────
# CUSTOMER SEGMENTS
# ─────────────────────────────────────────────
@app.get("/customer-segments")
def customer_segments():

    return get_customer_segments()

# ─────────────────────────────────────────────
# CATEGORY REVENUE
# ─────────────────────────────────────────────
@app.get("/category-revenue")
def category_revenue():

    return get_category_revenue()

# ─────────────────────────────────────────────
# MONTHLY CATEGORY REVENUE
# ─────────────────────────────────────────────
@app.get("/monthly-category-revenue")
def monthly_category_revenue():

    return get_monthly_category_revenue()

# ─────────────────────────────────────────────
# KPI SUMMARY
# ─────────────────────────────────────────────
@app.get("/kpis")
def kpis():

    return get_kpis()

# ─────────────────────────────────────────────
# PAYMENT BREAKDOWN
# ─────────────────────────────────────────────
@app.get("/payment-breakdown")
def payment_breakdown():

    return get_payment_breakdown()

# ─────────────────────────────────────────────
# REPEAT CUSTOMERS
# ─────────────────────────────────────────────
@app.get("/repeat-customers")
def repeat_customers():

    return get_repeat_customers()

# ─────────────────────────────────────────────
# TOP CUSTOMERS
# ─────────────────────────────────────────────
@app.get("/top-customers")
def top_customers():

    return get_top_customers()