<template>
  <div class="message-input-container">
    <div class="input-actions">
      <button class="action-btn" @click="openFileUpload" title="{{ $t('message.upload_file') }}">
        <i class="fas fa-paperclip"></i>
      </button>
      <button class="action-btn" @click="toggleEmojiPicker" title="Emojis">
        <i class="fas fa-smile"></i>
      </button>
      <div v-if="replyingTo" class="reply-indicator">
        <span>{{ $t('message.reply') }}</span>
        <span class="reply-user">{{ replyingTo.username }}</span>
        <button @click="cancelReply">&times;</button>
      </div>
    </div>

    <div class="input-wrapper">
      <input
        type="text"
        v-model="messageText"
        @keydown.enter="sendMessage"
        @keydown.shift.enter.prevent
        :placeholder="$t('channel.send_message')"
        class="message-input"
        autocomplete="off"
      />
      <button
        class="send-btn"
        :disabled="!messageText.trim() || isSending"
        @click="sendMessage"
      >
        <i class="fas fa-paper-plane"></i>
      </button>
    </div>

    <div class="extra-actions">
      <button class="action-btn" @click="toggleGifPicker" title="GIFs">
        <i class="fas fa-image"></i>
      </button>
      <button class="action-btn" @click="toggleSoundboard" title="Soundboard">
        <i class="fas fa-music"></i>
      </button>
      <button class="action-btn" @click="startVoiceCall" title="Voice Call">
        <i class="fas fa-phone"></i>
      </button>
      <button class="action-btn" @click="startScreenShare" title="Screen Share">
        <i class="fas fa-desktop"></i>
      </button>
    </div>

    <input type="file" ref="fileInput" accept="image/*,video/*,audio/*,application/*" @change="handleFileUpload" style="display: none" />
  </div>
</template>

<script>
import { ref } from 'vue';
import { channelService } from '../services/api';
import encryption from '../utils/encryption';

export default {
  name: 'MessageInput',
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
    const messageText = ref('');
    const isSending = ref(false);
    const replyingTo = ref(null);
    const fileInput = ref(null);

    const sendMessage = async () => {
      if (!messageText.value.trim() || isSending.value) return;

      isSending.value = true;

      try {
        await channelService.sendMessage(props.serverId, props.channelId, {
          text: messageText.value,
          reply_to: replyingTo.value?.id
        });

        messageText.value = '';
        replyingTo.value = null;
        emit('message-sent');
      } catch (error) {
        alert('Failed to send message');
      } finally {
        isSending.value = false;
      }
    };

    const openFileUpload = () => {
      fileInput.value.click();
    };

    const handleFileUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        isSending.value = true;
        const response = await channelService.uploadFile(props.serverId, props.channelId, file);
        emit('message-sent', response.data);
      } catch (error) {
        alert('Failed to upload file');
      } finally {
        isSending.value = false;
        fileInput.value.value = '';
      }
    };

    const toggleEmojiPicker = () => {
      // Emoji picker implementation
      console.log('Emoji picker toggled');
    };

    const toggleGifPicker = () => {
      console.log('GIF picker toggled');
    };

    const toggleSoundboard = () => {
      console.log('Soundboard toggled');
    };

    const startVoiceCall = () => {
      console.log('Voice call started');
    };

    const startScreenShare = () => {
      console.log('Screen share started');
    };

    const cancelReply = () => {
      replyingTo.value = null;
    };

    return {
      messageText,
      isSending,
      replyingTo,
      fileInput,
      sendMessage,
      openFileUpload,
      handleFileUpload,
      toggleEmojiPicker,
      toggleGifPicker,
      toggleSoundboard,
      startVoiceCall,
      startScreenShare,
      cancelReply
    };
  }
};
</script>

<style scoped>
.message-input-container {
  background: #ffffff;
  border-top: 1px solid #e2e8f0;
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.reply-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #f1f5f9;
  border-radius: 6px;
  font-size: 13px;
  color: #475569;
}

.reply-indicator .reply-user {
  font-weight: 600;
  color: #3b82f6;
  margin-left: 4px;
}

.reply-indicator button {
  background: none;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  padding: 2px;
  line-height: 1;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: flex-end;
  gap: 10px;
}

.message-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  font-size: 14px;
  outline: none;
  resize: none;
  min-height: 40px;
  max-height: 120px;
  font-family: inherit;
}

.message-input:focus {
  border-color: #5865f2;
}

.send-btn {
  width: 40px;
  height: 40px;
  background: #5865f2;
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
  background: #4752c4;
  transform: scale(1.05);
}

.send-btn:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}

.extra-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.action-btn {
  width: 36px;
  height: 36px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 50%;
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

.action-btn i {
  pointer-events: none;
}
</style>