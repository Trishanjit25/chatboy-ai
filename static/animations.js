/**
 * Chat Boy - Interactive Animations & Features
 */

const ChatBoy = {
    // Configuration
    config: {
        maxChars: 2000,
        typingSpeed: 30,
        messageAnimationDelay: 100,
        scrollThreshold: 300,
        supportedFileTypes: ['.txt', '.md', '.py', '.js', '.html', '.css', '.json', '.csv', '.pdf', '.png', '.jpg', '.jpeg', '.gif', '.webm', '.wav', '.mp3', '.ogg'],
        maxFileSize: 10 * 1024 * 1024 // 10MB
    },

    // State
    state: {
        selectedFile: null,
        isRecording: false,
        recognition: null,
        emojiPicker: null,
        abortController: null,
        isTyping: false
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
        this.stopBtn = document.getElementById('stop-btn');
        this.welcomeArea = document.getElementById('welcome-area');
        this.charCounter = document.querySelector('.char-counter');
        this.scrollBtn = document.querySelector('.scroll-indicator');
        this.fileBtn = document.getElementById('file-btn');
        this.fileInput = document.getElementById('file-input');
        this.voiceBtn = document.getElementById('voice-btn');
        this.emojiBtn = document.getElementById('emoji-btn');
        this.fileInfo = document.getElementById('file-info');
        this.voiceIndicator = document.getElementById('voice-indicator');
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

        // File upload
        this.fileBtn.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

        // Voice input
        this.voiceBtn.addEventListener('click', () => this.toggleVoiceRecording());

        // Emoji button
        if (this.emojiBtn) {
            this.emojiBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleEmojiPicker();
            });
        }

        // Initialize speech recognition if available
        this.initializeSpeechRecognition();

        // Close emoji picker when clicking outside
        document.addEventListener('click', (e) => {
            if (this.state.emojiPicker && this.emojiBtn && !this.emojiBtn.contains(e.target) && !this.state.emojiPicker.contains(e.target)) {
                this.closeEmojiPicker();
            }
        });
    },

    // Handle keyboard events
    handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
        }
        if (e.key === 'Enter' && e.ctrlKey) {
            // Default behavior - insert new line
        }
        if (e.key === 'Escape') {
            this.userInput.value = '';
            this.updateCharCounter();
            this.closeEmojiPicker();
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
        if (!prompt && !this.state.selectedFile) return;

        if (prompt.length > this.config.maxChars) {
            this.showToast('Message too long!', 'error');
            return;
        }

        // Hide Gemini welcome area on first message
        if (this.welcomeArea) {
            this.welcomeArea.style.display = 'none';
        }

        // Hide background animation on first message (Langchain style)
        const bgAnimation = document.querySelector('.bg-animation');
        if (bgAnimation && bgAnimation.style.opacity !== '0') {
            bgAnimation.style.opacity = '0';
            setTimeout(() => bgAnimation.style.display = 'none', 1000);
        }

        let messageText = prompt;
        if (this.state.selectedFile) {
            messageText += ` 📎 ${this.state.selectedFile.name}`;
        }
        this.appendMessage(messageText, 'user-msg');
        this.userInput.value = '';
        this.updateCharCounter();
        this.userInput.style.height = 'auto';

        // Toggle Buttons
        this.sendBtn.style.display = 'none';
        if (this.stopBtn) this.stopBtn.style.display = 'flex';

        const typingEl = this.createTypingIndicator();
        this.chatContainer.appendChild(typingEl);
        this.scrollToBottom();

        // Setup AbortController for stopping generation
        this.state.abortController = new AbortController();
        const signal = this.state.abortController.signal;

        try {
            const formData = new FormData();
            formData.append('prompt', prompt);
            if (this.state.selectedFile) {
                formData.append('file', this.state.selectedFile);
            }

            const res = await fetch('/ai', {
                method: 'POST',
                body: formData,
                signal: signal
            });

            const data = await res.json();

            typingEl.remove();

            if (data.file_info) {
                this.appendMessage(`📁 File processed: ${data.file_info.filename} (${this.formatFileSize(data.file_info.size)})`, 'bot-msg');
            }

            await this.typeResponse(data.response || data.error || 'No response.');
            this.clearSelectedFile();
        } catch (err) {
            typingEl.remove();
            if (err.name === 'AbortError') {
                this.appendMessage('🛑 Generation stopped by user.', 'bot-msg');
            } else {
                this.appendMessage('❌ Error connecting to server.', 'bot-msg');
            }
        } finally {
            // Restore buttons
            this.state.abortController = null;
            if (this.stopBtn) this.stopBtn.style.display = 'none';
            this.sendBtn.style.display = 'flex';
            this.userInput.focus();
        }
    },

    // Stop Generation
    stopGeneration() {
        // Abort the network request
        if (this.state.abortController) {
            this.state.abortController.abort();
            this.state.abortController = null;
        }
        // Stop the typewriter effect
        this.state.isTyping = false;

        // Restore buttons manually in case process was already typing
        if (this.stopBtn) this.stopBtn.style.display = 'none';
        this.sendBtn.style.display = 'flex';
        this.userInput.focus();
    },

    // Handle initial Suggestion Click
    useSuggestion(text) {
        this.userInput.value = text;
        this.updateCharCounter();
        this.userInput.focus();
        this.sendMessage(); // auto trigger send
    },

    // Create typing indicator
    createTypingIndicator() {
        const div = document.createElement('div');
        div.className = 'typing';
        div.innerHTML = `
            <div class="gemini-star-container">
                <div class="gemini-star"></div>
            </div>
            <span class="typing-text">AI is thinking...</span>
        `;
        return div;
    },

    // Append message
    appendMessage(text, className) {
        const div = document.createElement('div');
        div.className = `message ${className}`;

        const timestamp = document.createElement('span');
        timestamp.className = 'timestamp';
        timestamp.textContent = this.formatTime(new Date());

        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.innerHTML = '📋';
        copyBtn.title = 'Copy message';
        copyBtn.onclick = () => this.copyMessage(text, copyBtn);

        const content = document.createElement('div');
        content.textContent = text;

        div.appendChild(content);
        div.appendChild(timestamp);
        div.appendChild(copyBtn);

        this.chatContainer.appendChild(div);
        this.scrollToBottom();

        return div;
    },

    // Type response
    async typeResponse(text) {
        this.state.isTyping = true;

        const div = document.createElement('div');
        div.className = 'message bot-msg';

        const timestamp = document.createElement('span');
        timestamp.className = 'timestamp';
        timestamp.textContent = this.formatTime(new Date());

        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.innerHTML = '📋';
        copyBtn.title = 'Copy message';
        copyBtn.onclick = () => this.copyMessage(text, copyBtn);

        const content = document.createElement('div');

        div.appendChild(content);
        div.appendChild(timestamp);
        div.appendChild(copyBtn);

        this.chatContainer.appendChild(div);

        for (let i = 0; i < text.length; i++) {
            if (!this.state.isTyping) break; // Halts typewriter if Stop is clicked

            content.textContent += text[i];
            this.scrollToBottom('auto');
            await this.sleep(this.config.typingSpeed);
        }

        this.state.isTyping = false;
        return div;
    },

    // Copy message
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

    // Show toast
    showToast(message, type = 'info') {
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // Sleep
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    // ============================================
    // File Handling
    // ============================================
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        if (!this.config.supportedFileTypes.includes(fileExtension)) {
            this.showToast('Unsupported file type!', 'error');
            this.clearSelectedFile();
            return;
        }

        if (file.size > this.config.maxFileSize) {
            this.showToast('File too large! Max 10MB.', 'error');
            this.clearSelectedFile();
            return;
        }

        this.state.selectedFile = file;
        this.displayFileInfo(file);
        this.fileBtn.classList.add('file-selected');

        const isAudio = fileExtension.match(/\.(webm|wav|mp3|ogg)$/);
        const icon = isAudio ? '🎤' : '📎';
        this.showToast(`${icon} File selected: ${file.name}`, 'success');
    },

    displayFileInfo(file) {
        const fileName = this.fileInfo.querySelector('.file-name');
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        const isAudio = fileExtension.match(/\.(webm|wav|mp3|ogg)$/);
        const icon = isAudio ? '🎤' : '📎';
        fileName.textContent = `${icon} ${file.name} (${this.formatFileSize(file.size)})`;
        this.fileInfo.style.display = 'block';

        const removeBtn = this.fileInfo.querySelector('.file-remove');
        removeBtn.onclick = () => this.clearSelectedFile();
    },

    clearSelectedFile() {
        this.state.selectedFile = null;
        this.fileInput.value = '';
        this.fileInfo.style.display = 'none';
        this.fileBtn.classList.remove('file-selected');
    },

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    // ============================================
    // Voice Recognition
    // ============================================
    initializeSpeechRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.warn('Speech recognition not supported');
            this.voiceBtn.style.display = 'none';
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.state.recognition = new SpeechRecognition();
        this.state.recognition.continuous = false;
        this.state.recognition.interimResults = false;
        this.state.recognition.lang = 'en-US';

        this.state.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            this.userInput.value = transcript;
            this.updateCharCounter();
            this.stopVoiceRecording();
        };

        this.state.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.showToast('Voice recognition failed', 'error');
            this.stopVoiceRecording();
        };

        this.state.recognition.onend = () => {
            this.stopVoiceRecording();
        };
    },

    toggleVoiceRecording() {
        this.closeEmojiPicker();

        if (this.state.isRecording) {
            this.stopVoiceRecording();
        } else {
            this.startVoiceRecording();
        }
    },

    startVoiceRecording() {
        if (!this.state.recognition) {
            this.showToast('Voice recognition not available', 'error');
            return;
        }

        this.state.isRecording = true;
        this.voiceBtn.classList.add('recording');
        this.voiceIndicator.style.display = 'block';

        try {
            this.state.recognition.start();
        } catch (error) {
            console.error('Error starting recognition:', error);
            this.stopVoiceRecording();
        }
    },

    stopVoiceRecording() {
        if (!this.state.isRecording) return;

        this.state.isRecording = false;
        this.voiceBtn.classList.remove('recording');
        this.voiceIndicator.style.display = 'none';

        if (this.state.recognition) {
            try {
                this.state.recognition.stop();
            } catch (error) {
                console.log('Recognition already stopped');
            }
        }
    },

    // ============================================
    // Emoji Picker
    // ============================================
    toggleEmojiPicker() {
        if (this.state.emojiPicker && this.state.emojiPicker.classList.contains('show')) {
            this.closeEmojiPicker();
        } else {
            this.openEmojiPicker();
        }
    },

    openEmojiPicker() {
        if (!this.state.emojiPicker) {
            this.createEmojiPicker();
        }

        this.stopVoiceRecording();

        this.emojiBtn.classList.add('active');
        this.state.emojiPicker.classList.add('show');
        this.state.emojiPicker.style.display = 'block';

        this.renderEmojis();
    },

    closeEmojiPicker() {
        if (!this.state.emojiPicker) return;

        this.emojiBtn.classList.remove('active');
        this.state.emojiPicker.classList.remove('show');

        setTimeout(() => {
            if (this.state.emojiPicker) {
                this.state.emojiPicker.style.display = 'none';
            }
        }, 200);
    },

    createEmojiPicker() {
        const picker = document.createElement('div');
        picker.className = 'emoji-picker';
        picker.innerHTML = `
            <div class="emoji-search">
                <input type="text" placeholder="Search emojis..." id="emoji-search">
            </div>
            <div class="emoji-categories">
                <button class="emoji-category active" data-category="smileys">😀</button>
                <button class="emoji-category" data-category="gestures">👋</button>
                <button class="emoji-category" data-category="hearts">❤️</button>
                <button class="emoji-category" data-category="objects">📎</button>
                <button class="emoji-category" data-category="symbols">✅</button>
                <button class="emoji-category" data-category="food">🍕</button>
            </div>
            <div class="emoji-list" id="emoji-list"></div>
        `;

        document.body.appendChild(picker);
        this.state.emojiPicker = picker;

        this.bindEmojiPickerEvents();
        this.renderEmojis();
    },

    bindEmojiPickerEvents() {
        const categories = this.state.emojiPicker.querySelectorAll('.emoji-category');
        categories.forEach(btn => {
            btn.addEventListener('click', () => {
                categories.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.renderEmojis(btn.dataset.category);
            });
        });

        const searchInput = this.state.emojiPicker.querySelector('#emoji-search');
        searchInput.addEventListener('input', (e) => {
            this.searchEmojis(e.target.value);
        });
    },

    emojiData: {
        smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖'],
        gestures: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃'],
        hearts: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟'],
        objects: ['📎', '📁', '📂', '📅', '📆', '📇', '📈', '📉', '📊', '📋', '📌', '📍', '📏', '📐', '✂️', '🔒', '🔓', '🔑', '🗝️', '🔨', '🔧', '⚙️', '🔗', '📱', '💻', '🖥️', '🖨️', '📷', '📹', '🎤', '🎥', '📺', '📻', '🎙️', '💡', '🔦', '📚', '📖', '📝', '✏️', '💰', '💳', '💵'],
        symbols: ['✅', '❌', '❓', '❗', '‼️', '⁉️', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🟤', '🔺', '🔻', '💯', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '❎', '⭕', '🛗', '🈳', '🈂️', '🛂', '🛃', '🛄', '🛅', '🚾', '♿', '🅿️', '🛗', '🈳', '🈂️', '🛂', '🛃'],
        food: ['🍕', '🍔', '🍟', '🌭', '🍿', '🧂', '🥓', '🥚', '🍳', '🧇', '🥞', '🍞', '🥐', '🥖', '🥨', '🧀', '🥗', '🥙', '🥪', '🌮', '🌯', '🫔', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '☕', '🍵', '🧃', '🥤', '🧋', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🧉', '🍾', '🧊']
    },

    currentEmojiCategory: 'smileys',

    renderEmojis(category = this.currentEmojiCategory) {
        if (!this.state.emojiPicker) return;

        this.currentEmojiCategory = category;
        const emojiList = this.state.emojiPicker.querySelector('#emoji-list');
        const emojis = this.emojiData[category] || this.emojiData.smileys;

        emojiList.innerHTML = emojis.map(emoji =>
            `<button class="emoji-btn" data-emoji="${emoji}">${emoji}</button>`
        ).join('');

        emojiList.querySelectorAll('.emoji-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.insertEmoji(btn.dataset.emoji);
            });
        });
    },

    searchEmojis(query) {
        if (!this.state.emojiPicker || !query.trim()) {
            this.renderEmojis(this.currentEmojiCategory);
            return;
        }

        const emojiList = this.state.emojiPicker.querySelector('#emoji-list');
        const allEmojis = Object.values(this.emojiData).flat();

        emojiList.innerHTML = allEmojis.map(emoji =>
            `<button class="emoji-btn" data-emoji="${emoji}">${emoji}</button>`
        ).join('');

        emojiList.querySelectorAll('.emoji-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.insertEmoji(btn.dataset.emoji);
            });
        });
    },

    insertEmoji(emoji) {
        const input = this.userInput;
        const start = input.selectionStart;
        const end = input.selectionEnd;
        const text = input.value;

        input.value = text.substring(0, start) + emoji + text.substring(end);
        input.selectionStart = input.selectionEnd = start + emoji.length;

        this.updateCharCounter();
        input.focus();

        this.closeEmojiPicker();
    }
};

// Particle Background
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

            if (p.x < 0) p.x = this.canvas.width;
            if (p.x > this.canvas.width) p.x = 0;
            if (p.y < 0) p.y = this.canvas.height;
            if (p.y > this.canvas.height) p.y = 0;

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.fill();
        });

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
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    ChatBoy.init();
    ParticleBackground.init();
    IdleIndicator.init();
});

window.ChatBoy = ChatBoy;
window.sendMessage = () => ChatBoy.sendMessage();

// Idle Indicator
const IdleIndicator = {
    element: null,
    timeoutId: null,
    isTyping: false,

    init() {
        this.element = document.getElementById('idle-indicator');
        this.show();

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

const originalSendMessage = ChatBoy.sendMessage;
ChatBoy.sendMessage = async function () {
    IdleIndicator.setTyping(true);
    try {
        await originalSendMessage.call(this);
    } finally {
        IdleIndicator.setTyping(false);
    }
};
