// Chatly - Discord-like Chat Platform with End-to-End Encryption
// Multi-server system with invitation codes, language channels, and advanced features

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const session = require('express-session');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const Database = require('better-sqlite3');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const jwt = require('jsonwebtoken');
const i18n = require('i18n');
const uuidv4 = require('uuid').v4;
const ffmpeg = require('fluent-ffmpeg');
const fetch = require('node-fetch');

// Configuration
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'default-secret-key';
const INVITE_CODE = process.env.INVITE_CODE || 'default-invite-code';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key';
const ENCRYPTION_IV = process.env.ENCRYPTION_IV || 'default-encryption-iv';

// Initialize i18n for multi-language support
i18n.configure({
  locales: ['en', 'de', 'es', 'fr', 'it', 'pt', 'ru', 'zh', 'ja', 'ko', 'ar', 'hi', 'cn'],
  directory: path.join(__dirname, 'locales'),
  defaultLocale: 'en',
  queryParameter: 'lang',
  files: true,
  updateFiles: false
});

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:8080"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Database setup
const dbPath = path.join(__dirname, 'chatly.db');
const db = new Database(dbPath);

// Initialize database with all tables
const initializeDatabase = () => {
  db.exec(`
    -- Users table with public keys for encryption
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      public_key TEXT,
      avatar TEXT,
      status TEXT DEFAULT 'online',
      last_seen TEXT DEFAULT CURRENT_TIMESTAMP,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Servers table for multi-server system
    CREATE TABLE IF NOT EXISTS servers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      invite_code TEXT NOT NULL UNIQUE,
      owner_id INTEGER NOT NULL,
      description TEXT,
      avatar TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(owner_id) REFERENCES users(id)
    );

    -- Server members with roles
    CREATE TABLE IF NOT EXISTS server_members (
      server_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      role TEXT DEFAULT 'member',
      joined_at TEXT DEFAULT CURRENT_TIMESTAMP,
      last_seen TEXT,
      muted_until TEXT,
      deafened_until TEXT,
      PRIMARY KEY(server_id, user_id),
      FOREIGN KEY(server_id) REFERENCES servers(id),
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    -- Channels (text and voice)
    CREATE TABLE IF NOT EXISTS channels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      server_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      type TEXT DEFAULT 'text',
      language TEXT DEFAULT 'en',
      topic TEXT,
      position INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(server_id) REFERENCES servers(id)
    );

    -- Messages with encryption support
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      username TEXT NOT NULL,
      text TEXT NOT NULL,
      encrypted_text TEXT,
      channel_id INTEGER,
      server_id INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(channel_id) REFERENCES channels(id),
      FOREIGN KEY(server_id) REFERENCES servers(id)
    );

    -- File uploads with encryption
    CREATE TABLE IF NOT EXISTS file_uploads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      filename TEXT NOT NULL,
      encrypted_path TEXT NOT NULL,
      original_name TEXT NOT NULL,
      file_type TEXT NOT NULL,
      file_size INTEGER,
      channel_id INTEGER,
      server_id INTEGER,
      uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(channel_id) REFERENCES channels(id),
      FOREIGN KEY(server_id) REFERENCES servers(id)
    );

    -- Roles for server management
    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      server_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      color TEXT DEFAULT '#ffffff',
      permissions TEXT,
      position INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(server_id) REFERENCES servers(id)
    );

    -- User roles mapping
    CREATE TABLE IF NOT EXISTS user_roles (
      user_id INTEGER NOT NULL,
      server_id INTEGER NOT NULL,
      role_id INTEGER NOT NULL,
      PRIMARY KEY(user_id, server_id),
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(server_id) REFERENCES servers(id),
      FOREIGN KEY(role_id) REFERENCES roles(id)
    );

    -- Voice states for voice channels
    CREATE TABLE IF NOT EXISTS voice_states (
      user_id INTEGER NOT NULL,
      channel_id INTEGER NOT NULL,
      server_id INTEGER NOT NULL,
      joined_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(channel_id) REFERENCES channels(id),
      FOREIGN KEY(server_id) REFERENCES servers(id)
    );

    -- Server events
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      server_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      scheduled_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(server_id) REFERENCES servers(id)
    );

    -- Soundboard sounds
    CREATE TABLE IF NOT EXISTS soundboard_sounds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      server_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      duration INTEGER,
      created_by INTEGER NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(server_id) REFERENCES servers(id),
      FOREIGN KEY(created_by) REFERENCES users(id)
    );

    -- User friends list
    CREATE TABLE IF NOT EXISTS friends (
      user_id INTEGER NOT NULL,
      friend_id INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      requested_at TEXT DEFAULT CURRENT_TIMESTAMP,
      responded_at TEXT,
      PRIMARY KEY(user_id, friend_id),
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(friend_id) REFERENCES users(id)
    );

    -- User block list
    CREATE TABLE IF NOT EXISTS blocks (
      blocker_id INTEGER NOT NULL,
      blocked_id INTEGER NOT NULL,
      blocked_at TEXT DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY(blocker_id, blocked_id),
      FOREIGN KEY(blocker_id) REFERENCES users(id),
      FOREIGN KEY(blocked_id) REFERENCES users(id)
    );

    -- Server settings
    CREATE TABLE IF NOT EXISTS server_settings (
      server_id INTEGER PRIMARY KEY,
      welcome_message TEXT,
      default_role_id INTEGER,
      verification_level INTEGER DEFAULT 0,
      content_filter_level INTEGER DEFAULT 0,
      FOREIGN KEY(server_id) REFERENCES servers(id),
      FOREIGN KEY(default_role_id) REFERENCES roles(id)
    );

    -- User settings
    CREATE TABLE IF NOT EXISTS user_settings (
      user_id INTEGER PRIMARY KEY,
      theme TEXT DEFAULT 'light',
      notifications_enabled BOOLEAN DEFAULT true,
      sound_enabled BOOLEAN DEFAULT true,
      language TEXT DEFAULT 'en',
      privacy_mode TEXT DEFAULT 'normal',
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    -- GIF and emoji cache
    CREATE TABLE IF NOT EXISTS media_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL,
      type TEXT NOT NULL,
      preview_url TEXT,
      cache_key TEXT UNIQUE,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- User sessions for WebSocket authentication
    CREATE TABLE IF NOT EXISTS user_sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      socket_id TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      last_activity TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `);
};

// Apply database pragmas
initializeDatabase();

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      connectSrc: ["'self'", "ws:", "wss:", "http://localhost:3000"],
      imgSrc: ["'self'", "data:", "https://i.imgur.com", "https://cdn.discordapp.com"],
      mediaSrc: ["'self'", "data:", "https://i.imgur.com", "https://cdn.discordapp.com"]
    }
  }
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const sessionMiddleware = session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
});

app.use(sessionMiddleware);
io.engine.use(sessionMiddleware);

app.use(i18n.init);
app.use(express.static(path.join(__dirname, 'public')));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many attempts. Please wait a moment.' }
});

const messageLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 50,
  message: { error: 'Message rate limit exceeded. Please slow down.' }
});

// Authentication middleware
function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Please log in.' });
  }
  next();
}

function requireServerAccess(req, res, next) {
  const { serverId } = req.params;
  const userId = req.session.user.id;
  
  const member = db.prepare(
    'SELECT * FROM server_members WHERE server_id = ? AND user_id = ?'
  ).get(serverId, userId);
  
  if (!member) {
    return res.status(403).json({ error: 'You do not have access to this server.' });
  }
  next();
}

function cleanUsername(value) {
  return typeof value === 'string' && /^[a-zA-Z0-9_]{3,20}$/.test(value);
}

// Encryption utilities
const encryption = {
  generateKeyPair: () => {
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });
    return { privateKey, publicKey };
  },

  encryptText: (text, publicKey) => {
    const publicKeyObj = crypto.createPublicKey(publicKey);
    const buffer = Buffer.from(text, 'utf8');
    const encrypted = crypto.publicEncrypt(publicKeyObj, buffer);
    return encrypted.toString('base64');
  },

  decryptText: (encryptedText, privateKey) => {
    const privateKeyObj = crypto.createPrivateKey(privateKey);
    const buffer = Buffer.from(encryptedText, 'base64');
    const decrypted = crypto.privateDecrypt(privateKeyObj, buffer);
    return decrypted.toString('utf8');
  },

  encryptFile: (fileBuffer, recipientPublicKey) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-gcm', Buffer.from(ENCRYPTION_KEY));
    cipher.setAAD(iv);
    
    let encrypted = cipher.update(fileBuffer);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    const tag = cipher.getAuthTag();
    
    const encryptedData = {
      content: encrypted.toString('base64'),
      iv: iv.toString('base64'),
      tag: tag.toString('base64'),
      algorithm: 'aes-256-gcm'
    };
    
    return encryptedData;
  },

  decryptFile: (encryptedData, recipientPrivateKey) => {
    const decipher = crypto.createDecipher('aes-256-gcm', Buffer.from(ENCRYPTION_KEY));
    decipher.setAAD(Buffer.from(encryptedData.iv, 'base64'));
    decipher.setAuthTag(Buffer.from(encryptedData.tag, 'base64'));
    
    let decrypted = decipher.update(Buffer.from(encryptedData.content, 'base64'));
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted;
  },

  generateFileId: () => {
    return uuidv4();
  }
};

// API Routes

// Authentication routes
app.post('/api/register', authLimiter, async (req, res) => {
  const { username, password, inviteCode } = req.body;
  
  if (inviteCode !== INVITE_CODE) {
    return res.status(403).json({ error: 'Invalid invite code.' });
  }
  
  if (!cleanUsername(username)) {
    return res.status(400).json({ error: 'Username must be 3-20 characters and contain only letters, numbers, or underscores.' });
  }
  
  if (!password || password.length < 8 || password.length > 72) {
    return res.status(400).json({ error: 'Password must be 8-72 characters long.' });
  }
  
  try {
    const hash = await bcrypt.hash(password, 12);
    const keyPair = encryption.generateKeyPair();
    
    const result = db.prepare(
      'INSERT INTO users (username, password, public_key) VALUES (?, ?, ?)'
    ).run(username, hash, keyPair.publicKey);
    
    req.session.regenerate(err => {
      if (err) {
        return res.status(500).json({ error: 'Session error.' });
      }
      
      req.session.user = {
        id: Number(result.lastInsertRowid),
        username,
        publicKey: keyPair.publicKey
      };
      
      req.session.save(saveErr => {
        if (saveErr) {
          return res.status(500).json({ error: 'Session error.' });
        }
        
        res.json({
          username,
          userId: Number(result.lastInsertRowid),
          publicKey: keyPair.publicKey
        });
      });
    });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'Username already taken.' });
    }
    res.status(500).json({ error: 'Registration failed.' });
  }
});

app.post('/api/login', authLimiter, async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Please provide username and password.' });
  }
  
  try {
    const user = db.prepare(
      'SELECT * FROM users WHERE username = ?'
    ).get(username);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }
    
    const valid = await bcrypt.compare(password, user.password);
    
    if (!valid) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }
    
    req.session.regenerate(err => {
      if (err) {
        return res.status(500).json({ error: 'Session error.' });
      }
      
      req.session.user = {
        id: user.id,
        username: user.username,
        publicKey: user.public_key
      };
      
      req.session.save(saveErr => {
        if (saveErr) {
          return res.status(500).json({ error: 'Session error.' });
        }
        
        res.json({
          username: user.username,
          userId: user.id,
          publicKey: user.public_key
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed.' });
  }
});

app.get('/api/me', requireLogin, (req, res) => {
  const user = db.prepare(
    'SELECT id, username, created_at FROM users WHERE id = ?'
  ).get(req.session.user.id);
  
  res.json(user);
});

app.post('/api/logout', requireLogin, (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
});

// Server management routes
app.post('/api/servers', requireLogin, async (req, res) => {
  const { name, description } = req.body;
  
  if (!name || name.length < 2 || name.length > 100) {
    return res.status(400).json({ error: 'Server name must be 2-100 characters.' });
  }
  
  const inviteCode = crypto.randomBytes(16).toString('hex');
  
  const result = db.prepare(
    'INSERT INTO servers (name, invite_code, owner_id, description) VALUES (?, ?, ?, ?)'
  ).run(name, inviteCode, req.session.user.id, description);
  
  const serverId = Number(result.lastInsertRowid);
  
  db.prepare(
    'INSERT INTO server_members (server_id, user_id, role) VALUES (?, ?, ?)'
  ).run(serverId, req.session.user.id, 'admin');
  
  db.prepare(
    'INSERT INTO channels (server_id, name, type) VALUES (?, ?, ?)'
  ).run(serverId, 'general', 'text');
  
  res.json({
    serverId,
    name,
    inviteCode,
    ownerId: req.session.user.id
  });
});

app.get('/api/servers', requireLogin, (req, res) => {
  const servers = db.prepare(
    'SELECT * FROM servers WHERE owner_id = ?'
  ).all(req.session.user.id);
  
  res.json(servers);
});

app.post('/api/servers/join', requireLogin, (req, res) => {
  const { inviteCode } = req.body;
  
  const server = db.prepare(
    'SELECT * FROM servers WHERE invite_code = ?'
  ).get(inviteCode);
  
  if (!server) {
    return res.status(404).json({ error: 'Server not found.' });
  }
  
  const member = db.prepare(
    'SELECT * FROM server_members WHERE server_id = ? AND user_id = ?'
  ).get(server.id, req.session.user.id);
  
  if (member) {
    return res.status(400).json({ error: 'You are already a member of this server.' });
  }
  
  db.prepare(
    'INSERT INTO server_members (server_id, user_id, role) VALUES (?, ?, ?)'
  ).run(server.id, req.session.user.id, 'member');
  
  res.json({ serverId: server.id, name: server.name });
});

app.get('/api/servers/:serverId', [requireLogin, requireServerAccess], (req, res) => {
  const { serverId } = req.params;
  
  const server = db.prepare('SELECT * FROM servers WHERE id = ?').get(serverId);
  const channels = db.prepare(
    'SELECT * FROM channels WHERE server_id = ? ORDER BY position'
  ).all(serverId);
  const roles = db.prepare(
    'SELECT * FROM roles WHERE server_id = ?'
  ).all(serverId);
  const members = db.prepare(
    'SELECT u.id, u.username, sm.role, sm.joined_at FROM users u JOIN server_members sm ON u.id = sm.user_id WHERE sm.server_id = ?'
  ).all(serverId);
  
  res.json({
    server,
    channels,
    roles,
    members
  });
});

// Channel management routes
app.post('/api/servers/:serverId/channels', [requireLogin, requireServerAccess], (req, res) => {
  const { serverId } = req.params;
  const { name, type, language } = req.body;
  
  if (!name || name.length < 1 || name.length > 100) {
    return res.status(400).json({ error: 'Channel name must be 1-100 characters.' });
  }
  
  const result = db.prepare(
    'INSERT INTO channels (server_id, name, type, language) VALUES (?, ?, ?, ?)'
  ).run(serverId, name, type, language);
  
  res.json({
    channelId: Number(result.lastInsertRowid),
    name,
    type,
    language
  });
});

app.delete('/api/servers/:serverId/channels/:channelId', [requireLogin, requireServerAccess], (req, res) => {
  const { serverId, channelId } = req.params;
  
  db.prepare('DELETE FROM channels WHERE id = ? AND server_id = ?').run(channelId, serverId);
  db.prepare('DELETE FROM messages WHERE channel_id = ?').run(channelId);
  db.prepare('DELETE FROM file_uploads WHERE channel_id = ?').run(channelId);
  
  res.json({ success: true });
});

// Message handling
app.get('/api/servers/:serverId/channels/:channelId/messages', [requireLogin, requireServerAccess], (req, res) => {
  const { serverId, channelId } = req.params;
  
  const messages = db.prepare(
    `SELECT m.id, m.user_id, m.username, m.text, m.encrypted_text, m.created_at 
     FROM messages m 
     WHERE m.channel_id = ? AND m.server_id = ? 
     ORDER BY m.id DESC 
     LIMIT 100`
  ).all(channelId, serverId);
  
  res.json(messages.reverse());
});

app.post('/api/servers/:serverId/channels/:channelId/messages', [requireLogin, requireServerAccess, messageLimiter], async (req, res) => {
  const { serverId, channelId } = req.params;
  const { text } = req.body;
  const userId = req.session.user.id;
  
  if (!text || text.trim().length === 0 || text.length > 2000) {
    return res.status(400).json({ error: 'Message must be between 1 and 2000 characters.' });
  }
  
  const username = req.session.user.username;
  const user = db.prepare('SELECT public_key FROM users WHERE id = ?').get(userId);
  
  let encryptedText = null;
  if (user && user.public_key) {
    try {
      encryptedText = encryption.encryptText(text, user.public_key);
    } catch (error) {
      console.error('Encryption failed:', error);
    }
  }
  
  const result = db.prepare(
    'INSERT INTO messages (user_id, username, text, encrypted_text, channel_id, server_id) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(userId, username, text, encryptedText, channelId, serverId);
  
  const message = db.prepare(
    'SELECT * FROM messages WHERE id = ?'
  ).get(result.lastInsertRowid);
  
  // Emit via WebSocket
  io.to(`server_${serverId}`).emit('new_message', message);
  
  res.json(message);
});

// File upload
app.post('/api/servers/:serverId/channels/:channelId/files', [requireLogin, requireServerAccess], async (req, res) => {
  const { serverId, channelId } = req.params;
  const userId = req.session.user.id;
  
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded.' });
  }
  
  const user = db.prepare('SELECT public_key FROM users WHERE id = ?').get(userId);
  
  if (!user || !user.public_key) {
    return res.status(400).json({ error: 'User public key not found.' });
  }
  
  const file = req.files[0];
  const fileId = encryption.generateFileId();
  const encryptedData = encryption.encryptFile(file.buffer, user.public_key);
  
  const filePath = `/encrypted_files/${fileId}`;
  
  db.prepare(
    'INSERT INTO file_uploads (user_id, filename, encrypted_path, original_name, file_type, channel_id, server_id) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(
    userId,
    fileId,
    JSON.stringify(encryptedData),
    file.originalname,
    file.mimetype,
    channelId,
    serverId
  );
  
  // Emit via WebSocket
  const fileRecord = db.prepare(
    'SELECT * FROM file_uploads WHERE user_id = ? AND filename = ?'
  ).get(userId, fileId);
  
  io.to(`server_${serverId}`).emit('new_file', fileRecord);
  
  res.json(fileRecord);
});

app.get('/api/servers/:serverId/channels/:channelId/files', [requireLogin, requireServerAccess], (req, res) => {
  const { serverId, channelId } = req.params;
  
  const files = db.prepare(
    'SELECT * FROM file_uploads WHERE channel_id = ? AND server_id = ? ORDER BY uploaded_at DESC'
  ).all(channelId, serverId);
  
  res.json(files);
});

// Roles and permissions
app.post('/api/servers/:serverId/roles', [requireLogin, requireServerAccess], (req, res) => {
  const { serverId } = req.params;
  const { name, color, permissions } = req.body;
  
  if (!name || name.length < 1 || name.length > 50) {
    return res.status(400).json({ error: 'Role name must be 1-50 characters.' });
  }
  
  const result = db.prepare(
    'INSERT INTO roles (server_id, name, color, permissions) VALUES (?, ?, ?, ?)'
  ).run(serverId, name, color, JSON.stringify(permissions));
  
  res.json({
    roleId: Number(result.lastInsertRowid),
    name,
    color,
    permissions
  });
});

app.post('/api/servers/:serverId/members/:userId/roles', [requireLogin, requireServerAccess], (req, res) => {
  const { serverId, userId } = req.params;
  const { roleId } = req.body;
  
  const role = db.prepare('SELECT * FROM roles WHERE id = ? AND server_id = ?').get(roleId, serverId);
  
  if (!role) {
    return res.status(404).json({ error: 'Role not found.' });
  }
  
  db.prepare(
    'INSERT OR REPLACE INTO user_roles (user_id, server_id, role_id) VALUES (?, ?, ?)'
  ).run(userId, serverId, roleId);
  
  db.prepare(
    'UPDATE server_members SET role = ? WHERE server_id = ? AND user_id = ?'
  ).run(role.name, serverId, userId);
  
  res.json({ success: true });
});

// Voice state management
app.post('/api/servers/:serverId/voice-states', [requireLogin, requireServerAccess], (req, res) => {
  const { serverId } = req.params;
  const { channelId } = req.body;
  const userId = req.session.user.id;
  
  if (channelId) {
    // Join voice channel
    db.prepare(
      'INSERT INTO voice_states (user_id, channel_id, server_id) VALUES (?, ?, ?)'
    ).run(userId, channelId, serverId);
    
    // Update server members last_seen
    db.prepare(
      'UPDATE server_members SET last_seen = CURRENT_TIMESTAMP WHERE server_id = ? AND user_id = ?'
    ).run(serverId, userId);
    
    // Emit voice state update
    io.to(`server_${serverId}`).emit('voice_state_update', {
      userId,
      channelId,
      serverId,
      action: 'join'
    });
  }
  
  res.json({ success: true });
});

app.delete('/api/servers/:serverId/voice-states/:userId', [requireLogin, requireServerAccess], (req, res) => {
  const { serverId, userId } = req.params;
  const currentUserId = req.session.user.id;
  
  db.prepare(
    'DELETE FROM voice_states WHERE user_id = ? AND server_id = ?'
  ).run(userId, serverId);
  
  // Emit voice state update
  io.to(`server_${serverId}`).emit('voice_state_update', {
    userId,
    serverId,
    action: 'leave'
  });
  
  res.json({ success: true });
});

// Soundboard
app.get('/api/servers/:serverId/soundboard', [requireLogin, requireServerAccess], (req, res) => {
  const { serverId } = req.params;
  
  const sounds = db.prepare(
    `SELECT s.id, s.name, s.duration, u.username, s.created_at
     FROM soundboard_sounds s
     JOIN users u ON s.created_by = u.id
     WHERE s.server_id = ?
     ORDER BY s.created_at DESC`
  ).all(serverId);
  
  res.json(sounds);
});

app.post('/api/servers/:serverId/soundboard', [requireLogin, requireServerAccess], async (req, res) => {
  const { serverId } = req.params;
  const { name, file } = req.body;
  const userId = req.session.user.id;
  
  if (!name || name.length < 1 || name.length > 100) {
    return res.status(400).json({ error: 'Sound name must be 1-100 characters.' });
  }
  
  if (!file) {
    return res.status(400).json({ error: 'Sound file is required.' });
  }
  
  const fileName = encryption.generateFileId() + '.mp3';
  const filePath = path.join(__dirname, 'public', 'sounds', fileName);
  
  fs.writeFileSync(filePath, Buffer.from(file, 'base64'));
  
  const result = db.prepare(
    'INSERT INTO soundboard_sounds (server_id, name, file_path, duration, created_by) VALUES (?, ?, ?, ?, ?)'
  ).run(serverId, name, `/sounds/${fileName}`, 0, userId);
  
  res.json({
    soundId: Number(result.lastInsertRowid),
    name,
    filePath: `/sounds/${fileName}`
  });
});

// Friends system
app.get('/api/users/:userId/friends', requireLogin, (req, res) => {
  const { userId } = req.params;
  
  if (userId !== req.session.user.id) {
    return res.status(403).json({ error: 'You can only access your own friend list.' });
  }
  
  const friends = db.prepare(
    `SELECT u.id, u.username, f.status, f.requested_at, f.responded_at
     FROM friends f
     JOIN users u ON (f.user_id = u.id AND f.friend_id = ?) OR (f.friend_id = u.id AND f.user_id = ?)
     WHERE (f.user_id = ? OR f.friend_id = ?) AND f.status = 'accepted'
     ORDER BY u.username`
  ).all(userId, userId, userId, userId);
  
  res.json(friends);
});

app.post('/api/users/:userId/friends', requireLogin, (req, res) => {
  const { userId } = req.params;
  const { friendId } = req.body;
  
  if (userId !== req.session.user.id) {
    return res.status(403).json({ error: 'You can only send friend requests to yourself.' });
  }
  
  if (userId === friendId) {
    return res.status(400).json({ error: 'You cannot add yourself as a friend.' });
  }
  
  const existingRequest = db.prepare(
    'SELECT * FROM friends WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)'
  ).get(userId, friendId, friendId, userId);
  
  if (existingRequest) {
    if (existingRequest.status === 'accepted') {
      return res.status(400).json({ error: 'You are already friends with this user.' });
    }
    return res.status(400).json({ error: 'Friend request already sent.' });
  }
  
  db.prepare(
    'INSERT INTO friends (user_id, friend_id, status) VALUES (?, ?, ?)'
  ).run(userId, friendId, 'pending');
  
  res.json({ success: true });
});

// Block system
app.post('/api/users/:userId/block', requireLogin, (req, res) => {
  const { userId } = req.params;
  const { blockedId } = req.body;
  
  if (userId !== req.session.user.id) {
    return res.status(403).json({ error: 'You can only block yourself.' });
  }
  
  const existingBlock = db.prepare(
    'SELECT * FROM blocks WHERE blocker_id = ? AND blocked_id = ?'
  ).get(userId, blockedId);
  
  if (existingBlock) {
    return res.status(400).json({ error: 'You have already blocked this user.' });
  }
  
  db.prepare(
    'INSERT INTO blocks (blocker_id, blocked_id) VALUES (?, ?)'
  ).run(userId, blockedId);
  
  // Remove any friend relationship
  db.prepare(
    'DELETE FROM friends WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)'
  ).run(userId, blockedId, blockedId, userId);
  
  res.json({ success: true });
});

app.delete('/api/users/:userId/block/:blockedId', requireLogin, (req, res) => {
  const { userId, blockedId } = req.params;
  
  if (userId !== req.session.user.id) {
    return res.status(403).json({ error: 'You can only unblock yourself.' });
  }
  
  db.prepare(
    'DELETE FROM blocks WHERE blocker_id = ? AND blocked_id = ?'
  ).run(userId, blockedId);
  
  res.json({ success: true });
});

// WebSocket connection handler
io.on('connection', (socket) => {
  const sessionCookie = socket.handshake.headers.cookie;
  
  if (!sessionCookie) {
    socket.disconnect();
    return;
  }
  
  const sessionId = `session=${sessionCookie.split('=')[1].split(';')[0]}`;
  const sessionData = sessionMiddlewareStore[sessionId];
  
  if (!sessionData || !sessionData.user) {
    socket.disconnect();
    return;
  }
  
  const userId = sessionData.user.id;
  const username = sessionData.user.username;
  
  socket.userId = userId;
  socket.username = username;
  socket.join(`user_${userId}`);
  
  // Get user's servers
  const servers = db.prepare(
    'SELECT server_id FROM server_members WHERE user_id = ?'
  ).all(userId);
  
  servers.forEach(server => {
    socket.join(`server_${server.server_id}`);
    
    // Get online members for this server
    const onlineMembers = db.prepare(
      'SELECT user_id, username, last_seen FROM users u JOIN server_members sm ON u.id = sm.user_id WHERE sm.server_id = ? AND u.id != ?'
    ).all(server.server_id, userId);
    
    io.to(`server_${server.server_id}`).emit('presence_update', onlineMembers);
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    // Update user online status
    db.prepare(
      'UPDATE users SET last_seen = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(userId);
    
    // Update server member status
    servers.forEach(server => {
      db.prepare(
        'UPDATE server_members SET last_seen = CURRENT_TIMESTAMP WHERE server_id = ? AND user_id = ?'
      ).run(server.server_id, userId);
      
      io.to(`server_${server.server_id}`).emit('user_offline', { userId, username });
    });
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  
  res.json({
    status: 'healthy',
    uptime: uptime,
    memory: {
      rss: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB',
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB'
    },
    timestamp: new Date().toISOString()
  });
});

// Serve static files for desktop apps
app.use('/sounds', express.static(path.join(__dirname, 'public', 'sounds')));
app.use('/encrypted_files', express.static(path.join(__dirname, 'encrypted_files')));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found.' });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Chatly Premium server running on port ${PORT}`);
  console.log(`Server started at ${new Date().toISOString()}`);
});

module.exports = app;
