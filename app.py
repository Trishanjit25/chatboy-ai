import os
from fastapi import FastAPI, Request
from openai import OpenAI
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from pydantic import BaseModel

# ---------------------------
# 1. Configuration & Models
# ---------------------------

class Item(BaseModel):
    name: str
    description: str | None = None
    price: float

# Use environment variable (SAFE)
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.environ.get("OPENROUTER_API_KEY")
)

app = FastAPI()

# ---------------------------
# 2. Static & Templates
# ---------------------------

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# ---------------------------
# 3. Routes
# ---------------------------

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/about", response_class=HTMLResponse)
async def read_about(request: Request):
    return templates.TemplateResponse("about.html", {"request": request})

@app.get("/health")
def health_check():
    return {"status": "running"}

@app.get("/items/{item_id}")
def read_item(item_id: int, q: str | None = None):
    return {"item_id": item_id, "q": q}

@app.post("/items/")
def create_item(item: Item):
    return {"message": "Item created", "item": item}

# ---------------------------
# 4. AI Endpoint
# ---------------------------

@app.get("/ai")
def generate_response(prompt: str = "Hello"):
    try:
        completion = client.chat.completions.create(
            extra_headers={
                "HTTP-Referer": "https://chatboy-ai.onrender.com",
                "X-Title": "ChatBoy AI",
            },
            model="google/gemma-3-4b-it:free",
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        return {"response": completion.choices[0].message.content}
    except Exception as e:
        return {"error": str(e)}
