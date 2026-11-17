# Chatly Premium Installation Guide

## Overview

Chatly Premium is a Discord-like chat platform with end-to-end encryption, multi-server support, and advanced features. This guide covers installation, setup, and configuration.

## System Requirements

### Minimum Requirements
- **Node.js**: 18.x or higher
- **Memory**: 2 GB RAM (minimum), 4 GB RAM (recommended)
- **Disk Space**: 1 GB for application files
- **Operating Systems**: Linux, macOS, Windows 10+

### Recommended Requirements
- **Node.js**: 18.x or higher (LTS version preferred)
- **Memory**: 4 GB RAM or more
- **Disk Space**: 2 GB for application files + database
- **Network**: Fast internet connection for updates and dependencies

## Installation Steps

### 1. Clone the Repository

```bash
# Clone the repository
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

### 3. Environment Configuration

Create a `.env` file in the project root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Security Keys
SESSION_SECRET=your-32-character-session-secret-here
INVITE_CODE=your-8-character-invite-code-here
ENCRYPTION_KEY=your-32-character-encryption-key-here
ENCRYPTION_IV=your-16-character-encryption-iv-here

# Database
DB_PATH=./chatly.db

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,application/pdf,text/plain

# External Services
TENOR_API_KEY=your-tenor-api-key-here

# Logging
LOG_LEVEL=info
```

### 4. Initialize Database

```bash
# Initialize the database
node -e "require('./src/server.js').initializeDatabase()"

# Or run the server to auto-initialize
npm start
```

### 5. Create Admin User

```bash
# Create the first admin user
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"secureAdminPass123","inviteCode":"your-invite-code-here"}'
```

### 6. Start the Server

```bash
# Start in development mode with hot reload
npm run dev

# Start in production mode
npm start
```

## Running the Application

### Basic Commands

```bash
# Start the development server
npm run dev

# Start the production server
npm start

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format

# Build the application
npm run build
```

### Accessing the Application

1. **Web Interface**: Open your browser and navigate to `http://localhost:3000`
2. **API Documentation**: Visit `http://localhost:3000/api/docs` (if enabled)
3. **Health Check**: Check `http://localhost:3000/api/health`

### Desktop Applications

The project includes desktop applications for Windows and Linux:

```bash
# Build desktop apps
npm run build:desktop

# Install desktop app
npm run install:desktop
```

### Mobile Applications

For Android and iOS development:

```bash
# Build Android app
npm run build:android

# Build iOS app (macOS required)
npm run build:ios

# Install mobile apps
npm run install:android
npm run install:ios
```

## Configuration

### Server Configuration

Edit the `.env` file to configure:

#### Server Settings
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (development/production)
- `HOST`: Server hostname (default: localhost)

#### Security Settings
- `SESSION_SECRET`: Secret key for session management
- `INVITE_CODE`: Invite code for user registration
- `ENCRYPTION_KEY`: Encryption key for file encryption
- `ENCRYPTION_IV`: Initialization vector for encryption

#### Database Settings
- `DB_PATH`: Path to SQLite database file

#### Rate Limiting
- `RATE_LIMIT_WINDOW_MS`: Rate limit window in milliseconds
- `RATE_LIMIT_MAX_REQUESTS`: Maximum requests per window

### Desktop App Configuration

Desktop apps use configuration files in the user's home directory:

#### Windows
- Configuration: `%APPDATA%\Chatly Premium\config.json`
- Data: `%APPDATA%\Chatly Premium\data`

#### Linux
- Configuration: `~/.config/Chatly Premium/config.json`
- Data: `~/.local/share/Chatly Premium`

#### macOS
- Configuration: `~/Library/Application Support/Chatly Premium/config.json`
- Data: `~/Library/Application Support/Chatly Premium`

### Mobile App Configuration

Mobile apps use device-specific configuration:

#### Android
- Configuration: `Android/data/com.chatly.premium/shared_prefs/config.xml`
- Storage: Internal storage

#### iOS
- Configuration: `Library/Preferences/com.chatly.premium.plist`
- Storage: iCloud Drive

## Docker Deployment

### Using Docker

```bash
# Build the Docker image
docker build -t chatly-premium .

# Run the application
docker run -p 3000:3000 --env-file .env chatly-premium
```

### Docker Compose

Create a `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  chatly-premium:
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
pm2 start src/server.js --name chatly-premium

# View PM2 logs
pm2 logs chatly-premium

# Restart the application
pm2 restart chatly-premium

# Stop the application
pm2 stop chatly-premium

# Delete the application
pm2 delete chatly-premium
```

### Using systemd

Create a systemd service file:

```ini
[Unit]
Description=Chatly Premium Server
After=network.target

[Service]
Type=simple
User=chatly
WorkingDirectory=/path/to/chatly-premium
ExecStart=/usr/bin/npm start
Environment=NODE_ENV=production
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Install the service
sudo systemctl enable chatly-premium
sudo systemctl start chatly-premium

# Check status
sudo systemctl status chatly-premium

# View logs
sudo journalctl -u chatly-premium -f
```

## Backup and Restore

### Backup

```bash
# Create a backup of the database
mkdir -p backups
cp chatly.db backups/chatly-$(date +%Y%m%d_%H%M%S).db

# Backup configuration files
cp .env ~/.config/ChatlyPremium/
cp *.json ~/.config/ChatlyPremium/
```

### Restore

```bash
# Restore the database
cp backups/chatly-database-name.db chatly.db

# Restore configuration files
cp ~/.config/ChatlyPremium/.env .
cp ~/.config/ChatlyPremium/*.json .
```

## Troubleshooting

### Common Issues

#### "EACCES: Permission denied"

```bash
# Fix file permissions
chmod 755 chatly.db
chmod 755 src/
```

#### "ECONNREFUSED"

```bash
# Check if the server is running
netstat -tlnp | grep 3000

# Start the server
npm start
```

#### "ETIMEDOUT"

```bash
# Check network connectivity
ping localhost

# Check firewall settings
iptables -L
```

#### Database Issues

```bash
# Reinitialize the database
rm -f chatly.db
npm start
```

### Getting Help

1. **Documentation**: Visit our documentation website
2. **GitHub Issues**: Report issues at [GitHub Repository](https://github.com/chatly-premium/chatly-premium/issues)
3. **Community**: Join our Discord community
4. **Support**: Contact support through the application

## Updates and Maintenance

### Regular Maintenance

```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Clear temporary files
rm -rf node_modules/.cache
rm -rf src/**/*.map

# Optimize database
# (SQLite is self-optimizing, but you can run vacuum if needed)
```

### Security Updates

```bash
# Update Node.js if needed
node --version

# Check for security vulnerabilities
npm audit

# Fix security issues
npm audit fix
```

## Development

### Adding New Features

1. **API Routes**: Add new routes in `src/server.js`
2. **Database Tables**: Add new tables in the database initialization
3. **Frontend Components**: Add new components in the frontend directory
4. **Testing**: Write tests in the test directory

### Running Tests

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

## Resources

### Documentation
- [API Documentation](https://docs.chatly.io)
- [Developer Guide](https://dev.chatly.io)
- [Architecture Overview](https://arch.chatly.io)

### Community
- [GitHub Repository](https://github.com/chatly-premium/chatly-premium)
- [Discord Community](https://discord.chatly.io)
- [Twitter](https://twitter.com/chatlyapp)
- [Reddit](https://reddit.com/r/chatly)

### Support
- [Help Center](https://help.chatly.io)
- [Contact Support](https://support.chatly.io)
- [Status Page](https://status.chatly.io)

## License

This project is licensed under the MIT License.

```
MIT License

Copyright (c) 2024 Chatly Premium Team

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

- Thanks to all contributors
- Special thanks to the open source community
- Thanks to users who reported issues and provided feedback
- Acknowledgments to the Node.js and open source ecosystem