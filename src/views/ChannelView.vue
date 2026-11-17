<template>
  <div class="channel-view">
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

      <div class="chat-container">
        <div class="channel-header">
          <div class="channel-info">
            <button class="back-btn" @click="goBack">
              <i class="fas fa-arrow-left"></i>
            </button>
            <div class="channel-details">
              <div class="channel-type">
                <i :class="currentChannel?.type === 'voice' ? 'fas fa-microphone' : 'fas fa-hashtag'"></i>
                <span>{{ currentChannel?.type === 'voice' ? 'Voice Channel' : 'Text Channel' }}</span>
              </div>
              <h1>{{ currentChannel?.name }}</h1>
              <p>{{ currentChannel?.topic || 'No topic' }}</p>
            </div>
          </div>
          <div class="channel-actions">
            <button class="action-btn" @click="showMemberList = !showMemberList" title="Members">
              <i class="fas fa-users"></i>
              <span class="member-count">{{ members.length }}</span>
            </button>
            <button class="action-btn" @click="toggleEmojiPicker" title="Emoji">
              <i class="fas fa-smile"></i>
            </button>
            <button class="action-btn" @click="searchMessages" title="Search">
              <i class="fas fa-search"></i>
            </button>
          </div>
        </div>

        <div class="chat-wrapper">
          <MessageList
            :server-id="serverId"
            :channel-id="currentChannel?.id"
            :current-user="currentUser"
            @message-sent="onMessageSent"
          />

          <div v-if="showMemberList" class="member-panel">
            <div class="member-panel-header">
              <h3>Members ({{ members.length }})</h3>
              <button @click="showMemberList = false">&times;</button>
            </div>
            <div class="member-list-scroll">
              <div
                v-for="member in members"
                :key="member.id"
                class="member-item"
              >
                <div class="member-avatar">{{ member.username.charAt(0).toUpperCase() }}</div>
                <div class="member-info">
                  <span class="member-name">{{ member.username }}</span>
                  <span class="member-status-text online">Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <MessageInput
          :server-id="serverId"
          :channel-id="currentChannel?.id"
          :current-user="currentUser"
          @message-sent="onMessageSent"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useServerStore, useAuthStore } from '../store/auth';
import { channelService } from '../services/api';
import Navbar from '../components/Navbar.vue';
import Sidebar from '../components/Sidebar.vue';
import MessageList from '../components/MessageList.vue';
import MessageInput from '../components/MessageInput.vue';

export default {
  name: 'ChannelView',
  components: {
    Navbar,
    Sidebar,
    MessageList,
    MessageInput
  },
  props: {
    serverId: {
      type: [String, Number],
      required: true
    },
    channelId: {
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
    const currentChannel = computed(() =>
      channels.value.find(c => c.id === props.channelId) || null
    );
    const voiceConnected = ref(false);
    const currentVoiceChannel = ref(null);
    const isMuted = ref(false);
    const isDeafened = ref(false);
    const showMemberList = ref(false);

    const goBack = () => {
      // Navigate back to server view
      // This would typically use router
      console.log('Go back to server view');
    };

    const onMessageSent = (messageData) => {
      console.log('Message sent:', messageData);
    };

    const handleVoiceAction = (action) => {
      if (action === 'leave') {
        voiceConnected.value = false;
        currentVoiceChannel.value = null;
      }
    };

    const toggleEmojiPicker = () => {
      console.log('Emoji picker');
    };

    const searchMessages = () => {
      console.log('Search messages');
    };

    onMounted(() => {
      // Load channel details
      console.log('Channel view mounted');
    });

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
      showMemberList,
      serverId: props.serverId,
      goBack,
      onMessageSent,
      handleVoiceAction,
      toggleEmojiPicker,
      searchMessages
    };
  }
};
</script>

<style scoped>
.channel-view {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: #ffffff;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 260px;
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f0f2f5;
}

.channel-header {
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.channel-info {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.back-btn {
  width: 32px;
  height: 32px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #e2e8f0;
  color: #334155;
}

.channel-details h1 {
  font-size: 20px;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 4px;
}

.channel-details p {
  font-size: 14px;
  color: #718096;
  margin: 0;
}

.channel-type {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #5865f2;
  font-weight: 600;
  margin-bottom: 4px;
}

.channel-type i {
  font-size: 14px;
}

.channel-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 36px;
  height: 36px;
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
  position: relative;
}

.action-btn:hover {
  background: #e2e8f0;
  color: #334155;
}

.action-btn .member-count {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #5865f2;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 10px;
  font-weight: 600;
}

.chat-wrapper {
  flex: 1;
  display: flex;
  position: relative;
}

.member-panel {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 300px;
  background: #ffffff;
  border-left: 1px solid #e2e8f0;
  z-index: 50;
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform 0.3s ease;
}

.show-member-list & .member-panel {
  transform: translateX(0);
}

.member-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.member-panel-header h3 {
  font-size: 18px;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
}

.member-panel-header button {
  background: none;
  border: none;
  color: #a0aec0;
  font-size: 20px;
  cursor: pointer;
  line-height: 1;
}

.member-list-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.member-list-scroll .member-item {
  padding: 10px 16px;
  cursor: default;
}

.member-status-text {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.member-status-text.online {
  color: #43b581;
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }

  .channel-view {
    flex-direction: column;
  }

  .member-panel {
    position: fixed;
    right: 0;
  }
}
</style>