# 🤖 Chat Boy - AI Chatbot

Chat Boy is an intelligent AI-powered chatbot web application built with FastAPI and integrated with OpenRouter's AI models. It provides a modern, responsive chat interface with smooth animations and a delightful user experience.

![Chat Boy](https://img.shields.io/badge/ChatBoy-AI%20Chatbot-blue?style=for-the-badge&logo=robot)
![Python](https://img.shields.io/badge/Python-3.11+-green?style=flat-square&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-orange?style=flat-square&logo=fastapi)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

## ✨ Features

- **AI-Powered Responses**: Leverages Google Gemma-3-4b-it model via OpenRouter API
- **Modern UI**: Glassmorphism design with smooth animations
- **Real-time Chat**: Instant AI responses with typing indicators
- **Message Features**:
  - Copy messages to clipboard
  - Timestamps for each message
  - Character counter (2000 limit)
- **Keyboard Shortcuts**:
  - `Enter` - Send message
  - `Ctrl+Enter` - New line
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Toast Notifications**: Feedback for user actions
- **Scroll Indicator**: Quick scroll to bottom button

## 🛠️ Tech Stack

- **Backend**: [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- **AI Integration**: [OpenRouter](https://openrouter.ai/) - Unified API for AI models
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Templating**: Jinja2
- **Deployment Ready**: Compatible with Render, Heroku, and other platforms

## 📋 Prerequisites

- Python 3.11 or higher
- OpenRouter API Key

## 🚀 Installation

1. **Clone the repository**
   
```
bash
   git clone https://github.com/yourusername/chatboy.git
   cd chatboy
   
```

2. **Create a virtual environment**
   
```
bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
```

3. **Install dependencies**
   
```
bash
   pip install -r requirements.txt
   
```

4. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   
```
env
   OPENROUTER_API_KEY=your_api_key_here
   
```
   
   Get your free API key from [OpenRouter](https://openrouter.ai/keys)

5. **Run the application**
   
```
bash
   uvicorn app:app --reload
   
```

6. **Open your browser**
   Navigate to `http://localhost:8000`

## 📁 Project Structure

```
chatboy/
├── app.py                 # Main FastAPI application
├── lim.py                # Standalone CLI version (optional)
├── requirements.txt      # Python dependencies
├── .env                  # Environment variables (not in git)
├── .gitignore           # Git ignore rules
├── TODO.md              # Development roadmap
├── static/
│   ├── style.css        # Modern CSS with glassmorphism
│   └── animations.js    # Client-side animations
└── templates/
    ├── index.html       # Main chat interface
    └── about.html       # About page
```

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Main chat page |
| GET | `/about` | About page |
| GET | `/health` | Health check |
| GET | `/ai?prompt={text}` | AI chat endpoint |
| POST | `/items/` | Create item (demo) |
| GET | `/items/{id}` | Get item (demo) |

## 🎨 UI Features

### Glassmorphism Design
- Translucent chat container
- Frosted glass effects
- Subtle blur backgrounds

### Animations
- Smooth message slide-in effects
- Typing indicator with dots
- Button hover effects
- Toast notification animations

### Responsive Layout
- Mobile-friendly design
- Adaptive chat container
- Touch-friendly buttons

## 🔐 Security Notes

- API keys are stored in environment variables (never commit them!)
- The `.env` file is included in `.gitignore`
- For production, use secure secret management

## 🧪 Testing

```
bash
# Run the development server
uvicorn app:app --reload

# Test health endpoint
curl http://localhost:8000/health

# Test AI endpoint
curl "http://localhost:8000/ai?prompt=Hello"
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [OpenRouter](https://openrouter.ai/) for providing AI API access
- [FastAPI](https://fastapi.tiangolo.com/) for the amazing framework
- [Google](https://deepmind.google/technologies/gemma/) for the Gemma model

## 🐛 Known Issues

- Emoji picker and voice input are planned features (not yet implemented)
- Rate limits depend on OpenRouter API tier

## 📈 Future Enhancements

- [ ] Voice input support
- [ ] Emoji picker
- [ ] Chat history persistence
- [ ] Multiple AI model selection
- [ ] User authentication
- [ ] Real-time WebSocket updates

---

<div align="center">

Made with ❤️ using FastAPI

</div>
