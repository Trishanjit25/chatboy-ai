import os
from openai import OpenAI # pyre-ignore
from dotenv import load_dotenv # pyre-ignore

load_dotenv()

client = OpenAI(
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
    api_key=os.getenv("GEMINI_API_KEY")
)

try:
    print("Testing gemini-2.5-flash...")
    response = client.chat.completions.create(
        model="gemini-2.5-flash",
        messages=[{"role": "user", "content": "hello"}]
    )
    print("Success:", response.choices[0].message.content)
except Exception as e:
    print("Error:", str(e))

try:
    print("\nTesting gemini-2.0-flash...")
    response = client.chat.completions.create(
        model="gemini-2.0-flash",
        messages=[{"role": "user", "content": "hello"}]
    )
    print("Success:", response.choices[0].message.content)
except Exception as e:
    print("Error:", str(e))
