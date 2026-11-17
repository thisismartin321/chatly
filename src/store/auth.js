import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('chatly_token') || null,
    user: null,
    isAuthenticated: !!localStorage.getItem('chatly_token')
  }),
  actions: {
    setToken(token) {
      this.token = token;
      this.isAuthenticated = true;
      localStorage.setItem('chatly_token', token);
    },
    setUser(user) {
      this.user = user;
    },
    logout() {
      this.token = null;
      this.user = null;
      this.isAuthenticated = false;
      localStorage.removeItem('chatly_token');
      localStorage.removeItem('chatly_user');
    },
    async login(credentials) {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      const data = await response.json();
      if (data.token) {
        this.setToken(data.token);
        this.setUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.error };
    },
    async register(userData) {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await response.json();
      if (data.token) {
        this.setToken(data.token);
        this.setUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.error };
    }
  }
});

export const useServerStore = defineStore('servers', {
  state: () => ({
    servers: [],
    currentServer: null,
    currentChannel: null,
    channels: [],
    members: [],
    messages: []
  }),
  actions: {
    setServers(servers) {
      this.servers = servers;
    },
    setCurrentServer(server) {
      this.currentServer = server;
    },
    setCurrentChannel(channel) {
      this.currentChannel = channel;
    },
    setChannels(channels) {
      this.channels = channels;
    },
    setMembers(members) {
      this.members = members;
    },
    addMessage(message) {
      this.messages.push(message);
    },
    setMessages(messages) {
      this.messages = messages;
    }
  }
});