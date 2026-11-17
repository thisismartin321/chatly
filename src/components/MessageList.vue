<template>
  <div class="message-list">
    <div v-if="messages.length === 0" class="empty-state">
      <div class="empty-icon">
        <i class="fas fa-comments"></i>
      </div>
      <h3>{{ $t('channel.no_messages') }}</h3>
      <p>{{ $t('message.empty_message') }}</p>
    </div>

    <div class="messages-container" ref="messagesContainer">
      <div
        v-for="message in messages"
        :key="message.id"
        class="message"
        :class="{ own: message.user_id === currentUser?.id, system: message.type === 'system' }"
      >
        <div class="message-avatar">
          {{ message.username?.charAt(0).toUpperCase() || '?' }}
        </div>
        <div class="message-content">
          <div class="message-header">
            <span class="username">{{ message.username }}</span>
            <span class="timestamp">{{ formatTime(message.created_at) }}</span>
            <span class="status" v-if="message.user_id === currentUser?.id">
              <i class="fas fa-check-double" :class="{ delivered: message.status !== 'pending' }"></i>
            </span>
          </div>
          <div class="message-text" v-html="formatMessage(message.text)"></div>
          <div v-if="message.file_url" class="message-attachment">
            <a :href="message.file_url" target="_blank" class="file-link">
              <i class="fas fa-paperclip"></i>
              <span>{{ message.file_name }}</span>
            </a>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loadingMore" class="loading-more">
      <i class="fas fa-circle-notch fa-spin"></i>
      <span>{{ $t('common.loading') }}</span>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { channelService } from '../services/api';
import { useServerStore } from '../store/auth';
import encryption from '../utils/encryption';

export default {
  name: 'MessageList',
  props: {
    serverId: {
      type: [String, Number],
      required: true
    },
    channelId: {
      type: [String, Number],
      required: true
    },
    currentUser: Object
  },
  emits: ['message-sent'],
  setup(props, { emit }) {
    const serverStore = useServerStore();
    const messagesContainer = ref(null);
    const messages = ref([]);
    const loadingMore = ref(false);
    let page = 1;
    let hasMore = true;
    let isLoading = false;

    const formatTime = (timestamp) => {
      const date = new Date(timestamp);
      const now = new Date();
      if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const formatMessage = (text) => {
      // Basic markdown and link formatting
      let formatted = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/https?:\/\/[^\s]+/g, '<a href="$&" target="_blank" class="message-link">$&</a>');
      return formatted;
    };

    const loadMessages = async (reset = false) => {
      if (isLoading) return;
      isLoading = true;
      loadingMore.value = !reset;

      try {
        const response = await channelService.getMessages(props.serverId, props.channelId);
        const newMessages = response.data;

        if (reset) {
          messages.value = newMessages.map(m => ({
            ...m,
            text: encryption.decrypt(m.text)
          }));
          page = 1;
        } else {
          messages.value = [...messages.value, ...newMessages.map(m => ({
            ...m,
            text: encryption.decrypt(m.text)
          }))];
        }

        hasMore = newMessages.length > 0;
        page++;
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        isLoading = false;
        loadingMore.value = false;
        scrollToBottom();
      }
    };

    const scrollToBottom = () => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
      }
    };

    const handleScroll = (e) => {
      const container = e.target;
      if (container.scrollTop < 100 && hasMore && !isLoading) {
        loadMessages();
      }
    };

    const sendMessage = (text) => {
      if (!text.trim()) return;

      const encryptedText = encryption.encrypt(text);
      const tempMessage = {
        id: 'temp_' + Date.now(),
        username: props.currentUser?.username || 'You',
        text: text,
        created_at: new Date().toISOString(),
        user_id: props.currentUser?.id,
        status: 'pending'
      };

      messages.value = [...messages.value, tempMessage];
      scrollToBottom();

      channelService.sendMessage(props.serverId, props.channelId, { text: encryptedText })
        .then(response => {
          // Replace temp message with real one
          const index = messages.value.findIndex(m => m.id === tempMessage.id);
          if (index !== -1) {
            messages.value[index] = {
              ...response.data,
              text: text,
              status: 'sent'
            };
          }
          emit('message-sent', response.data);
        })
        .catch(error => {
          const index = messages.value.findIndex(m => m.id === tempMessage.id);
          if (index !== -1) {
            messages.value[index].status = 'error';
          }
          console.error('Failed to send message:', error);
        });
    };

    onMounted(() => {
      loadMessages(true);
      messagesContainer.value.addEventListener('scroll', handleScroll);
    });

    watch(() => props.channelId, () => {
      messages.value = [];
      page = 1;
      hasMore = true;
      loadMessages(true);
    });

    return {
      messages,
      loadingMore,
      messagesContainer,
      formatTime,
      sendMessage,
      loadMessages,
      scrollToBottom
    };
  }
};
</script>

<style scoped>
.message-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  min-height: 0;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #a0aec0;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 18px;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 8px;
}

.empty-state p {
  font-size: 14px;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  display: flex;
  gap: 12px;
  max-width: 70%;
  animation: messageAppear 0.3s ease;
}

@keyframes messageAppear {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message.own {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message.system {
  align-self: center;
  max-width: 100%;
  text-align: center;
  opacity: 0.6;
  font-size: 12px;
  color: #a0aec0;
  margin: 8px 0;
}

.message-avatar {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #5865f2, #4752c4);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}

.message.own .message-avatar {
  background: #43b581;
}

.message-content {
  max-width: 100%;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 4px;
}

.message.own .message-header {
  flex-direction: row-reverse;
}

.username {
  font-weight: 700;
  font-size: 14px;
  color: #2c3e50;
}

.message.own .username {
  color: #43b581;
}

.timestamp {
  font-size: 11px;
  color: #a0aec0;
  margin-left: 8px;
}

.message-text {
  font-size: 14px;
  line-height: 1.5;
  color: #2d3748;
  word-wrap: break-word;
  white-space: pre-wrap;
}

.message-text a.message-link {
  color: #5865f2;
  text-decoration: none;
  word-break: break-all;
}

.message-text a.message-link:hover {
  text-decoration: underline;
}

.status {
  font-size: 11px;
  margin-left: 6px;
}

.status .fa-check-double {
  color: #a0aec0;
}

.status .fa-check-double.delivered {
  color: #43b581;
}

.message-attachment {
  margin-top: 8px;
}

.file-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #5865f2;
  text-decoration: none;
  font-size: 14px;
}

.file-link:hover {
  text-decoration: underline;
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  color: #a0aec0;
  font-size: 14px;
}

@media (max-width: 768px) {
  .message {
    max-width: 85%;
  }
}
</style>