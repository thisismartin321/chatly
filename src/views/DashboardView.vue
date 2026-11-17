<template>
  <div class="dashboard">
    <Sidebar
      :current-server="currentServer"
      :current-channel="currentChannel"
      :servers="servers"
      :channels="channels"
      :voice-connected="voiceConnected"
      :current-voice-channel="currentVoiceChannel"
      :is-muted="isMuted"
      :is-deafened="isDeafened"
      @update:current-server="currentServer = $event"
      @update:current-channel="currentChannel = $event"
      @voice-action="handleVoiceAction"
    />

    <div class="main-content">
      <Navbar :current-user="currentUser" />

      <div class="dashboard-content">
        <div class="welcome-section">
          <div class="welcome-content">
            <h1>Welcome back, {{ currentUser?.username }}! 👋</h1>
            <p>{{ $t('server.created_success') }}</p>
          </div>
          <button class="btn-create-server" @click="showCreateServer = true">
            <i class="fas fa-plus"></i> {{ $t('server.create') }}
          </button>
        </div>

        <div class="servers-grid">
          <div
            v-for="server in servers"
            :key="server.id"
            class="server-card"
            @click="selectServer(server)"
          >
            <div class="server-card-icon">
              {{ server.name.charAt(0).toUpperCase() }}
            </div>
            <div class="server-card-info">
              <h3>{{ server.name }}</h3>
              <p>{{ server.description || 'No description' }}</p>
            </div>
            <div class="server-card-meta">
              <span>{{ server.member_count || 0 }} members</span>
            </div>
          </div>
        </div>

        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🔒</div>
            <h3>End-to-End Encryption</h3>
            <p>All messages and files are encrypted for your privacy</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🎤</div>
            <h3>Voice Channels</h3>
            <p>High-quality voice chat with your community</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📁</div>
            <h3>File Sharing</h3>
            <p>Share images, videos, and documents securely</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🎵</div>
            <h3>Soundboard</h3>
            <p>Custom sounds for your server</p>
          </div>
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
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useServerStore, useAuthStore } from '../store/auth';
import { serverService } from '../services/api';
import Navbar from '../components/Navbar.vue';
import Sidebar from '../components/Sidebar.vue';

export default {
  name: 'DashboardView',
  components: {
    Navbar,
    Sidebar
  },
  setup() {
    const serverStore = useServerStore();
    const authStore = useAuthStore();

    const currentUser = computed(() => authStore.user);
    const servers = computed(() => serverStore.servers);
    const currentServer = ref(null);
    const currentChannel = ref(null);
    const voiceConnected = ref(false);
    const currentVoiceChannel = ref(null);
    const isMuted = ref(false);
    const isDeafened = ref(false);
    const showCreateServer = ref(false);
    const newServerName = ref('');
    const newServerDesc = ref('');

    const selectServer = (server) => {
      currentServer.value = server;
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

    const handleVoiceAction = (action) => {
      if (action === 'leave') {
        voiceConnected.value = false;
        currentVoiceChannel.value = null;
      }
    };

    return {
      currentUser,
      servers,
      currentServer,
      currentChannel,
      voiceConnected,
      currentVoiceChannel,
      isMuted,
      isDeafened,
      showCreateServer,
      newServerName,
      newServerDesc,
      selectServer,
      createServer,
      handleVoiceAction
    };
  }
};
</script>

<style scoped>
.dashboard {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: #f0f2f5;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 260px;
}

.dashboard-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.welcome-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.welcome-content h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 8px;
}

.welcome-content p {
  color: #718096;
  margin: 0;
}

.btn-create-server {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #5865f2;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-create-server:hover {
  background: #4752c4;
  transform: translateY(-1px);
}

.servers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.server-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.server-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  border-color: #5865f2;
}

.server-card-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #5865f2, #4752c4);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  font-weight: 600;
}

.server-card-info h3 {
  font-size: 18px;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
}

.server-card-info p {
  font-size: 14px;
  color: #718096;
  margin: 4px 0 0;
}

.server-card-meta {
  font-size: 13px;
  color: #a0aec0;
  font-weight: 500;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.feature-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.2s;
}

.feature-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
}

.feature-icon {
  font-size: 32px;
  margin-bottom: 4px;
}

.feature-card h3 {
  font-size: 16px;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
}

.feature-card p {
  font-size: 14px;
  color: #718096;
  margin: 0;
  line-height: 1.5;
}

/* Modal */
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
  background: white;
  border-radius: 16px;
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
  padding: 20px;
  border-bottom: 1px solid #f1f5f9;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
}

.modal-header button {
  background: none;
  border: none;
  color: #a0aec0;
  font-size: 24px;
  cursor: pointer;
  line-height: 1;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #5865f2;
  box-shadow: 0 0 0 3px rgba(88, 101, 242, 0.1);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #f1f5f9;
}

.btn-secondary {
  padding: 10px 24px;
  background: #f8fafc;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  color: #475569;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #f1f5f9;
}

.btn-primary {
  padding: 10px 24px;
  background: #5865f2;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #4752c4;
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }

  .dashboard {
    flex-direction: column;
  }

  .servers-grid {
    grid-template-columns: 1fr;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>