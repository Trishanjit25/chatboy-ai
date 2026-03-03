# 🤖 Chat Boy - AI Chatbot

Chat Boy is an intelligent AI-powered chatbot web application built with FastAPI and integrated with OpenRouter's AI models. It provides a modern, responsive chat interface with smooth animations and a delightful user experience.

![Chat Boy](https://img.shields.io/badge/ChatBoy-AI%20Chatbot-blue?style=for-the-badge&logo=robot)
![Python](https://img.shields.io/badge/Python-3.11+-green?style=flat-square&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-orange?style=flat-square&logo=fastapi)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

## ✨ Features

- **🤖 AI-Powered Responses**: Leverages Google Gemma-3-4b-it model via OpenRouter API
- **🎨 Modern UI**: Glassmorphism design with smooth animations and particle effects
- **♿ Accessibility First**: WCAG compliant with screen reader support, keyboard navigation, and reduced motion options
- **⚡ Real-time Chat**: Instant AI responses with typing indicators and character-by-character animation
- **📱 Responsive Design**: Mobile-first approach with adaptive layouts
- **🔒 Secure**: Environment variable configuration for API keys
- **🌙 Dark Mode**: Enhanced dark theme with high contrast support
- **📋 Message Features**:
  - Copy messages to clipboard
  - Timestamps for each message
  - Character counter (2000 limit)
  - Auto-resizing textarea
- **⌨️ Keyboard Shortcuts**:
  - `Enter` - Send message
  - `Ctrl+Enter` - New line
  - `Escape` - Clear input
- **🔔 User Feedback**:
  - Toast notifications for actions
  - Scroll indicator for long conversations
  - Idle status indicator
  - Loading states and error handling

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
   
   Create a `.env` file in root directory (this file is already in `.gitignore` for security):
   
```env
   # OpenRouter API Configuration
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   
   # Application Configuration
   APP_NAME=ChatBoy AI
   APP_VERSION=1.0.0
   DEBUG=false
```
   
   🔐 **Security Note**: Get your free API key from [OpenRouter](https://openrouter.ai/keys)
   
   The `.env` file is automatically excluded from git commits to protect your API keys.

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
- Translucent chat container with backdrop blur
- Frosted glass effects on header and input areas
- Subtle blur backgrounds with particle animations
- Floating shapes for visual depth

### Advanced Animations
- Smooth message slide-in effects with staggered timing
- Typing indicator with animated dots
- Button hover effects with shimmer animations
- Toast notification animations
- Particle background with connected nodes
- Robot icon floating animation

### Responsive & Adaptive Layout
- Mobile-first design approach
- Adaptive chat container for all screen sizes
- Touch-friendly buttons and inputs
- Flexible input area on mobile devices
- Optimized typography scaling

## 🔐 Security & Best Practices

### Environment Variables
- ✅ API keys are stored in `.env` file (never committed to git)
- ✅ `.env` is included in `.gitignore` by default
- ✅ Use `.env.example` as a template for required variables

### Production Security
- 🔒 Use environment-specific secret management (AWS Secrets Manager, etc.)
- 🔒 Enable HTTPS in production
- 🔒 Implement rate limiting
- 🔒 Add CORS configuration as needed

### Accessibility Features
- 🎯 WCAG 2.1 AA compliant
- 🎯 Screen reader support with ARIA labels
- 🎯 Keyboard navigation support
- 🎯 High contrast mode support
- 🎯 Reduced motion support for users with vestibular disorders
- 🎯 Skip links for keyboard users

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
