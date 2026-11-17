# Chatly Premium

Discord-like Chat Platform with End-to-End Encryption

## Overview

Chatly Premium is a comprehensive Discord-inspired chat platform featuring end-to-end encryption, multi-server system, language channels, secure file uploads, and advanced collaboration tools. This project is built with Node.js and Socket.IO, providing a secure and feature-rich messaging experience.

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

## Setup and Installation

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- SQLite database

### Installation Steps

1. **Clone the repository**:
```bash
git clone <repository-url>
cd chatly-premium
```

2. **Install dependencies**:
```bash
npm install
```

3. **Environment variables**:
Create a `.env` file in the project root:
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
npm start
```

5. **Access the application**:
Open your browser and navigate to `http://localhost:3000`

## API Documentation

### Authentication

#### Register
```http
POST /api/register
Content-Type: application/json

{
  "username": "johndoe",
  "password": "securepassword123",
  "inviteCode": "your-invite-code"
}
```

#### Login
```http
POST /api/login
Content-Type: application/json

{
  "username": "johndoe",
  "password": "securepassword123"
}
```

#### Logout
```http
POST /api/logout
```

### Server Management

#### Create Server
```http
POST /api/servers
Content-Type: application/json
Authorization: Bearer <session-token>

{
  "name": "My Server",
  "description": "A friendly server for everyone"
}
```

#### Join Server
```http
POST /api/servers/join
Content-Type: application/json
Authorization: Bearer <session-token>

{
  "inviteCode": "server-invite-code"
}
```

#### Get Server Details
```http
GET /api/servers/:serverId
Authorization: Bearer <session-token>
```

### Channels

#### Create Channel
```http
POST /api/servers/:serverId/channels
Content-Type: application/json
Authorization: Bearer <session-token>

{
  "name": "general",
  "type": "text",
  "language": "en"
}
```

#### Get Channel Messages
```http
GET /api/servers/:serverId/channels/:channelId/messages
Authorization: Bearer <session-token>
```

#### Send Message
```http
POST /api/servers/:serverId/channels/:channelId/messages
Content-Type: application/json
Authorization: Bearer <session-token>

{
  "text": "Hello, everyone!"
}
```

### File Uploads

#### Upload File
```http
POST /api/servers/:serverId/channels/:channelId/files
Content-Type: multipart/form-data
Authorization: Bearer <session-token>

<form>
  <input type="file" name="file">
</form>
```

### Voice Channels

#### Join Voice Channel
```http
POST /api/servers/:serverId/voice-states
Content-Type: application/json
Authorization: Bearer <session-token>

{
  "channelId": "voice-channel-id"
}
```

#### Leave Voice Channel
```http
DELETE /api/servers/:serverId/voice-states/:userId
Authorization: Bearer <session-token>
```

## Technology Stack

### Backend
- **Node.js**: Runtime environment
- **Express**: Web framework
- **Socket.IO**: Real-time communication
- **SQLite**: Local database
- **bcryptjs**: Password hashing
- **crypto**: Encryption utilities
- **i18n**: Internationalization

### Frontend
- **React**: UI components
- **TypeScript**: Type safety
- **WebSocket**: Real-time client

### Mobile
- **React Native**: Cross-platform mobile apps

### Desktop
- **Electron**: Desktop application framework

## Deployment

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### GitHub Actions
The project includes GitHub Actions workflows for:
- Automated testing
- Code quality checks
- Deployment to production

## Development

### Code Quality
```bash
# Lint code
npm run lint

# Format code
npm run format

# Run tests
npm test

# Type checking
npm run type-check
```

### Features
To add new features, modify the corresponding files in the `src/` directory:
- `src/server.js`: Backend API and WebSocket logic
- `src/locales/`: Language translations
- `src/components/`: React components

## Security

### Encryption
- **E2EE**: All messages and files are encrypted using AES-256-GCM
- **Key Management**: RSA key pairs for secure communication
- **File Encryption**: Individual file encryption with unique keys

### Authentication
- **Session-based**: Secure cookie-based sessions
- **Password Hashing**: bcrypt with salt
- **Rate Limiting**: Prevents brute force attacks

### Authorization
- **Role-based**: Granular permissions per role
- **Server isolation**: Each server has its own permission system
- **Block/Friend system**: User control over interactions

## Performance

### Optimization
- **WebSocket**: Efficient real-time communication
- **Database Indexing**: Optimized queries for fast data access
- **Caching**: Redis for session and media cache
- **Compression**: Gzip for API responses

### Scaling
- **Horizontal scaling**: Multiple server instances
- **Load balancing**: Nginx for production deployment
- **Database sharding**: For large-scale deployments

## Future Enhancements

### Planned Features
1. **Advanced Voice Processing**: Noise cancellation and voice effects
2. **AI Integration**: Smart chat responses and moderation
3. **Third-party Integrations**: Calendar, tasks, and external services
4. **Enterprise Features**: Advanced security and compliance
5. **Plugin System**: Extensible architecture for third-party plugins

### Mobile App Features
- **Push Notifications**: Real-time alerts
- **Background Sync**: Offline message support
- **Biometric Authentication**: Secure login methods
- **Widgets**: Home screen widgets

## License

This project is licensed under the MIT License.

## Contributing

We welcome contributions! Please read our contributing guidelines before submitting pull requests.

## Support

For support, please visit our documentation or contact us through the project repository.

## Changelog

### Version 2.0.0
- Initial release with core features
- End-to-end encryption
- Multi-server system
- Discord-like interface

### Version 2.1.0
- Enhanced mobile support
- Advanced security features
- Improved user experience

### Version 2.2.0
- Plugin system
- AI integration
- Performance improvements