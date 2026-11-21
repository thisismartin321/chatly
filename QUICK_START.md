# Chatly - Quick Start Guide

## Overview

Chatly is a Discord-like chat platform with **end-to-end encryption**, **multi-server support**, and **advanced security features**. This guide will help you get started with the platform quickly.

## Prerequisites

- **Node.js 18.x or higher**
- **Network access** (for WebSocket and API calls)
- **Database storage** (SQLite)
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

## Quick Setup

### 1. Clone the Repository

```bash
# Clone Chatly repository
git clone https://github.com/chatly/chatly.git

# Navigate to the project directory
cd chatly
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

## Features Available

### 🔒 Security

- **End-to-end encryption** for all messages and files
- **Secure authentication** with session management
- **Input validation** and sanitization
- **Rate limiting** to prevent abuse

### 💬 Chat Features

- **Multi-server system** with invitation codes
- **Real-time messaging** with WebSocket
- **Direct messages** for one-on-one conversations
- **Message history** with search functionality
- **Mentions and notifications**

### 🎨 Discord-like Features

- **Voice channels** with channel management
- **Text channels** organized by topics
- **Server roles and permissions**
- **Soundboard** with custom audio clips
- **Server events and activities**

## Technology Stack

### Backend

- **Node.js**: Server-side JavaScript runtime
- **Express**: Web framework
- **Socket.IO**: Real-time communication
- **SQLite**: Local database with encryption support
- **bcryptjs**: Password hashing
- **crypto**: Encryption utilities
- **i18n**: Internationalization

### Frontend

- **React**: Component-based user interface
- **TypeScript**: Type safety and better development experience
- **WebSocket**: Real-time communication client

## Development

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type checking
npm run type-check
```

### Running Tests

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run e2e tests
npm run test:e2e
```

## Documentation

- **README.md**: Project overview and setup
- **API Documentation**: Available in the source code

## License

This project is licensed under the MIT License.