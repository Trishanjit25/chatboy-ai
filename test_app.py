import os
from fastapi.testclient import TestClient # pyre-ignore
from app import app # pyre-ignore
import base64

client = TestClient(app)

def test_prompt_endpoint():
    print("Testing /ai GET endpoint with simple text...")
    response = client.get("/ai?prompt=hello")
    print(response.json())

def test_prompt_with_emoji():
    print("Testing /ai with emoji...")
    response = client.post("/ai", data={"prompt": "hello 😊"})
    print(response.json())

if __name__ == "__main__":
    test_prompt_endpoint()
    test_prompt_with_emoji()
