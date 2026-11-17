require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const session = require("express-session");
const helmet = require("helmet");
const bcrypt = require("bcryptjs");
const Database = require("better-sqlite3");
const rateLimit = require("express-rate-limit");
const path = require("path");

if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32 ||
    !process.env.INVITE_CODE || process.env.INVITE_CODE.length < 8) {
  throw new Error("Bitte SESSION_SECRET (mind. 32 Zeichen) und INVITE_CODE in .env konfigurieren.");
}

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const db = new Database(path.join(__dirname, "chatly.db"));
const onlineUsers = new Map();

if (process.env.NODE_ENV === "production") app.set("trust proxy", 1);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    username TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      connectSrc: ["'self'", "ws:", "wss:"],
      imgSrc: ["'self'", "data:"]
    }
  }
}));
app.use(express.json({ limit: "10kb" }));

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
});
app.use(sessionMiddleware);
io.engine.use(sessionMiddleware);
app.use(express.static(path.join(__dirname, "public")));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Zu viele Versuche. Bitte warte kurz und versuche es erneut." }
});
const messageLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 8,
  standardHeaders: "draft-7",
  legacyHeaders: false
});

function cleanUsername(value) {
  return typeof value === "string" && /^[a-zA-Z0-9_]{3,20}$/.test(value);
}
function requireLogin(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: "Bitte anmelden." });
  next();
}
function broadcastPresence() {
  const users = [...new Map([...onlineUsers.values()].map(u => [u.id, u])).values()]
    .sort((a, b) => a.username.localeCompare(b.username));
  io.emit("presence", users);
}

app.post("/api/register", authLimiter, async (req, res) => {
  const { username, password, inviteCode } = req.body || {};
  if (inviteCode !== process.env.INVITE_CODE) return res.status(403).json({ error: "Ungültiger Einladungscode." });
  if (!cleanUsername(username)) return res.status(400).json({ error: "Benutzername: 3–20 Zeichen, Buchstaben, Zahlen oder _." });
  if (typeof password !== "string" || password.length < 10 || password.length > 72) {
    return res.status(400).json({ error: "Das Passwort muss 10 bis 72 Zeichen lang sein." });
  }
  try {
    const hash = await bcrypt.hash(password, 12);
    const result = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)").run(username, hash);
    req.session.regenerate(err => {
      if (err) return res.status(500).json({ error: "Sitzungsfehler." });
      req.session.user = { id: Number(result.lastInsertRowid), username };
      req.session.save(saveErr => saveErr
        ? res.status(500).json({ error: "Sitzungsfehler." })
        : res.json({ username }));
    });
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") return res.status(409).json({ error: "Name ist bereits vergeben." });
    res.status(500).json({ error: "Registrierung fehlgeschlagen." });
  }
});

app.post("/api/login", authLimiter, async (req, res) => {
  const { username, password } = req.body || {};
  if (typeof username !== "string" || typeof password !== "string") return res.status(400).json({ error: "Bitte Daten eingeben." });
  const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
  const valid = user ? await bcrypt.compare(password, user.password) : false;
  if (!valid) return res.status(401).json({ error: "Name oder Passwort falsch." });
  req.session.regenerate(err => {
    if (err) return res.status(500).json({ error: "Sitzungsfehler." });
    req.session.user = { id: user.id, username: user.username };
    req.session.save(saveErr => saveErr
      ? res.status(500).json({ error: "Sitzungsfehler." })
      : res.json({ username: user.username }));
  });
});

app.get("/api/me", requireLogin, (req, res) => res.json(req.session.user));
app.post("/api/logout", requireLogin, (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid", { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production" });
    res.json({ success: true });
  });
});
app.get("/api/messages", requireLogin, (req, res) => {
  const history = db.prepare("SELECT id, username, text, created_at FROM messages ORDER BY id DESC LIMIT 100").all().reverse();
  res.json(history);
});

io.use((socket, next) => {
  const user = socket.request.session?.user;
  if (!user) return next(new Error("Nicht angemeldet"));
  socket.user = user;
  next();
});
io.on("connection", socket => {
  onlineUsers.set(socket.id, socket.user);
  broadcastPresence();
  socket.on("chat message", text => {
    if (typeof text !== "string") return;
    const message = text.trim();
    if (!message || message.length > 1000) return;
    const result = db.prepare("INSERT INTO messages (user_id, username, text) VALUES (?, ?, ?)").run(socket.user.id, socket.user.username, message);
    const saved = db.prepare("SELECT id, username, text, created_at FROM messages WHERE id = ?").get(Number(result.lastInsertRowid));
    io.emit("chat message", saved);
  });
  socket.on("disconnect", () => {
    onlineUsers.delete(socket.id);
    broadcastPresence();
  });
});

const PORT = Number(process.env.PORT) || 3000;
server.listen(PORT, () => console.log(`Chatly läuft auf Port ${PORT}`));
