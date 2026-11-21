# Chatly

Discord-like Chat Platform with End-to-End Encryption

## Overview

Chatly is a Discord-inspired chat platform featuring end-to-end encryption, multi-server support, language channels, secure file uploads, and advanced collaboration tools. This project is built with Node.js and Socket.IO, providing a secure and feature-rich messaging experience.

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

## Technology Stack

### Backend

- **Node.js**: Server-side JavaScript runtime
- **Socket.IO**: Real-time bidirectional communication
- **SQLite**: Local database with encryption support
- **Express**: Web framework for API endpoints

### Frontend

- **React**: Component-based user interface
- **TypeScript**: Type safety and better development experience
- **WebSocket**: Real-time communication client

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
npm install
```

3. **Environment variables**:

Create a `.env` file in the project root directory:

```env
PORT=3000
NODE_ENV=development
SESSION_SECRET=your-32-character-session-secret-here
INVITE_CODE=your-8-character-invite-code-here
ENCRYPTION_KEY=your-32-character-encryption-key-here
ENCRYPTION_IV=your-16-character-encryption-iv-here
```

4. **Run the server**:

```bash
npm start
```

5. **Access the application**:

Open your browser and navigate to:

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

## Production Deployment

### Using PM2

```bash
# Install PM2 globally
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

### Using systemd

Create a systemd service file:

```ini
[Unit]
Description=Chatly Server
After=network.target

[Service]
Type=simple
User=chatly
WorkingDirectory=/path/to/chatly
ExecStart=/usr/bin/npm start
Environment=NODE_ENV=production
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Install the service
sudo systemctl enable chatly
sudo systemctl start chatly

# Check status
sudo systemctl status chatly

# View logs
sudo journalctl -u chatly -f
```

## Testing & Quality Assurance

### Test Suite

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run e2e tests
npm run test:e2e
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format

# Check types
npm run type-check
```

## Development

### Code Quality

- **ESLint**: For code consistency
- **Prettier**: For code formatting
- **TypeScript**: For type safety
- **Documentation**: JSDoc comments

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

## License

This project is licensed under the MIT License.

```
MIT License

Copyright (c) 2024 Chatly Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Acknowledgments

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