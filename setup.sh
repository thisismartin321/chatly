#!/bin/bash

# Chatly Premium Setup Script
# Automated setup for Chatly Premium development environment

set -e

echo "🚀 Setting up Chatly Premium..."

# Check Node.js version
NODE_VERSION="$(node --version | cut -d 'v' -f 1)"
MIN_NODE_VERSION="18"

echo "📋 Node.js version: $NODE_VERSION"

# Check if Node.js version is sufficient
if [[ "$(echo "$NODE_VERSION >= $MIN_NODE_VERSION" | bc -l)" -ne 1 ]]; then
    echo "❌ Node.js $MIN_NODE_VERSION or higher is required. Current version: $NODE_VERSION"
    echo "Please install Node.js $MIN_NODE_VERSION or higher."
    exit 1
fi

# Check for pnpm
echo "🔍 Checking for pnpm..."
if command -v pnpm &> /dev/null; then
    echo "✅ pnpm is installed"
else
    echo "📦 Installing pnpm..."
    curl -fsSL https://pnpm.io/install.sh | sh -
    export PATH="/root/.pnpm:$PATH"
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# Initialize database
echo "🗄️ Initializing database..."
if [ -f "chatly.db" ]; then
    echo "⚠️  Database already exists. Backing up..."
    cp chatly.db chatly.db.backup.$(date +%Y%m%d_%H%M%S)
fi

# Create secure files directory
mkdir -p encrypted_files
mkdir -p public/sounds

# Create necessary database tables
node -e "
const Database = require('better-sqlite3');
const db = new Database('chatly.db');

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON');

// Enable WAL mode
db.exec('PRAGMA journal_mode = WAL');

// Create additional indexes
const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);',
    'CREATE INDEX IF NOT EXISTS idx_file_uploads_uploaded_at ON file_uploads(uploaded_at);',
    'CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);',
    'CREATE INDEX IF NOT EXISTS idx_servers_owner_id ON servers(owner_id);',
    'CREATE INDEX IF NOT EXISTS idx_channels_server_id ON channels(server_id);',
    'CREATE INDEX IF NOT EXISTS idx_server_members_server_id ON server_members(server_id);',
    'CREATE INDEX IF NOT EXISTS idx_server_members_user_id ON server_members(user_id);',
    'CREATE INDEX IF NOT EXISTS idx_user_roles_server_id ON user_roles(server_id);',
    'CREATE INDEX IF NOT EXISTS idx_voice_states_channel_id ON voice_states(channel_id);'
];

indexes.forEach(sql => db.exec(sql));

console.log('✅ Database initialized with additional indexes');
" || echo "⚠️  Database initialization skipped (SQLite module not available)"

echo "✅ Setup completed successfully!"

echo "
🎉 Next steps:"
echo "  1. npm start           - Start the development server"
echo "  2. npm run build       - Build the application for production"
echo "  3. npm test            - Run the test suite"
echo "  4. Open http://localhost:3000 in your browser"

echo "
📚 Documentation:"
echo "  - README.md          - Project overview"
echo "  - INSTALL.md         - Installation guide"
echo "  - IMPLEMENTATION_SUMMARY.md - Implementation details"

echo "
🔧 Development commands:"
echo "  - npm run dev         - Development server with hot reload"
echo "  - npm run lint        - Code linting"
echo "  - npm run format      - Code formatting"
echo "  - npm run type-check  - Type checking"

echo "
🚀 Ready to chat!"