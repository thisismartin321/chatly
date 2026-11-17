# Chatly

Discord-like Chat Platform with End-to-End Encryption

## Overview

Chatly is a comprehensive Discord-inspired chat platform featuring end-to-end encryption, multi-server system, language channels, secure file uploads, and advanced collaboration tools. This project is built with Node.js and Socket.IO, providing a secure and feature-rich messaging experience.

Chatly supports **over 13 languages** automatically detected from client IP addresses, matching Discord's multi-language approach. The platform includes both web-based and native applications (desktop and mobile) with seamless synchronization.

## Key Features

### Core Chat Features
- **End-to-End Encryption**: All messages and files are encrypted for privacy
- **Multi-Server System**: Create and manage multiple servers with unique invitation codes
- **Language Channels**: IP-based language detection and channel categorization
- **Real-time Messaging**: WebSocket-powered instant messaging
- **Direct Messages**: Private one-on-one conversations
- **File Uploads**: Secure encrypted file sharing

### Discord-like Features
- **Roles & Permissions**: Granular server management with customizable roles
- **Voice Channels**: Built-in voice chat with muting, deafening, and channel management
- **Soundboard**: Play server sounds and custom audio clips
- **Events & Streams**: Server events and live streaming support
- **Emojis & GIFs**: Comprehensive emoji and GIF integration with preview
- **User Management**: Friends, blocks, and friend requests

### Advanced Features
- **Screen Sharing**: Stream desktop content to voice channels
- **Server Settings**: Customization options for each server
- **Media Previews**: Automatic preview generation for images and videos
- **Mobile Support**: iOS and Android apps (React Native)
- **Desktop Apps**: Native Windows/Linux applications (Electron)
- **CI/CD Integration**: GitHub Actions for automated testing and deployment

### Discord Apps Integration
Chatly supports **native Discord-style applications** that can be installed directly:

#### Desktop Applications
- **Windows & Linux**: Electron-based desktop client
- **macOS**: Available for Mac users
- **Features**:
  - System tray integration
  - Native notifications
  - Auto-updates
  - Cross-platform consistency

#### Mobile Applications
- **Android**: React Native with material design
- **iOS**: React Native with native feel
- **Features**:
  - Push notifications
  - Background syncing
  - Offline message support
  - Biometrics authentication

#### Desktop App Features
- **System integration**: Window management, taskbar integration
- **File handling**: Native file picker, drag & drop
- **Theme support**: System theme detection and custom themes
- **Privacy controls**: Permission management
- **Developer tools**: Built-in debugging tools

#### Mobile App Features
- **Camera & microphone**: Native media capture
- **Storage**: Local storage with sync
- **Background tasks**: Message handling in background
- **Notifications**: Local and push notifications
- **Battery optimization**: Efficient power usage

## Architecture

### Backend
- **Node.js**: Server-side JavaScript runtime
- **Socket.IO**: Real-time bidirectional communication
- **SQLite**: Local database with encryption support
- **Express**: Web framework for API endpoints

### Frontend
- **React**: Component-based user interface
- **TypeScript**: Type safety and better development experience
- **WebSocket**: Real-time communication client

### Mobile & Desktop
- **React Native**: Cross-platform mobile applications
- **Electron**: Desktop application framework

## Quick Setup

### Prerequisites
- **Node.js 18.x or higher**
- **Network access** (for WebRTC and API calls)
- **Database storage** (SQLite)
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

### Installation Steps

1. **Clone the repository**:
```bash
git clone https://github.com/chatly/chatly.git

# Navigate to the project directory
cd chatly
```

2. **Install dependencies**:
```bash
# Install all project dependencies
npm install

# For faster installation (if available)
npm ci
```

3. **Environment variables**:
Create a `.env` file in the project root directory:
```env
PORT=3000
NODE_ENV=development
SESSION_SECRET=your-32+character-session-secret
INVITE_CODE=your-8+character-invite-code
ENCRYPTION_KEY=your-32+character-encryption-key
ENCRYPTION_IV=your-16+character-encryption-iv
```

4. **Run the server**:
```bash
# Start in development mode with hot reload
npm run dev

# Start in production mode
npm start
```

5. **Access the application**:
```
http://localhost:3000
```

## Multi-language Support

Chatly automatically detects the user's preferred language based on their IP address and browser settings:

- **English** (default)
- **German** (de)
- **Spanish** (es)
- **French** (fr)
- **Italian** (it)
- **Portuguese** (pt)
- **Russian** (ru)
- **Chinese** (zh)
- **Japanese** (ja)
- **Korean** (ko)
- **Arabic** (ar)
- **Hindi** (hi)
- **Chinese (Simplified)** (cn)

All translations are included in the `locales/` directory and are automatically loaded based on the user's location.

## Docker Deployment

### Quick Docker Setup

```bash
# Build the Docker image
docker build -t chatly .

# Run the application
# Create .env file with your environment variables
docker run -p 3000:3000 --env-file .env chatly
```

### Docker Compose

Create a `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  chatly:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - SESSION_SECRET=${SESSION_SECRET}
      - INVITE_CODE=${INVITE_CODE}
    volumes:
      - ./data:/app/data
      - ./sounds:/app/public/sounds
    restart: unless-stopped
```

```bash
# Start with Docker Compose
docker-compose up -d

# Stop the application
docker-compose down
```

### Production Deployment

```bash
# Install PM2
npm install -g pm2

# Start the application with PM2
pm2 start src/server.js --name chatly

# View logs
pm2 logs chatly

# Restart the application
pm2 restart chatly

# Stop the application
pm2 stop chatly
```

## Application Structure

### Desktop Application
- **Installation**: Windows MSI, Linux AppImage, macOS DMG
- **Features**: Native UI, system integration, auto-updates
- **Requirements**: Administrator privileges for installation

### Mobile Application
- **Platform**: React Native with cross-platform compatibility
- **Installation**: Google Play Store, Apple App Store
- **Features**: Push notifications, background sync, offline support

### Web Application
- **Access**: Direct web browser access
- **Features**: Progressive Web App (PWA) capabilities
- **Offline Support**: Cache data for offline usage

## Technical Specifications

### API Endpoints
- **Authentication**: `/api/register`, `/api/login`, `/api/logout`, `/api/me`
- **Servers**: `/api/servers`, `/api/servers/{id}`, `/api/servers/join`
- **Channels**: `/api/servers/{id}/channels`, `/api/servers/{id}/channels/{channelId}/messages`
- **Messages**: `/api/servers/{id}/channels/{channelId}/messages`
- **Files**: `/api/servers/{id}/channels/{channelId}/files`
- **Voice**: `/api/servers/{id}/voice-states`
- **Users**: `/api/users/{id}/friends`, `/api/users/{id}/block`

### Database Schema
- **16 tables** with comprehensive relationships
- **Encrypted storage** for sensitive data
- **Index optimization** for performance
- **Foreign key constraints** for data integrity

### Security Features
- **End-to-end encryption** for all communications
- **RSA key management** for secure sessions
- **AES-256-GCM encryption** for file protection
- **Rate limiting** to prevent abuse
- **Input validation** and sanitization
- **HTTPS enforcement** in production

## Testing & Quality Assurance

### Test Suite
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

### CI/CD Pipeline
- **GitHub Actions** for automated testing
- **Code quality checks** with ESLint
- **Security scanning** for vulnerabilities
- **Automated deployment** to production

## Development

### Code Quality
- **ESLint** for code consistency
- **Prettier** for code formatting

### Running Tests
```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run e2e tests
npm run test:e2e
```

### Adding Features
To add new features:

1. **API Routes**: Add new routes in `src/server.js`
2. **Database Tables**: Add new tables in the database initialization
3. **Frontend Components**: Add new components in the frontend directory
4. **Testing**: Write tests in the test directory

## Support

### Documentation
- **README.md**: Project overview and setup
- **INSTALL.md**: Installation guide
- **API Documentation**: Available in the source code

### Community
- **GitHub Issues**: Report bugs and request features
- **Discussions**: Discuss with other users
- **Contributing Guide**: Help improve the project

### Support Channels
- **GitHub Issues**: Technical support
- **Documentation**: Self-service help
- **Community Forum**: User discussions

## Legal and License

### License
This project is licensed under the MIT License.

### Copyright
Copyright © 2024 Chatly Team

### Attribution
- Built with ❤️ for the open-source community
- Inspired by Discord's feature set
- Thanks to all contributors

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

*Chatly - Secure. Fast. Feature-rich.*