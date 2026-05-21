from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from services import (
    get_top_categories,
    get_monthly_revenue,
    get_customer_segments,
    get_category_revenue,
    get_monthly_category_revenue
)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():

    return {
        "message": "CommerceMind AI Backend Running"
    }

from fastapi.middleware.cors import CORSMiddleware
@app.get("/top-categories")
def top_categories():

    return get_top_categories()


@app.get("/monthly-revenue")
def monthly_revenue():

    return get_monthly_revenue()


@app.get("/customer-segments")
def customer_segments():

    return get_customer_segments()

@app.get("/category-revenue")
def category_revenue():
    return get_category_revenue()

@app.get("/monthly-category-revenue")
def monthly_category_revenue():
    return get_monthly_category_revenue()