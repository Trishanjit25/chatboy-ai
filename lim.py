# CLI version of Chat Boy AI Chatbot
# Usage: python lim.py

from openai import OpenAI # pyre-ignore
import os
import mimetypes
import base64
from dotenv import load_dotenv # pyre-ignore

# Load environment variables
load_dotenv()

# Configure OpenAI client to use either direct Gemini API or OpenRouter
if os.getenv("GEMINI_API_KEY"):
    client = OpenAI(
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
        api_key=os.getenv("GEMINI_API_KEY")
    )
    model = "gemini-2.0-flash"
    headers = None
elif os.getenv("OPENROUTER_API_KEY"):
    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=os.getenv("OPENROUTER_API_KEY")
    )
    model = "google/gemma-3-4b-it:free"
    headers = {
        "HTTP-Referer": "https://github.com/Trishanjit25/chatboy-ai",
        "X-Title": "ChatBoy AI CLI",
    }
else:
    print("Error: Neither GEMINI_API_KEY nor OPENROUTER_API_KEY found in .env file!")
    print("Please create a .env file with your API key.")
    exit(1)

# Take user input
print("Chat Boy AI CLI (Type 'quit' to exit)")
print("You can type text, emojis, or provide a path to a file (image, audio, document) when asked.")
print("-" * 50)

while True:
    user_input = input("\nAsk something: ")
    
    if user_input.lower() in ['quit', 'exit', 'q']:
        break
        
    file_path = input("Attach file path (optional, press Enter to skip): ").strip()
    
    messages = []
    
    if file_path:
        # Remove quotes if dragged and dropped in terminal
        if file_path.startswith('"') and file_path.endswith('"'):
            file_path = file_path.strip('"')
            
        if os.path.exists(file_path):
            try:
                with open(file_path, "rb") as f:
                    content = f.read()
                
                mime_type = mimetypes.guess_type(file_path)[0] or "application/octet-stream"
                filename = os.path.basename(file_path)
                
                if mime_type.startswith("text/"):
                    try:
                        text_content = content.decode("utf-8")
                        messages = [{"role": "user", "content": f"{user_input}\n\nFile content ({filename}):\n{text_content}"}]
                    except UnicodeDecodeError:
                        messages = [{"role": "user", "content": f"{user_input}\n\nBinary file uploaded: {filename} (could not decode text)"}]
                
                elif mime_type.startswith("image/"):
                    base64_data = base64.b64encode(content).decode('utf-8')
                    messages = [{
                        "role": "user",
                        "content": [
                            {"type": "text", "text": user_input},
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
                        base64_data = base64.b64encode(content).decode('utf-8')
                        messages = [{
                            "role": "user",
                            "content": [
                                {"type": "text", "text": user_input},
                                {
                                    "type": "image_url",
                                    "image_url": {
                                        "url": f"data:{mime_type};base64,{base64_data}"
                                    }
                                }
                            ]
                        }]
                    else:
                        messages = [{"role": "user", "content": f"{user_input}\n\n🎤 Media message uploaded: {filename} ({mime_type})"}]

                
                else:
                    messages = [{"role": "user", "content": f"{user_input}\n\nFile uploaded: {filename} ({mime_type})"}]
                    
                print(f"Attached: {filename} ({mime_type})")
                
            except Exception as e:
                print(f"Error reading file: {e}")
                continue
        else:
            print(f"Warning: File not found at '{file_path}'. Sending prompt only.")
            messages = [{"role": "user", "content": user_input}]
    else:
        messages = [{"role": "user", "content": user_input}]
        
    try:
        print("\nThinking...")
        completion = client.chat.completions.create(
            extra_headers=headers,
            model=model,
            messages=messages
        )
        
        # Print response
        print("AI Reply:")
        print(completion.choices[0].message.content)
        
    except Exception as e:
        print(f"\nAPI Error: {e}")
