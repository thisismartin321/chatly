# Chatly - Quick Start Guide

## Overview

Chatly is a Discord-like chat platform with **end-to-end encryption**, **multi-server support**, and **advanced security features**. This guide will help you get started with the platform quickly.

## Prerequisites

- **Node.js 18.x or higher**
- **Network access** (for WebRTC and API calls)
- **Database storage** (SQLite)
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

## Quick Setup

### 1. Clone the Repository

```bash
# Clone Chatly repository
git clone https://github.com/chatly-premium/chatly-premium.git

# Navigate to the project directory
cd chatly-premium
```

### 2. Install Dependencies

```bash
# Install all project dependencies
npm install

# For faster installation (if available)
npm ci
```

### 3. Configure Environment

Create a `.env` file in the project root directory:

```env
PORT=3000
NODE_ENV=development
SESSION_SECRET=your-32-character-session-secret-here
INVITE_CODE=your-8-character-invite-code-here
ENCRYPTION_KEY=your-32-character-encryption-key-here
ENCRYPTION_IV=your-16-character-encryption-iv-here
```

### 4. Initialize Database

```bash
# The database will be created automatically when you start the server
npm start
```

## Start the Application

### Development Mode

```bash
# Start the development server with hot reload
npm run dev
```

### Production Mode

```bash
# Start the production server
npm start
```

## Access the Application

### Web Application

Open your web browser and navigate to:
```
http://localhost:3000
```

### Features Available

#### 🔒 **Security**
- **End-to-end encryption** for all messages and files
- **Secure authentication** with session management
- **Input validation** and sanitization
- **Rate limiting** to prevent abuse

#### 💬 **Chat Features**
- **Multi-server system** with invitation codes
- **Real-time messaging** with WebSocket
- **Direct messages** for one-on-one conversations
- **Message history** with search functionality
- **Mentions and notifications**

#### 🎮 **Discord-like Features**
- **Voice chat** with channel management
- **Text channels** organized by topics
- **Server roles and permissions**
- **Soundboard** with custom audio clips
- **Server events and activities**
- **Emoji and GIF support**

#### 🌍 **Multi-language Support**
- **13 languages** supported (English, German, Spanish, French, Italian, Portuguese, Russian, Chinese, Japanese, Korean, Arabic, Hindi, and Chinese)
- **IP-based language detection**
- **Consistent user experience** across all platforms

#### 📱 **Cross-platform**
- **Web application** (browser-based)
- **Desktop applications** (Windows and Linux)
- **Mobile applications** (Android and iOS)
- **Responsive design** for all screen sizes

## Basic Usage

### Registration
1. Click **"Register"** in the top-right corner
2. Fill in your username, password, and invite code
3. Click **"Create Account"** to register

### Login
1. Click **"Login"** in the top-right corner
2. Enter your username and password
3. Click **"Sign In"** to login

### Creating a Server
1. Click **"Servers"** in the sidebar
2. Click **"Create Server"** button
3. Enter server name and description
4. Your server is now ready!

### Joining a Server
1. Use the **invite code** provided by the server owner
2. Click **"Join Server"** and enter the code
3. You'll be added to the server's general channel

### Chatting
1. Select a server from the sidebar
2. Select a channel from the channel list
3. Type your message in the message input area
4. Press **Enter** or click the **send button**

### File Upload
1. Click the **paperclip icon** in the message input area
2. Select the file you want to upload
3. The file will be encrypted and uploaded securely

### Voice Chat
1. Select a server with voice channels
2. Click the **microphone icon** to join voice chat
3. Use voice controls to mute/deafen yourself

### Managing Friends
1. Go to **"Friends"** in the sidebar
2. Click **"Add Friend"** to send friend requests
3. Accept friend requests from other users

## Key Features

### 🔐 **Security**
- **End-to-end encryption** for all communications
- **Secure file upload** with encryption
- **Session management** with secure cookies
- **Rate limiting** to prevent abuse
- **Input validation** to prevent injection attacks

### 🚀 **Performance**
- **WebSocket** for real-time communication
- **SQLite database** for efficient data storage
- **Optimized API** with minimal overhead
- **Caching** for frequently accessed data
- **Compression** for network efficiency

### 🎨 **User Experience**
- **Responsive design** for all devices
- **Dark mode** support
- **Custom themes** and branding
- **Accessibility** with screen reader support
- **Intuitive interface** with minimal learning curve

### 🛠 **Development**
- **Modular architecture** for easy maintenance
- **Comprehensive API** documentation
- **Extensive test suite**
- **Docker support** for easy deployment
- **TypeScript** support for better development experience

## Testing

### Run Tests

```bash
# Run the test suite
npm test

# Lint code
npm run lint

# Format code
npm run format

# Type checking
npm run type-check
```

### Test Environment

The application includes a comprehensive test setup with:
- **Unit tests** for individual components
- **Integration tests** for API endpoints
- **E2E tests** for user workflows
- **Performance tests** for optimization

## Deployment

### Docker Deployment

```bash
# Build the Docker image
docker build -t chatly-premium .

# Run the application
docker run -p 80:3000 --env-file .env chatly-premium
```

### Production Deployment

```bash
# Install PM2
npm install -g pm2

# Start the application with PM2
pm2 start src/server.js --name chatly-premium

# View logs
pm2 logs chatly-premium
```

## Support

### Documentation
- **README.md** - Project overview and setup
- **INSTALL.md** - Detailed installation guide
- **IMPLEMENTATION_SUMMARY.md** - Implementation details
- **API Documentation** - Available in the source code

### Community
- **GitHub Issues** - Report bugs and request features
- **Discussions** - Discuss with other users
- **Contributing Guide** - Help improve the project

### Support Channels
- **GitHub Issues** - Technical support
- **Documentation** - Self-service help
- **Community Forum** - User discussions

## Legal and License

### License
This project is licensed under the MIT License.

### Copyright
Copyright © 2024 Chatly Team

### Attribution
- Built with ❤️ for the open-source community
- Inspired by Discord's feature set
- Thanks to all contributors

## Contact

### Website
Visit our website: https://chatly.io

### Social Media
- **GitHub**: https://github.com/chatly-premium
- **Twitter**: https://twitter.com/chatlyapp
- **Reddit**: https://reddit.com/r/chatly

### Support
- **Email**: support@chatly.io
- **Discord**: https://discord.chatly.io

## Acknowledgements

We would like to thank:
- **All contributors** for their contributions
- **Open source community** for inspiring features
- **Users** for their feedback and support
- **Node.js**, **Express**, **Socket.IO**, and other dependencies

## Thank You

Thank you for choosing Chatly! We're excited to have you join our community.

For the best experience, please:
1. Use a modern web browser
2. Keep your application updated
3. Report any issues you encounter
4. Provide feedback to help us improve

Enjoy your chat experience with Chatly! 🎉

---

*Chatly Premium - Secure. Fast. Feature-rich.*