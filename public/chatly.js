// Chatly Premium Frontend
// Complete implementation of the Chatly Premium platform

const API_BASE = '/api';
let socket = null;
let currentUser = null;
let currentServer = null;
let currentChannel = null;
let messageHistory = [];
let participants = [];
let connectionAttempts = 0;
let autoReconnectTimer = null;
let inviteCode = null;

// Configuration
const CONFIG = {
  serverUrl: window.location.origin,
  enableWebRTC: true,
  enableScreenSharing: true,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  supportedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  supportedVideoTypes: ['video/mp4', 'video/webm', 'video/ogg'],
  supportedAudioTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
  autoReconnectDelay: 3000,
  maxReconnectAttempts: 10,
};

// Internationalization
const i18n = {
  currentLang: 'en',
  translations: {},

  init() {
    const detectedLang = navigator.language || navigator.userLanguage;
    this.currentLang = detectedLang.startsWith('de') ? 'de' : 
                       detectedLang.startsWith('es') ? 'es' : 
                       detectedLang.startsWith('fr') ? 'fr' : 
                       detectedLang.startsWith('it') ? 'it' : 
                       detectedLang.startsWith('pt') ? 'pt' : 
                       detectedLang.startsWith('ru') ? 'ru' : 
                       detectedLang.startsWith('zh') ? 'zh' : 
                       detectedLang.startsWith('ja') ? 'ja' : 
                       detectedLang.startsWith('ko') ? 'ko' : 
                       detectedLang.startsWith('ar') ? 'ar' : 
                       detectedLang.startsWith('hi') ? 'hi' : 'en';
    this.loadTranslations();
  },

  loadTranslations() {
    fetch(`${API_BASE}/locales/${this.currentLang}.json`)
      .then(response => response.json())
      .then(data => {
        this.translations = data;
        this.updateUI();
      })
      .catch(error => {
        console.error('Failed to load translations:', error);
        this.loadTranslations(); // Retry
      });
  },

  t(key, fallback) {
    return this.translations[key] || fallback || key;
},

  updateUI() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.t(key);
      if (translation) element.textContent = translation;
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      const translation = this.t(key);
      if (translation) element.placeholder = translation;
    });

    document.querySelectorAll('[data-i18n-title]').forEach(element => {
      const key = element.getAttribute('data-i18n-title');
      const translation = this.t(key);
      if (translation) element.title = translation;
    });
  }
};

// Utility Functions
const utils = {
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  formatTime(date) {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  },

  formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  generateId() {
    return Math.random().toString(36).substr(2, 9);
  },

  truncateText(text, maxLength) {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  },

  isImageFile(mimeType) {
    return CONFIG.supportedImageTypes.includes(mimeType);
  },

  isVideoFile(mimeType) {
    return CONFIG.supportedVideoTypes.includes(mimeType);
  },

  isAudioFile(mimeType) {
    return CONFIG.supportedAudioTypes.includes(mimeType);
  },

  validateFile(file) {
    if (file.size > CONFIG.maxFileSize) {
      throw new Error(`File too large. Maximum size is ${Math.round(CONFIG.maxFileSize / 1024 / 1024)}MB.`);
    }

    if (!this.isImageFile(file.type) && !this.isVideoFile(file.type) && !this.isAudioFile(file.type)) {
      throw new Error('File type not supported. Please upload images, videos, or audio files.');
    }

    return true;
  },

  async readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  },

  escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },

  showNotification(message, type = 'info', duration = 3000) {
    const container = document.getElementById('notifications');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="notification-icon ${getNotificationIcon(type)}"></i>
        <div class="notification-message">${message}</div>
        <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;

    container.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideInRight 0.3s ease forwards';
    }, 10);

    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease forwards';
      setTimeout(() => {
        if (notification.parentElement) {
          notification.parentElement.removeChild(notification);
        }
      }, 300);
    }, duration);
  },

  showLoading(show, message = 'Loading...') {
    const loading = document.getElementById('loading-overlay');
    const loadingText = document.getElementById('loading-text');

    if (show) {
      loadingText.textContent = message;
      loading.classList.add('show');
    } else {
      loading.classList.remove('show');
    }
  },

  copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'absolute';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        document.execCommand('copy');
        return Promise.resolve();
      } catch (err) {
        return Promise.reject(err);
      } finally {
        document.body.removeChild(textArea);
      }
    }
  }
};

function getNotificationIcon(type) {
  const icons = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    warning: 'fas fa-exclamation-triangle',
    info: 'fas fa-info-circle'
  };
  return icons[type] || icons.info;
}

// API Client
const api = {
  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      utils.showNotification(error.message, 'error');
      throw error;
    }
  },

  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  },

  async uploadFile(endpoint, file, onProgress) {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${API_BASE}${endpoint}`;
    const config = {
      method: 'POST',
      credentials: 'same-origin',
      body: formData,
      headers: {}
    };

    if (onProgress) {
      config.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded * 100) / event.total);
          onProgress(progress);
        }
      };
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || `File upload failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('File upload failed:', error);
      utils.showNotification(error.message, 'error');
      throw error;
    }
  }
};

// Authentication
const auth = {
  async login(username, password) {
    return api.post('/api/login', { username, password });
  },

  async register(username, password, inviteCode) {
    return api.post('/api/register', { username, password, inviteCode });
  },

  async logout() {
    return api.post('/api/logout');
  },

  async getCurrentUser() {
    return api.get('/api/me');
  },

  async validateSession() {
    try {
      return await this.getCurrentUser();
    } catch (error) {
      return null;
    }
  }
};

// Server Management
const servers = {
  async getUserServers() {
    return api.get('/api/servers');
  },

  async createServer(name, description) {
    return api.post('/api/servers', { name, description });
  },

  async joinServer(inviteCode) {
    return api.post('/api/servers/join', { inviteCode });
  },

  async getServer(serverId) {
    return api.get(`/api/servers/${serverId}`);
  }
};

// Channel Management
const channels = {
  async createChannel(serverId, name, type = 'text', language = 'en') {
    return api.post(`/api/servers/${serverId}/channels`, { name, type, language });
  },

  async deleteChannel(serverId, channelId) {
    return api.delete(`/api/servers/${serverId}/channels/${channelId}`);
  }
};

// Message Management
const messages = {
  async getMessages(serverId, channelId) {
    const allMessages = await api.get(`/api/servers/${serverId}/channels/${channelId}/messages`);
    return allMessages;
  },

  async sendMessage(serverId, channelId, text) {
    return api.post(`/api/servers/${serverId}/channels/${channelId}/messages`, { text });
  }
};\n
// WebSocket Connection
function connectWebSocket() {
  if (socket) {
    socket.disconnect();
  }

  socket = io(CONFIG.serverUrl, {
    auth: {
      token: currentUser ? `user_${currentUser.id}` : null
    }
  });

  socket.on('connect', () => {
    console.log('WebSocket connected');
    utils.showNotification('Connected to chat', 'success', 2000);
    updateConnectionStatus(true);
  });

  socket.on('disconnect', (reason) => {
    console.log('WebSocket disconnected:', reason);
    updateConnectionStatus(false);
    utils.showNotification('Disconnected from chat', 'warning', 3000);

    // Attempt to reconnect
    if (connectionAttempts < CONFIG.maxReconnectAttempts) {
      connectionAttempts++;
      utils.showNotification(
        `Reconnecting... Attempt ${connectionAttempts} of ${CONFIG.maxReconnectAttempts}`,
        'info',
        CONFIG.autoReconnectDelay
      );

      autoReconnectTimer = setTimeout(connectWebSocket, CONFIG.autoReconnectDelay);
    } else {
      utils.showNotification(
        'Connection lost. Please refresh the page to reconnect.',
        'error'
      );
    }
  });\n
  socket.on('connect_error', (error) => {
    console.error('WebSocket connection error:', error);
    updateConnectionStatus(false);
    utils.showNotification('Connection error: ' + error.message, 'error');
  });\n
  socket.on('new_message', (message) => {
    addMessage(message);
  });\n
  socket.on('presence', (users) => {
    updateParticipants(users);
  });\n
  socket.on('voice_state_update', (data) => {
    updateVoiceState(data);
  });\n
  socket.on('server_invite', (data) => {
    utils.showNotification(
      `You've been invited to server: ${data.serverName}`,
      'info',
      5000
    );
  });\n
  socket.on('friend_request', (data) => {
    utils.showNotification(
      `${data.fromUser} sent you a friend request`,
      'info',
      5000
    );
  });\n
  socket.on('file_upload', (file) => {
    utils.showNotification(
      `${file.username} uploaded: ${file.originalName}`,
      'info',
      3000
    );
    addMessage(file);
  });\n
  socket.on('server_update', (data) => {
    utils.showNotification(
      `Server ${data.serverName} has been updated`,
      'info',
      3000
    );
  });\n
  socket.on('error', (error) => {
    utils.showNotification(error.message, 'error');
  });\n
  connectionAttempts = 0;
}

function updateConnectionStatus(connected) {
  const statusElement = document.getElementById('connection-status');
  const statusText = document.getElementById('connection-text');

  if (connected) {
    statusElement.className = 'status-indicator connected';
    statusText.textContent = 'Connected';
    statusText.className = 'status-text connected';
  } else {
    statusElement.className = 'status-indicator disconnected';
    statusText.textContent = 'Disconnected';
    statusText.className = 'status-text disconnected';
  }
}

// UI Updates
function updateParticipants(users) {
  participants = users;
  const participantsList = document.getElementById('participants-list');
  if (!participantsList) return;

  participantsList.replaceChildren();

  users.forEach(user => {
    const participantItem = document.createElement('div');
    participantItem.className = 'participant-item';

    const avatar = document.createElement('div');
    avatar.className = 'participant-avatar';
    avatar.textContent = user.username.charAt(0).toUpperCase();

    const info = document.createElement('div');
    info.className = 'participant-info';

    const name = document.createElement('div');
    name.className = 'participant-name';
    name.textContent = user.username;

    const status = document.createElement('div');
    status.className = 'participant-status';
    status.textContent = user.status || 'online';

    info.appendChild(name);
    info.appendChild(status);

    participantItem.appendChild(avatar);
    participantItem.appendChild(info);

    participantsList.appendChild(participantItem);
  });
}

function addMessage(message) {
  const messagesContainer = document.getElementById('messages-container');
  if (!messagesContainer) return;

  const messageElement = document.createElement('div');
  messageElement.className = 'message';
  if (currentUser && message.user_id === currentUser.id) {
    messageElement.classList.add('own-message');
  }

  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  avatar.textContent = message.username.charAt(0).toUpperCase();

  const content = document.createElement('div');
  content.className = 'message-content';

  const meta = document.createElement('div');
  meta.className = 'message-meta';

  const name = document.createElement('span');
  name.className = 'message-username';
  name.textContent = message.username;

  const time = document.createElement('span');
  time.className = 'message-time';
  const date = new Date(message.created_at);
  time.textContent = utils.formatTime(date);

  meta.appendChild(name);
  meta.appendChild(time);

  const text = document.createElement('div');
  text.className = 'message-text';
  text.textContent = message.text;

  content.appendChild(meta);
  content.appendChild(text);

  messageElement.appendChild(avatar);
  messageElement.appendChild(content);

  messagesContainer.appendChild(messageElement);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  // Highlight new message
  messageElement.style.animation = 'highlight 2s ease';
}

// File Upload
async function uploadFile(file, channelId, serverId) {
  try {
    utils.validateFile(file);
    utils.showLoading(true, 'Uploading file...');

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/api/files/upload`, {
      method: 'POST',
      credentials: 'same-origin',
      body: formData,
      headers: {
        'X-Server-ID': serverId,
        'X-Channel-ID': channelId
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'File upload failed');
    }

    const data = await response.json();
    utils.showNotification(`${file.name} uploaded successfully`, 'success');
    return data;
  } catch (error) {
    utils.showNotification(error.message, 'error');
    throw error;
  } finally {
    utils.showLoading(false);
  }
}

// Voice Chat
async function joinVoiceChannel(channelId, serverId) {
  try {
    utils.showLoading(true, 'Joining voice channel...');

    const response = await api.post(`/api/servers/${serverId}/voice-states`, {
      channelId
    });

    utils.showNotification('Joined voice channel successfully', 'success');
    return response;
  } catch (error) {
    utils.showNotification(error.message, 'error');
    throw error;
  } finally {
    utils.showLoading(false);
  }
}

async function leaveVoiceChannel(channelId, serverId) {
  try {
    utils.showLoading(true, 'Leaving voice channel...');

    await api.delete(`/api/servers/${serverId}/voice-states/${channelId}`);

    utils.showNotification('Left voice channel', 'info');
  } catch (error) {
    utils.showNotification(error.message, 'error');
    throw error;
  } finally {
    utils.showLoading(false);
  }
}

// UI State Management
function updateUIState() {
  const isAuthenticated = !!currentUser;

  document.getElementById('auth-screen').style.display = isAuthenticated ? 'none' : 'flex';
  document.getElementById('app-screen').style.display = isAuthenticated ? 'flex' : 'none';

  if (isAuthenticated) {
    document.getElementById('username-display').textContent = currentUser.username;
    document.getElementById('user-avatar').textContent = currentUser.username.charAt(0).toUpperCase();
  }
}

// Event Listeners
function setupEventListeners() {
  // Auth form
  document.getElementById('auth-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const inviteCode = document.getElementById('invite-code')?.value;

    try {
      utils.showLoading(true, 'Signing in...');

      if (mode === 'login') {
        const user = await auth.login(username, password);
        currentUser = user;
        updateUIState();
      } else {
        const user = await auth.register(username, password, inviteCode);
        currentUser = user;
        updateUIState();
        utils.showNotification('Registration successful! Please login.', 'success');
        showMode('login');
      }

      utils.showNotification('Welcome back!', 'success');
    } catch (error) {
      utils.showNotification(error.message, 'error');
    } finally {
      utils.showLoading(false);
    }
  });

  // Logout button
  document.getElementById('logout-btn')?.addEventListener('click', async () => {
    try {
      utils.showLoading(true, 'Logging out...');
      await auth.logout();
      currentUser = null;
      if (socket) socket.disconnect();
      updateUIState();
      utils.showNotification('Logged out successfully', 'success');
    } catch (error) {
      utils.showNotification(error.message, 'error');
    } finally {
      utils.showLoading(false);
    }
  });\n
  // Message input
  document.getElementById('message-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const messageInput = document.getElementById('message-input');
    const message = messageInput.value.trim();

    if (!message || !currentServer || !currentChannel) return;

    try {
      await messages.sendMessage(currentServer, currentChannel, message);
      messageInput.value = '';
    } catch (error) {
      utils.showNotification(error.message, 'error');
    }
  });\n
  // File upload
  document.getElementById('file-upload')?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      await uploadFile(file, currentChannel, currentServer);
    } catch (error) {
      // Error handled in uploadFile function
    }

    // Reset input
    e.target.value = '';
  });\n
  // Search
  document.getElementById('search-input')?.addEventListener('input', utils.debounce((e) => {
    const query = e.target.value.toLowerCase();
    // Implement search functionality
  }, 300));\n
  // Window beforeunload
  window.addEventListener('beforeunload', () => {
    if (socket) {
      socket.disconnect();
    }
  });\n
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K for search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      document.getElementById('search-input')?.focus();
    }

    // Ctrl/Cmd + Shift + M for mute
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'M') {
      e.preventDefault();
      // Toggle mute
    }

    // Ctrl/Cmd + Shift + V for voice channel
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'V') {
      e.preventDefault();
      toggleVoicePanel();
    }
  });\n
  // Modal close buttons
  document.querySelectorAll('.close-modal').forEach(button => {
    button.addEventListener('click', () => {
      const modal = button.closest('.modal');
      if (modal) {
        modal.style.display = 'none';
      }
    });
  });\n
  // Modal overlay click
  document.getElementById('modal-overlay')?.addEventListener('click', () => {
    const modals = document.querySelectorAll('.modal.show');
    modals.forEach(modal => {
      modal.style.display = 'none';
    });
  });\n
  // Window resize
  window.addEventListener('resize', utils.debounce(() => {
    // Handle responsive layout changes
  }, 250));\n
  // Online status check
  setInterval(async () => {
    if (currentUser) {
      try {
        await auth.validateSession();
      } catch (error) {
        utils.showNotification('Session expired. Please login again.', 'warning');
        currentUser = null;
        updateUIState();
      }
    }
  }, 60000); // Check every minute
}

// Initialization
async function init() {
  try {
    utils.showLoading(true, 'Initializing Chatly...');

    // Initialize i18n
    i18n.init();

    // Check if user is already logged in
    const user = await auth.validateSession();
    if (user) {
      currentUser = user;
      updateUIState();
    }

    // Setup event listeners
    setupEventListeners();

    utils.showLoading(false);

    // Show appropriate screen
    if (currentUser) {
      document.getElementById('auth-screen').style.display = 'none';
      document.getElementById('app-screen').style.display = 'flex';
    } else {
      document.getElementById('auth-screen').style.display = 'flex';
      document.getElementById('app-screen').style.display = 'none';
    }

    // Load initial data
    if (currentUser) {
      connectWebSocket();
    }

    console.log('Chatly Premium initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Chatly:', error);
    utils.showNotification('Failed to initialize Chatly. Please refresh the page.', 'error');
  }
}

// Start the application
init();

// Export for testing and external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    utils,
    api,
    auth,
    servers,
    channels,
    messages,
    connectWebSocket,
    updateUIState,
    init
  };
}