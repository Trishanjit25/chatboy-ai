from dotenv import load_dotenv # pyre-ignore
import os
load_dotenv()
from fastapi import FastAPI, Request, UploadFile, File, Form # pyre-ignore
from openai import OpenAI # pyre-ignore
from fastapi.templating import Jinja2Templates # pyre-ignore
from fastapi.staticfiles import StaticFiles # pyre-ignore
from fastapi.responses import HTMLResponse # pyre-ignore
from pydantic import BaseModel # pyre-ignore
import aiofiles # pyre-ignore
import os
import mimetypes
from typing import Optional
import base64

# ---------------------------
# 1. Configuration & Models
# ---------------------------

class Item(BaseModel):
    name: str
    description: str | None = None
    price: float

# Configure OpenAI client to use either direct Gemini API or OpenRouter
if os.getenv("GEMINI_API_KEY"):
    client = OpenAI(
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
        api_key=os.getenv("GEMINI_API_KEY")
    )
elif os.getenv("OPENROUTER_API_KEY"):
    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=os.getenv("OPENROUTER_API_KEY")
    )
else:
    print("Warning: Neither GEMINI_API_KEY nor OPENROUTER_API_KEY is set in the environment.")
    client = None



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

@app.post("/ai")
async def generate_response_with_files(
    prompt: str = Form(...),
    file: Optional[UploadFile] = File(None)
):
    try:
        # Handle file if uploaded
        if file and file.filename:
            # Read file content
            content = await file.read()
            
            # Determine file type and process accordingly
            mime_type = mimetypes.guess_type(file.filename)[0] or "application/octet-stream"
            
            if mime_type.startswith("text/"):
                # Text file - add content to prompt
                try:
                    text_content = content.decode("utf-8")
                    messages = [{"role": "user", "content": f"{prompt}\n\nFile content ({file.filename}):\n{text_content}"}]
                except UnicodeDecodeError:
                    messages = [{"role": "user", "content": f"{prompt}\n\nBinary file uploaded: {file.filename} (could not decode text)"}]
            
            elif mime_type.startswith("image/"):
                # For images, send base64 encoded data to OpenRouter
                base64_data = base64.b64encode(content).decode('utf-8')
                messages = [{
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{mime_type};base64,{base64_data}"
                            }
                        }
                    ]
                }]
            
            elif mime_type.startswith("audio/") or mime_type.startswith("video/"):
                if os.getenv("GEMINI_API_KEY"):
                    # Gemini OpenAI compatibility layer natively supports Audio and Video over the `image_url` schema!
                    base64_data = base64.b64encode(content).decode('utf-8')
                    messages = [{
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:{mime_type};base64,{base64_data}"
                                }
                            }
                        ]
                    }]
                else:
                    # Generic OpenAI / OpenRouter compatibility fallback
                    messages = [{"role": "user", "content": f"{prompt}\n\n🎤 Media message uploaded: {file.filename} ({mime_type})"}]

            
            else:
                # Other file types
                messages = [{"role": "user", "content": f"{prompt}\n\nFile uploaded: {file.filename} ({mime_type})"}]
        else:
            messages = [{"role": "user", "content": prompt}]
        
        if not client:
            return {"error": "API key not configured in environment"}
            
        headers = None
        if os.getenv("OPENROUTER_API_KEY") and not os.getenv("GEMINI_API_KEY"):
            headers = {
                "HTTP-Referer": "https://chatboy-ai.onrender.com",
                "X-Title": "ChatBoy AI",
            }
            
        completion = client.chat.completions.create(
            extra_headers=headers,
            model="gemini-2.0-flash" if os.getenv("GEMINI_API_KEY") else "google/gemma-3-4b-it:free",
            messages=messages
        )
        
        response_data = {"response": completion.choices[0].message.content}
        
        # Add file info if file was processed
        if file and file.filename:
            response_data["file_info"] = {
                "filename": file.filename,
                "size": len(content) if 'content' in locals() else 0,
                "type": mime_type if 'mime_type' in locals() else "unknown"
            }
        
        return response_data
        
    except Exception as e:
        return {"error": str(e)}

@app.get("/ai")
def generate_response(prompt: str = "Hello"):
    try:
        if not client:
            return {"error": "API key not configured in environment"}
            
        headers = None
        if os.getenv("OPENROUTER_API_KEY") and not os.getenv("GEMINI_API_KEY"):
            headers = {
                "HTTP-Referer": "https://chatboy-ai.onrender.com",
                "X-Title": "ChatBoy AI",
            }
            
        completion = client.chat.completions.create(
            extra_headers=headers,
            model="gemini-2.0-flash" if os.getenv("GEMINI_API_KEY") else "google/gemma-3-4b-it:free",
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        return {"response": completion.choices[0].message.content}
    except Exception as e:
        return {"error": str(e)}
