import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('chatly_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me')
};

export const serverService = {
  getServers: () => api.get('/servers'),
  createServer: (data) => api.post('/servers', data),
  joinServer: (inviteCode) => api.post('/servers/join', { inviteCode }),
  getServer: (serverId) => api.get(`/servers/${serverId}`),
  createChannel: (serverId, data) => api.post(`/servers/${serverId}/channels`, data),
  deleteChannel: (serverId, channelId) => api.delete(`/servers/${serverId}/channels/${channelId}`)
};

export const channelService = {
  getMessages: (serverId, channelId) => api.get(`/servers/${serverId}/channels/${channelId}/messages`),
  sendMessage: (serverId, channelId, data) => api.post(`/servers/${serverId}/channels/${channelId}/messages`, data),
  uploadFile: (serverId, channelId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/servers/${serverId}/channels/${channelId}/files`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getFiles: (serverId, channelId) => api.get(`/servers/${serverId}/channels/${channelId}/files`)
};

export const roleService = {
  getRoles: (serverId) => api.get(`/servers/${serverId}/roles`),
  createRole: (serverId, data) => api.post(`/servers/${serverId}/roles`, data),
  assignRole: (serverId, userId, roleId) => api.post(`/servers/${serverId}/members/${userId}/roles`, { roleId })
};

export const voiceService = {
  joinVoice: (serverId, channelId) => api.post(`/servers/${serverId}/voice-states`, { channelId }),
  leaveVoice: (serverId, userId) => api.delete(`/servers/${serverId}/voice-states/${userId}`)
};

export const friendService = {
  getFriends: (userId) => api.get(`/users/${userId}/friends`),
  addFriend: (userId, friendId) => api.post(`/users/${userId}/friends`, { friendId }),
  blockUser: (userId, blockedId) => api.post(`/users/${userId}/block`, { blockedId }),
  unblockUser: (userId, blockedId) => api.delete(`/users/${userId}/block/${blockedId}`)
};

export const soundboardService = {
  getSounds: (serverId) => api.get(`/servers/${serverId}/soundboard`),
  addSound: (serverId, data) => api.post(`/servers/${serverId}/soundboard`, data)
};

export default api;