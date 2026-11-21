# 💬 Chatly

**Discord-like Chat Platform with End-to-End Encryption**

Chatly is a secure, real-time chat platform featuring multi-server support, voice channels, file sharing, end-to-end encryption, and cross-platform desktop and mobile applications.

---

## 🚀 Features

### Core Communication
- ✅ Real-time messaging with WebSocket
- ✅ End-to-end encryption for all messages and files
- ✅ Multi-server system with invitation codes
- ✅ Direct messages between users
- ✅ Message history and search

### Voice & Media
- ✅ Voice channels with mute/deafen controls
- ✅ File uploads (images, videos, documents)
- ✅ Media previews
- ✅ Soundboard for custom sounds

### Social Features
- ✅ Friends system with requests and blocks
- ✅ User profiles and status
- ✅ Server roles and permissions
- ✅ Server events


### Security
- ✅ End-to-end encryption (AES-256)
- ✅ JWT authentication
- ✅ Rate limiting
- ✅ Input validation and sanitization
- ✅ Secure session management

---

## 📋 Installation

### Development

```bash
# Clone the repository
git clone <repository-url>
cd chatly

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

### Production (Web)

```bash
# Build for production
npm run build

# Serve with nginx or any static file server
# The dist/ folder contains the built application
```

---

## 🖥️ Desktop Applications

### Windows (.exe Installer)

```bash
# Build Windows executable
npm run exe

# Output: release/Chatly Setup x64.exe
# Output: release/Chatly Setup ia32.exe
```

### Linux (.deb, .rpm, .AppImage)

```bash
# Build Debian package
npm run deb

# Build RedHat package
npm run rpm

# Build AppImage
npm run appimage

# Output: release/ directory
```

---

## 📱 Mobile Applications

### Android (.apk)

```bash
# Install Cordova
npm install -g cordova

# Add Android platform
cordova platform add android

# Build release APK
cordova build android --release

# Output: platforms/android/app/build/outputs/apk/release/app-release.apk
```

---

## 🐳 Docker Deployment

### Server

```bash
# Build Docker image
docker build -t chatly-server .

# Run the server
docker run -p 3000:3000 \
  -e SESSION_SECRET=your-secret \
  -e INVITE_CODE=your-invite-code \
  -e ENCRYPTION_KEY=your-32-char-key \
  -e ENCRYPTION_IV=your-16-char-iv \
  chatly-server
```

### Docker Compose

```yaml
version: '3.8'

services:
  chatly-server:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - SESSION_SECRET=${SESSION_SECRET}
      - INVITE_CODE=${INVITE_CODE}
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
      - ENCRYPTION_IV=${ENCRYPTION_IV}
    volumes:
      - ./data:/app/data
      - ./encrypted_files:/app/encrypted_files
    restart: unless-stopped
```

---

## 🔧 Project Structure

```
chatly/
├── src/
│   ├── main.js              # Entry point
│   ├── App.vue              # Root component
│   ├── router/              # Vue Router
│   ├── store/               # Pinia state management
│   ├── services/            # API services
│   ├── utils/               # Utilities (encryption)
│   ├── components/          # Vue components
│   ├── views/               # Page views
│   ├── assets/              # Styles and assets
│   └── locales/             # i18n translations
│       ├── en.json          # English
│       └── de.json          # German
├── src-electron/            # Electron desktop app
│   ├── main.js              # Electron main process
│   └── preload.js           # Preload script
├── public/                  # Public assets
├── config.xml               # Cordova configuration
├── tauri.conf.json          # Tauri configuration
├── Dockerfile               # Server Dockerfile
├── package.json             # Dependencies and scripts
├── vite.config.ts           # Vite configuration
└── README.md                # This file
```

---

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run electron` | Build Electron desktop app |
| `npm run exe` | Build Windows .exe installer |
| `npm run deb` | Build Linux .deb package |
| `npm run rpm` | Build Linux .rpm package |
| `npm run appimage` | Build Linux AppImage |
| `npm run android` | Build Android APK |
| `npm run test` | Run tests |

---

## 🌍 Supported Languages

- English (en) - Default
- German (de)

Language is automatically detected from browser/IP settings.

---

## 🔐 Security

All communications are encrypted using:
- **AES-256-GCM** for message and file encryption
- **RSA-2048** for key exchange
- **JWT** for session authentication
- **bcrypt** for password hashing

---

## 📄 License

MIT License - see LICENSE file for details.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📞 Support

- Email: team@chatly.io
- Issues: GitHub Issues
- Discord: [Join our server](https://discord.gg/chatly)
