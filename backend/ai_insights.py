from google import genai
from dotenv import load_dotenv
import os

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

prompt = """
Our e-commerce analysis shows:

- August had highest orders
- Credit card was the most used payment method
- cama_mesa_banho generated highest revenue
- Most customers are Regular users
- Around 130 customers are VIPs

Generate business insights and recommendations.
"""

response = client.models.generate_content(
    model="gemini-2.0-flash",
    contents=prompt
)

print(response.text)