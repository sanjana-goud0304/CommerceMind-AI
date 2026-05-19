from fastapi import FastAPI
from analytics import master_df

app = FastAPI()

@app.get("/")
def home():

    return {
        "message": "CommerceMind AI Backend Running"
    }

@app.get("/top-categories")
def top_categories():

    top_categories = (
        master_df["product_category_name"]
        .value_counts()
        .head(10)
        .to_dict()
    )

    return top_categories

@app.get("/monthly-revenue")
def monthly_revenue():

    revenue = (
        master_df.groupby(
            "purchase_month"
        )["payment_value"]
        .sum()
        .to_dict()
    )

    return revenue

@app.get("/customer-segments")
def customer_segments():

    customer_summary = (
        master_df.groupby("customer_unique_id")
        .agg({
            "payment_value": "sum"
        })
    )

    def segment(spent):

        if spent > 5000:
            return "VIP"

        elif spent > 2000:
            return "Premium"

        else:
            return "Regular"

    customer_summary["segment"] = (
        customer_summary["payment_value"]
        .apply(segment)
    )

    segments = (
        customer_summary["segment"]
        .value_counts()
        .to_dict()
    )

    return segments