/**
 * Chat Boy - Interactive Animations & Features
 */

const ChatBoy = {
    // Configuration
    config: {
        maxChars: 2000,
        typingSpeed: 30,
        messageAnimationDelay: 100,
        scrollThreshold: 300
    },

    // Initialize
    init() {
        this.cacheElements();
        this.bindEvents();
        this.setupAutoResize();
        this.setupScrollIndicator();
        console.log('🤖 Chat Boy initialized!');
    },

    // Cache DOM elements
    cacheElements() {
        this.chatContainer = document.getElementById('chat-container');
        this.userInput = document.getElementById('user-input');
        this.sendBtn = document.getElementById('send-btn');
        this.charCounter = document.querySelector('.char-counter');
        this.scrollBtn = document.querySelector('.scroll-indicator');
    },

    // Bind event listeners
    bindEvents() {
        // Enter key to send
        this.userInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // Input for character count
        this.userInput.addEventListener('input', () => this.updateCharCounter());
        
        // Scroll indicator
        if (this.scrollBtn) {
            this.scrollBtn.addEventListener('click', () => this.scrollToBottom());
        }
        
        // Chat container scroll
        this.chatContainer.addEventListener('scroll', () => this.handleScroll());
    },

    // Handle keyboard events
    handleKeyDown(e) {
        // Send on Enter (without Shift)
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
        }
        
        // New line on Ctrl+Enter
        if (e.key === 'Enter' && e.ctrlKey) {
            // Default behavior - insert new line
        }
        
        // Clear on Escape
        if (e.key === 'Escape') {
            this.userInput.value = '';
            this.updateCharCounter();
        }
    },

    // Auto-resize textarea
    setupAutoResize() {
        const resize = () => {
            this.userInput.style.height = 'auto';
            this.userInput.style.height = Math.min(this.userInput.scrollHeight, 120) + 'px';
        };
        
        this.userInput.addEventListener('input', resize);
        resize();
    },

    // Update character counter
    updateCharCounter() {
        const length = this.userInput.value.length;
        const remaining = this.config.maxChars - length;
        
        if (this.charCounter) {
            this.charCounter.textContent = `${length}/${this.config.maxChars}`;
            
            // Update color based on length
            this.charCounter.classList.remove('warning', 'error');
            if (remaining < 0) {
                this.charCounter.classList.add('error');
            } else if (remaining < 200) {
                this.charCounter.classList.add('warning');
            }
        }
    },

    // Scroll indicator
    setupScrollIndicator() {
        this.handleScroll();
    },

    handleScroll() {
        const { scrollTop, scrollHeight, clientHeight } = this.chatContainer;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < this.config.scrollThreshold;
        
        if (this.scrollBtn) {
            if (!isNearBottom && scrollHeight > clientHeight) {
                this.scrollBtn.classList.add('visible');
            } else {
                this.scrollBtn.classList.remove('visible');
            }
        }
    },

    // Scroll to bottom
    scrollToBottom(behavior = 'smooth') {
        this.chatContainer.scrollTo({
            top: this.chatContainer.scrollHeight,
            behavior: behavior
        });
    },

    // Send message
    async sendMessage() {
        const prompt = this.userInput.value.trim();
        if (!prompt) return;
        
        // Check character limit
        if (prompt.length > this.config.maxChars) {
            this.showToast('Message too long!', 'error');
            return;
        }

        // Add user message with animation
        this.appendMessage(prompt, 'user-msg');
        this.userInput.value = '';
        this.updateCharCounter();
        this.userInput.style.height = 'auto';
        
        // Disable send button
        this.sendBtn.disabled = true;
        
        // Show typing indicator
        const typingEl = this.createTypingIndicator();
        this.chatContainer.appendChild(typingEl);
        this.scrollToBottom();

        try {
            const res = await fetch(`/ai?prompt=${encodeURIComponent(prompt)}`);
            const data = await res.json();
            
            typingEl.remove();
            
            // Type out the response
            await this.typeResponse(data.response || data.error || 'No response.');
        } catch (err) {
            typingEl.remove();
            this.appendMessage('❌ Error connecting to server.', 'bot-msg');
        }

        this.sendBtn.disabled = false;
        this.userInput.focus();
    },

    // Create typing indicator
    createTypingIndicator() {
        const div = document.createElement('div');
        div.className = 'typing';
        div.innerHTML = `
            <div class="typing-dots">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
            </div>
            <span class="typing-text">AI is thinking...</span>
        `;
        return div;
    },

    // Append message
    appendMessage(text, className) {
        const div = document.createElement('div');
        div.className = `message ${className}`;
        
        // Add timestamp
        const timestamp = document.createElement('span');
        timestamp.className = 'timestamp';
        timestamp.textContent = this.formatTime(new Date());
        
        // Add copy button
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.innerHTML = '📋';
        copyBtn.title = 'Copy message';
        copyBtn.onclick = () => this.copyMessage(text, copyBtn);
        
        // Add message content
        const content = document.createElement('div');
        content.textContent = text;
        
        div.appendChild(content);
        div.appendChild(timestamp);
        div.appendChild(copyBtn);
        
        this.chatContainer.appendChild(div);
        this.scrollToBottom();
        
        return div;
    },

    // Type response character by character
    async typeResponse(text) {
        const div = document.createElement('div');
        div.className = 'message bot-msg';
        
        // Add timestamp
        const timestamp = document.createElement('span');
        timestamp.className = 'timestamp';
        timestamp.textContent = this.formatTime(new Date());
        
        // Add copy button
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.innerHTML = '📋';
        copyBtn.title = 'Copy message';
        copyBtn.onclick = () => this.copyMessage(text, copyBtn);
        
        // Add message content
        const content = document.createElement('div');
        
        div.appendChild(content);
        div.appendChild(timestamp);
        div.appendChild(copyBtn);
        
        this.chatContainer.appendChild(div);
        
        // Type out the text
        for (let i = 0; i < text.length; i++) {
            content.textContent += text[i];
            this.scrollToBottom('auto');
            await this.sleep(this.config.typingSpeed);
        }
        
        return div;
    },

    // Copy message to clipboard
    async copyMessage(text, btn) {
        try {
            await navigator.clipboard.writeText(text);
            const original = btn.innerHTML;
            btn.innerHTML = '✅';
            setTimeout(() => {
                btn.innerHTML = original;
            }, 1500);
            this.showToast('Copied to clipboard!', 'success');
        } catch (err) {
            this.showToast('Failed to copy', 'error');
        }
    },

    // Format time
    formatTime(date) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },

    // Show toast notification
    showToast(message, type = 'info') {
        // Remove existing toast
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Show toast
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Hide and remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // Sleep utility
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// Particle Background Effect
const ParticleBackground = {
    canvas: null,
    ctx: null,
    particles: [],
    animationId: null,

    init() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'particles';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 0;
            opacity: 0.3;
        `;
        
        document.body.insertBefore(this.canvas, document.body.firstChild);
        this.ctx = this.canvas.getContext('2d');
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        this.createParticles();
        this.animate();
    },

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },

    createParticles() {
        const count = Math.floor((window.innerWidth * window.innerHeight) / 15000);
        this.particles = [];
        
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 1,
                color: `rgba(124, 106, 247, ${Math.random() * 0.5 + 0.2})`
            });
        }
    },

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            
            // Wrap around edges
            if (p.x < 0) p.x = this.canvas.width;
            if (p.x > this.canvas.width) p.x = 0;
            if (p.y < 0) p.y = this.canvas.height;
            if (p.y > this.canvas.height) p.y = 0;
            
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.fill();
        });
        
        // Draw connections
        this.particles.forEach((p1, i) => {
            this.particles.slice(i + 1).forEach(p2 => {
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 150) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.strokeStyle = `rgba(124, 106, 247, ${0.15 * (1 - dist / 150)})`;
                    this.ctx.stroke();
                }
            });
        });
        
        this.animationId = requestAnimationFrame(() => this.animate());
    },

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.canvas) {
            this.canvas.remove();
        }
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    ChatBoy.init();
    
    // Enable particle background
    ParticleBackground.init();
    
    // Initialize idle indicator
    IdleIndicator.init();
});

// Make ChatBoy available globally for onclick handlers
window.ChatBoy = ChatBoy;
window.sendMessage = () => ChatBoy.sendMessage();

// Idle Status Indicator
const IdleIndicator = {
    element: null,
    timeoutId: null,
    isTyping: false,

    init() {
        this.element = document.getElementById('idle-indicator');
        this.show();
        
        // Listen for typing events
        document.addEventListener('keydown', () => this.onUserActivity());
        document.addEventListener('click', () => this.onUserActivity());
    },

    show() {
        if (this.element && !this.isTyping) {
            this.element.classList.add('visible');
        }
    },

    hide() {
        if (this.element) {
            this.element.classList.remove('visible');
        }
    },

    setTyping(typing) {
        this.isTyping = typing;
        if (typing) {
            this.hide();
            if (this.element) {
                this.element.querySelector('span').textContent = 'AI is thinking...';
                this.element.querySelector('.idle-dot').style.background = '#f59e0b';
                this.element.querySelector('.idle-dot').style.animation = 'none';
            }
        } else {
            if (this.element) {
                this.element.querySelector('span').textContent = 'AI is ready';
                this.element.querySelector('.idle-dot').style.background = '#10b981';
                this.element.querySelector('.idle-dot').style.animation = 'idleGlow 2s ease-in-out infinite';
            }
            this.scheduleShow();
        }
    },

    onUserActivity() {
        this.scheduleShow();
    },

    scheduleShow() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
        this.timeoutId = setTimeout(() => {
            if (!this.isTyping) {
                this.show();
            }
        }, 2000);
    }
};

// Update ChatBoy to handle idle indicator
const originalSendMessage = ChatBoy.sendMessage;
ChatBoy.sendMessage = async function() {
    IdleIndicator.setTyping(true);
    try {
        await originalSendMessage.call(this);
    } finally {
        IdleIndicator.setTyping(false);
    }
};
