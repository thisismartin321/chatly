<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <button class="nav-btn" :class="{ active: activeNav === 'servers' }" @click="activeNav = 'servers'">
        <i class="fas fa-layer-group"></i>
        <span>{{ $t('nav.servers') }}</span>
      </button>
      <button class="nav-btn" :class="{ active: activeNav === 'dm' }" @click="activeNav = 'dm'">
        <i class="fas fa-comments"></i>
        <span>{{ $t('nav.direct_messages') }}</span>
      </button>
      <button class="nav-btn" :class="{ active: activeNav === 'friends' }" @click="activeNav = 'friends'">
        <i class="fas fa-users"></i>
        <span>{{ $t('nav.friends') }}</span>
      </button>
    </div>

    <div class="servers-list">
      <h3 class="section-title">{{ $t('server.servers') }}</h3>
      <button class="add-server" @click="showCreateServer = true">
        <i class="fas fa-plus"></i>
      </button>
      <div class="server-items">
        <div
          v-for="server in servers"
          :key="server.id"
          class="server-item"
          :class="{ active: currentServer?.id === server.id }"
          @click="selectServer(server)"
        >
          <div class="server-avatar">{{ server.name.charAt(0).toUpperCase() }}</div>
          <span class="server-name">{{ server.name }}</span>
        </div>
      </div>
    </div>

    <div class="channels-list" v-if="currentServer">
      <h3 class="section-title">{{ $t('server.channels') }}</h3>
      <div class="channel-items">
        <div
          v-for="channel in channels"
          :key="channel.id"
          class="channel-item"
          :class="{ active: currentChannel?.id === channel.id }"
          @click="selectChannel(channel)"
        >
          <i :class="channel.type === 'voice' ? 'fas fa-microphone' : 'fas fa-hashtag'"></i>
          <span>{{ channel.name }}</span>
        </div>
      </div>
      <button class="add-channel" @click="showCreateChannel = true">
        <i class="fas fa-plus"></i>
      </button>
    </div>

    <div class="voice-panel" v-if="voiceConnected">
      <div class="voice-header">
        <i class="fas fa-microphone"></i>
        <span>{{ currentVoiceChannel?.name }}</span>
        <button @click="leaveVoice" class="leave-voice">
          <i class="fas fa-phone-slash"></i>
        </button>
      </div>
      <div class="voice-controls">
        <button @click="toggleMute" :class="{ muted: isMuted }">
          <i :class="isMuted ? 'fas fa-microphone-slash' : 'fas fa-microphone'"></i>
        </button>
        <button @click="toggleDeafen" :class="{ deafened: isDeafened }">
          <i :class="isDeafened ? 'fas fa-ear-muffs' : 'fas fa-volume-up'"></i>
        </button>
      </div>
    </div>

    <div class="nav-footer">
      <button class="nav-btn" @click="goToSettings">
        <i class="fas fa-cog"></i>
        <span>{{ $t('nav.settings') }}</span>
      </button>
      <button class="nav-btn danger" @click="logout">
        <i class="fas fa-sign-out-alt"></i>
        <span>{{ $t('nav.logout') }}</span>
      </button>
    </div>

    <!-- Create Server Modal -->
    <div v-if="showCreateServer" class="modal-overlay" @click.self="showCreateServer = false">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ $t('server.create') }}</h3>
          <button @click="showCreateServer = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>{{ $t('server.name') }}</label>
            <input v-model="newServerName" type="text" placeholder="My Server" />
          </div>
          <div class="form-group">
            <label>{{ $t('server.description') }}</label>
            <textarea v-model="newServerDesc" rows="3" placeholder="Optional description"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showCreateServer = false">{{ $t('common.cancel') }}</button>
          <button class="btn-primary" @click="createServer">{{ $t('common.create') }}</button>
        </div>
      </div>
    </div>

    <!-- Create Channel Modal -->
    <div v-if="showCreateChannel && currentServer" class="modal-overlay" @click.self="showCreateChannel = false">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ $t('channel.create_channel') }}</h3>
          <button @click="showCreateChannel = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>{{ $t('channel.channel_name') }}</label>
            <input v-model="newChannelName" type="text" placeholder="general" />
          </div>
          <div class="form-group">
            <label>{{ $t('channel.channel_type') }}</label>
            <select v-model="newChannelType">
              <option value="text">{{ $t('channel.text_channel') }}</option>
              <option value="voice">{{ $t('channel.voice_channel') }}</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showCreateChannel = false">{{ $t('common.cancel') }}</button>
          <button class="btn-primary" @click="createChannel">{{ $t('common.create') }}</button>
        </div>
      </div>
    </div>
  </aside>
</template>

<script>
import { ref, computed } from 'vue';
import { useServerStore, useAuthStore } from '../store/auth';
import { serverService, voiceService } from '../services/api';
import { useRouter } from 'vue-router';

export default {
  name: 'Sidebar',
  props: {
    currentServer: Object,
    currentChannel: Object,
    servers: Array,
    channels: Array,
    voiceConnected: Boolean,
    currentVoiceChannel: Object,
    isMuted: Boolean,
    isDeafened: Boolean
  },
  emits: ['update:current-server', 'update:current-channel', 'voice-action'],
  setup(props, { emit }) {
    const serverStore = useServerStore();
    const authStore = useAuthStore();
    const router = useRouter();

    const activeNav = ref('servers');
    const showCreateServer = ref(false);
    const showCreateChannel = ref(false);
    const newServerName = ref('');
    const newServerDesc = ref('');
    const newChannelName = ref('');
    const newChannelType = ref('text');

    const servers = computed(() => serverStore.servers);
    const channels = computed(() => serverStore.channels);

    const selectServer = (server) => {
      serverStore.setCurrentServer(server);
      emit('update:current-server', server);
      router.push({ name: 'ServerView', params: { serverId: server.id } });
    };

    const selectChannel = (channel) => {
      serverStore.setCurrentChannel(channel);
      emit('update:current-channel', channel);
      router.push({
        name: 'ChannelView',
        params: { serverId: props.currentServer?.id, channelId: channel.id }
      });
    };

    const createServer = async () => {
      if (!newServerName.value.trim()) return;
      try {
        const response = await serverService.createServer({
          name: newServerName.value,
          description: newServerDesc.value
        });
        serverStore.setServers([...serverStore.servers, response.data]);
        showCreateServer.value = false;
        newServerName.value = '';
        newServerDesc.value = '';
      } catch (error) {
        alert('Failed to create server');
      }
    };

    const createChannel = async () => {
      if (!newChannelName.value.trim() || !props.currentServer) return;
      try {
        const response = await serverService.createChannel(props.currentServer.id, {
          name: newChannelName.value,
          type: newChannelType.value
        });
        serverStore.setChannels([...serverStore.channels, response.data]);
        showCreateChannel.value = false;
        newChannelName.value = '';
      } catch (error) {
        alert('Failed to create channel');
      }
    };

    const leaveVoice = () => {
      if (props.currentServer) {
        voiceService.leaveVoice(props.currentServer.id, authStore.user?.id);
        emit('voice-action', 'leave');
      }
    };

    const toggleMute = () => {
      emit('voice-action', 'mute');
    };

    const toggleDeafen = () => {
      emit('voice-action', 'deafen');
    };

    const goToSettings = () => {
      router.push({ name: 'Settings' });
    };

    const logout = () => {
      authStore.logout();
      router.push({ name: 'Login' });
    };

    return {
      activeNav,
      showCreateServer,
      showCreateChannel,
      newServerName,
      newServerDesc,
      newChannelName,
      newChannelType,
      servers,
      channels,
      selectServer,
      selectChannel,
      createServer,
      createChannel,
      leaveVoice,
      toggleMute,
      toggleDeafen,
      goToSettings,
      logout
    };
  }
};
</script>

<style scoped>
.sidebar {
  background: #2f3136;
  color: #ffffff;
  width: 260px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 50;
}

.sidebar-header {
  display: flex;
  flex-direction: column;
  padding: 16px;
  border-bottom: 1px solid #3a3c41;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: none;
  border: none;
  color: #b9bbbe;
  cursor: pointer;
  border-radius: 6px;
  font-size: 14px;
  margin-bottom: 4px;
  transition: all 0.2s;
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.nav-btn.active {
  background: #4f545c;
  color: #ffffff;
}

.nav-btn i {
  width: 20px;
}

.section-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: #8e9297;
  margin: 20px 16px 8px;
  letter-spacing: 1px;
}

.servers-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 8px;
}

.server-items {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.server-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: none;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: #b9bbbe;
}

.server-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
}

.server-item.active {
  background: #4f545c;
  color: #ffffff;
}

.server-avatar {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #5865f2, #4752c4);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}

.server-name {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.add-server {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 10px;
  background: none;
  border: 1px dashed #4f545c;
  border-radius: 8px;
  color: #b9bbbe;
  cursor: pointer;
  font-size: 14px;
  margin-top: 8px;
  transition: all 0.2s;
}

.add-server:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: #5865f2;
  color: #5865f2;
}

.channels-list {
  padding: 12px 8px;
  border-top: 1px solid #3a3c41;
}

.channel-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.channel-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: none;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  color: #b9bbbe;
  font-size: 14px;
}

.channel-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
}

.channel-item.active {
  background: #4f545c;
  color: #ffffff;
}

.add-channel {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 8px;
  background: none;
  border: 1px dashed #4f545c;
  border-radius: 6px;
  color: #b9bbbe;
  cursor: pointer;
  font-size: 13px;
  margin-top: 8px;
  transition: all 0.2s;
}

.add-channel:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: #5865f2;
  color: #5865f2;
}

.voice-panel {
  padding: 12px;
  border-top: 1px solid #3a3c41;
  background: #292b2f;
}

.voice-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.voice-header i {
  color: #43b581;
}

.voice-header span {
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
}

.leave-voice {
  background: none;
  border: none;
  color: #f04747;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s;
}

.leave-voice:hover {
  background: rgba(240, 71, 71, 0.1);
}

.voice-controls {
  display: flex;
  gap: 8px;
}

.voice-controls button {
  flex: 1;
  padding: 8px;
  background: none;
  border: none;
  color: #b9bbbe;
  cursor: pointer;
  border-radius: 4px;
  font-size: 16px;
  transition: all 0.2s;
}

.voice-controls button:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
}

.voice-controls button.muted {
  color: #f04747;
}

.voice-controls button.deafened {
  color: #f04747;
}

.nav-footer {
  padding: 16px;
  border-top: 1px solid #3a3c41;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-btn.danger {
  color: #f04747;
}

.nav-btn.danger:hover {
  background: rgba(240, 71, 71, 0.1);
  color: #ff6b6b;
}

/* Modals */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal {
  background: #36393f;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  animation: modalSlide 0.3s ease;
}

@keyframes modalSlide {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #4f545c;
}

.modal-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
}

.modal-header button {
  background: none;
  border: none;
  color: #b9bbbe;
  font-size: 24px;
  cursor: pointer;
  line-height: 1;
}

.modal-body {
  padding: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #b9bbbe;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px;
  background: #2f3136;
  border: 1px solid #4f545c;
  border-radius: 4px;
  color: #ffffff;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  border-color: #5865f2;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px;
  border-top: 1px solid #4f545c;
}

.btn-secondary {
  padding: 10px 20px;
  background: none;
  border: 1px solid #4f545c;
  border-radius: 6px;
  color: #b9bbbe;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.05);
}

.btn-primary {
  padding: 10px 20px;
  background: #5865f2;
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #4752c4;
}

.btn-primary:active {
  transform: scale(0.98);
}
</style>