# CLI version of Chat Boy AI Chatbot
# Usage: python lim.py

from openai import OpenAI
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get API key from environment variable
api_key = os.getenv("OPENROUTER_API_KEY")

if not api_key:
    print("Error: OPENROUTER_API_KEY not found in .env file!")
    print("Please create a .env file with your API key.")
    print("Get your free API key from: https://openrouter.ai/keys")
    exit(1)

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=api_key
)

# Take user input
user_input = input("Ask something: ")

completion = client.chat.completions.create(
    model="google/gemma-3-4b-it:free",
    messages=[
        {
            "role": "user",
            "content": user_input
        }
    ]
)

# Print response
print("\nAI Reply:")
print(completion.choices[0].message.content)
