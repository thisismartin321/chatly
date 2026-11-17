let mode = "login";
let socket = null;
let currentUser = null;
let toastTimer;

const $ = (id) => document.getElementById(id);
const authScreen = $("authScreen");
const appScreen = $("appScreen");
const authForm = $("authForm");
const authError = $("authError");
const authButton = $("authButton");
const inviteField = $("inviteField");
const messages = $("messages");
const messageInput = $("messageInput");

function showMode(nextMode) {
  mode = nextMode;
  $("loginTab").classList.toggle("active", mode === "login");
  $("registerTab").classList.toggle("active", mode === "register");
  inviteField.hidden = mode !== "register";
  $("password").autocomplete = mode === "login" ? "current-password" : "new-password";
  authButton.innerHTML = mode === "login" ? 'Anmelden <span>↗</span>' : 'Konto erstellen <span>↗</span>';
  authError.textContent = "";
}
$("loginTab").addEventListener("click", () => showMode("login"));
$("registerTab").addEventListener("click", () => showMode("register"));

function notify(text) {
  const toast = $("toast");
  toast.textContent = text;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
}

async function api(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", ...options.headers }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Ein Fehler ist aufgetreten.");
  return data;
}

function showApp(user) {
  currentUser = user;
  authScreen.hidden = true;
  appScreen.hidden = false;
  $("profileName").textContent = user.username;
  $("avatar").childNodes[0].textContent = user.username.charAt(0).toUpperCase();
  connectChat();
}

function renderMembers(users = []) {
  const list = $("memberList");
  list.replaceChildren();
  $("onlineCount").textContent = users.length;
  $("memberCount").textContent = users.length;
  users.forEach((user) => {
    const row = document.createElement("div");
    row.className = "member-row";
    const avatar = document.createElement("span");
    avatar.className = "member-mini-avatar";
    avatar.textContent = user.username.charAt(0).toUpperCase();
    const name = document.createElement("span");
    name.className = "member-name";
    name.textContent = user.username;
    const status = document.createElement("span");
    status.className = "member-online";
    row.append(avatar, name, status);
    list.append(row);
  });
}

function addMessage(message) {
  const welcome = messages.querySelector(".welcome");
  if (welcome) welcome.remove();

  const item = document.createElement("article");
  item.className = "message";
  if (currentUser && message.username === currentUser.username) item.classList.add("own-message");

  const avatar = document.createElement("div");
  avatar.className = "message-avatar";
  avatar.textContent = message.username.charAt(0).toUpperCase();

  const content = document.createElement("div");
  content.className = "message-content";
  const meta = document.createElement("div");
  meta.className = "message-meta";
  const name = document.createElement("strong");
  name.textContent = message.username;
  const time = document.createElement("time");
  const date = new Date(`${message.created_at}Z`);
  time.textContent = Number.isNaN(date.getTime()) ? "" : date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
  const text = document.createElement("p");
  text.className = "message-text";
  text.textContent = message.text;
  meta.append(name, time);
  content.append(meta, text);
  item.append(avatar, content);
  messages.append(item);
  messages.scrollTop = messages.scrollHeight;
}

async function connectChat() {
  if (socket) socket.disconnect();
  $("connectionText").textContent = "Verbinde…";
  try {
    const history = await api("/api/messages");
    messages.replaceChildren();
    if (history.length) history.forEach(addMessage);
    else {
      const welcome = document.createElement("div");
      welcome.className = "welcome";
      welcome.innerHTML = '<div class="welcome-symbol">✦</div><div class="welcome-tag">WILLKOMMEN IN DEINER COMMUNITY</div><h1>Hier beginnt<br>das Gespräch.</h1><p>Schreib die erste Nachricht und bring die Community zusammen.</p>';
      messages.append(welcome);
    }

    socket = io();
    socket.on("connect", () => {
      $("connectionText").textContent = "Live verbunden";
      $("connectionText").previousElementSibling.classList.add("connected");
    });
    socket.on("disconnect", () => {
      $("connectionText").textContent = "Verbindung getrennt";
      $("connectionText").previousElementSibling.classList.remove("connected");
    });
    socket.on("chat message", addMessage);
    socket.on("presence", renderMembers);
    socket.on("connect_error", () => {
      $("connectionText").textContent = "Verbindung fehlgeschlagen";
      notify("Verbindung zum Chat fehlgeschlagen.");
    });
  } catch (error) {
    notify(error.message);
  }
}

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  authError.textContent = "";
  authButton.disabled = true;
  const username = $("username").value.trim();
  const password = $("password").value;
  try {
    const user = mode === "register"
      ? await api("/api/register", { method: "POST", body: JSON.stringify({ username, password, inviteCode: $("inviteCode").value.trim() }) })
      : await api("/api/login", { method: "POST", body: JSON.stringify({ username, password }) });
    showApp(user);
  } catch (error) {
    authError.textContent = error.message;
  } finally {
    authButton.disabled = false;
  }
});

$("messageForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const text = messageInput.value.trim();
  if (!text) return;
  if (!socket || !socket.connected) return notify("Der Chat ist momentan nicht verbunden.");
  socket.emit("chat message", text);
  messageInput.value = "";
  messageInput.focus();
});

$("logoutButton").addEventListener("click", async () => {
  try {
    await api("/api/logout", { method: "POST" });
    if (socket) socket.disconnect();
    currentUser = null;
    renderMembers([]);
    appScreen.hidden = true;
    authScreen.hidden = false;
    authForm.reset();
    showMode("login");
  } catch (error) {
    notify(error.message);
  }
});

async function startChatly() {
  try {
    const user = await api("/api/me");
    showApp(user);
  } catch {
    authScreen.hidden = false;
    appScreen.hidden = true;
  }
}
startChatly();