<template>
  <div class="server-view">
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

      <div class="server-content">
        <div class="server-header">
          <div class="server-info">
            <div class="server-avatar-large">{{ currentServer?.name.charAt(0).toUpperCase() }}</div>
            <div class="server-details">
              <h1>{{ currentServer?.name }}</h1>
              <p>{{ currentServer?.description || 'No description' }}</p>
              <div class="server-stats">
                <span>{{ currentServer?.member_count || 0 }} members</span>
                <span>•</span>
                <span>{{ channels.length }} channels</span>
              </div>
            </div>
          </div>
          <div class="server-actions">
            <button class="action-btn" @click="inviteMembers" title="Invite">
              <i class="fas fa-user-plus"></i>
            </button>
            <button class="action-btn" @click="serverSettings" title="Settings">
              <i class="fas fa-cog"></i>
            </button>
          </div>
        </div>

        <div class="channels-panel">
          <div class="channel-section">
            <h3 class="section-title">Text Channels</h3>
            <div class="channel-list">
              <div
                v-for="channel in textChannels"
                :key="channel.id"
                class="channel-item"
                :class="{ active: currentChannel?.id === channel.id }"
                @click="selectChannel(channel)"
              >
                <i class="fas fa-hashtag"></i>
                <span>{{ channel.name }}</span>
              </div>
            </div>
          </div>

          <div class="channel-section">
            <h3 class="section-title">Voice Channels</h3>
            <div class="channel-list">
              <div
                v-for="channel in voiceChannels"
                :key="channel.id"
                class="channel-item voice-channel"
                :class="{ active: currentChannel?.id === channel.id }"
                @click="joinVoiceChannel(channel)"
              >
                <i class="fas fa-microphone"></i>
                <span>{{ channel.name }}</span>
              </div>
            </div>
          </div>

          <div class="channel-section">
            <h3 class="section-title">Members</h3>
            <div class="member-list">
              <div
                v-for="member in members"
                :key="member.id"
                class="member-item"
              >
                <div class="member-avatar">{{ member.username.charAt(0).toUpperCase() }}</div>
                <div class="member-info">
                  <span class="member-name">{{ member.username }}</span>
                  <span class="member-role">{{ member.role || 'member' }}</span>
                </div>
                <div class="member-status online"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useServerStore, useAuthStore } from '../store/auth';
import { serverService, voiceService } from '../services/api';
import Navbar from '../components/Navbar.vue';
import Sidebar from '../components/Sidebar.vue';

export default {
  name: 'ServerView',
  components: {
    Navbar,
    Sidebar
  },
  props: {
    serverId: {
      type: [String, Number],
      required: true
    }
  },
  setup(props) {
    const serverStore = useServerStore();
    const authStore = useAuthStore();

    const currentUser = computed(() => authStore.user);
    const servers = computed(() => serverStore.servers);
    const channels = computed(() => serverStore.channels);
    const members = computed(() => serverStore.members);

    const currentServer = computed(() =>
      servers.value.find(s => s.id === props.serverId) || null
    );
    const currentChannel = ref(null);
    const voiceConnected = ref(false);
    const currentVoiceChannel = ref(null);
    const isMuted = ref(false);
    const isDeafened = ref(false);

    const textChannels = computed(() =>
      channels.value.filter(c => c.type === 'text')
    );
    const voiceChannels = computed(() =>
      channels.value.filter(c => c.type === 'voice')
    );

    const selectChannel = (channel) => {
      serverStore.setCurrentChannel(channel);
      currentChannel.value = channel;
    };

    const joinVoiceChannel = async (channel) => {
      try {
        await voiceService.joinVoice(props.serverId, channel.id);
        voiceConnected.value = true;
        currentVoiceChannel.value = channel;
        currentChannel.value = channel;
      } catch (error) {
        alert('Failed to join voice channel');
      }
    };

    const handleVoiceAction = (action) => {
      if (action === 'leave') {
        voiceConnected.value = false;
        currentVoiceChannel.value = null;
      }
    };

    const inviteMembers = () => {
      if (currentServer.value) {
        const inviteUrl = `${window.location.origin}/servers/${currentServer.value.id}`;
        navigator.clipboard.writeText(inviteUrl).then(() => {
          alert('Invite link copied to clipboard');
        });
      }
    };

    const serverSettings = () => {
      // Open server settings modal
      console.log('Server settings opened');
    };

    return {
      currentUser,
      servers,
      channels,
      members,
      currentServer,
      currentChannel,
      voiceConnected,
      currentVoiceChannel,
      isMuted,
      isDeafened,
      textChannels,
      voiceChannels,
      selectChannel,
      joinVoiceChannel,
      handleVoiceAction,
      inviteMembers,
      serverSettings
    };
  }
};
</script>

<style scoped>
.server-view {
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

.server-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.server-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.server-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.server-avatar-large {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #5865f2, #4752c4);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 28px;
  font-weight: 700;
  flex-shrink: 0;
}

.server-details h1 {
  font-size: 28px;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 8px;
}

.server-details p {
  color: #718096;
  margin: 0 0 12px;
}

.server-stats {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #a0aec0;
  font-size: 14px;
}

.server-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  width: 40px;
  height: 40px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #e2e8f0;
  color: #334155;
  border-color: #cbd5e1;
}

.channels-panel {
  display: flex;
  gap: 24px;
}

.channel-section {
  flex: 1;
}

.channel-section h3.section-title {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  color: #a0aec0;
  margin-bottom: 12px;
  letter-spacing: 1px;
}

.channel-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.channel-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: none;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: #64748b;
  font-size: 14px;
  text-align: left;
}

.channel-item:hover {
  background: #f1f5f9;
  color: #334155;
}

.channel-item.active {
  background: #e2e8f0;
  color: #5865f2;
  border-right: 3px solid #5865f2;
}

.channel-item i {
  width: 20px;
  color: #94a3b8;
}

.channel-item.active i {
  color: #5865f2;
}

.channel-item.voice-channel i {
  color: #43b581;
}

.channel-item.voice-channel.active i {
  color: #43b581;
}

.member-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 8px;
  font-size: 14px;
}

.member-avatar {
  width: 32px;
  height: 32px;
  background: #cbd5e1;
  color: #475569;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}

.member-info {
  flex: 1;
}

.member-name {
  font-weight: 600;
  color: #2d3748;
}

.member-role {
  font-size: 12px;
  color: #a0aec0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.member-status {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #43b581;
}

.member-status.online {
  background: #43b581;
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }

  .server-view {
    flex-direction: column;
  }

  .channels-panel {
    flex-direction: column;
  }
}
</style>