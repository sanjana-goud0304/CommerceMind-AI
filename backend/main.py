from fastapi import FastAPI

from services import (
    get_top_categories,
    get_monthly_revenue,
    get_customer_segments
)

app = FastAPI()


@app.get("/")
def home():

    return {
        "message": "CommerceMind AI Backend Running"
    }


@app.get("/top-categories")
def top_categories():

    return get_top_categories()


@app.get("/monthly-revenue")
def monthly_revenue():

    return get_monthly_revenue()


@app.get("/customer-segments")
def customer_segments():

    return get_customer_segments()