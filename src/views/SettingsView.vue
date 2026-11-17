<template>
  <div class="settings-view">
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

      <div class="settings-content">
        <div class="settings-header">
          <button class="back-btn" @click="goBack">
            <i class="fas fa-arrow-left"></i>
          </button>
          <h1>{{ $t('settings.title') }}</h1>
        </div>

        <div class="settings-tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="tab-btn"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="settings-body">
          <!-- Profile Tab -->
          <div v-if="activeTab === 'profile'" class="settings-section">
            <h2>{{ $t('settings.profile') }}</h2>
            <form @submit.prevent="saveProfile" class="settings-form">
              <div class="form-group">
                <label>{{ $t('auth.username') }}</label>
                <input v-model="profile.username" type="text" required />
              </div>
              <div class="form-group">
                <label>{{ $t('auth.email') }}</label>
                <input v-model="profile.email" type="email" required />
              </div>
              <div class="form-group">
                <label>{{ $t('common.avatar') }}</label>
                <input v-model="profile.avatar_url" type="url" placeholder="Avatar URL" />
              </div>
              <button type="submit" class="btn-primary">{{ $t('common.save') }}</button>
            </form>
          </div>

          <!-- Appearance Tab -->
          <div v-if="activeTab === 'appearance'" class="settings-section">
            <h2>{{ $t('settings.appearance') }}</h2>
            <div class="settings-form">
              <div class="form-group">
                <label>{{ $t('settings.theme') }}</label>
                <div class="theme-options">
                  <button
                    v-for="theme in themes"
                    :key="theme.id"
                    class="theme-btn"
                    :class="{ active: theme.id === selectedTheme }"
                    @click="selectedTheme = theme.id"
                  >
                    <span class="theme-icon">{{ theme.icon }}</span>
                    <span>{{ theme.label }}</span>
                  </button>
                </div>
              </div>
              <div class="form-group">
                <label>{{ $t('common.font_size') }}</label>
                <div class="font-size-options">
                  <button
                    v-for="size in fontSizes"
                    :key="size.id"
                    class="font-btn"
                    :class="{ active: selectedFontSize === size.id }"
                    @click="selectedFontSize = size.id"
                  >
                    {{ size.label }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Language Tab -->
          <div v-if="activeTab === 'language'" class="settings-section">
            <h2>{{ $t('settings.language') }}</h2>
            <div class="settings-form">
              <div class="form-group">
                <label>{{ $t('settings.language') }}</label>
                <div class="language-options">
                  <button
                    v-for="lang in languages"
                    :key="lang.code"
                    class="lang-btn"
                    :class="{ active: selectedLanguage === lang.code }"
                    @click="changeLanguage(lang.code)"
                  >
                    <span>{{ lang.name }}</span>
                    <span v-if="selectedLanguage === lang.code" class="active-badge">✓</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Notifications Tab -->
          <div v-if="activeTab === 'notifications'" class="settings-section">
            <h2>{{ $t('settings.notifications') }}</h2>
            <div class="settings-form">
              <div class="form-group toggle-group">
                <div class="toggle-item">
                  <span>{{ $t('common.notifications') }}</span>
                  <label class="toggle-switch">
                    <input type="checkbox" v-model="settings.notifications" />
                    <span class="toggle-slider"></span>
                  </label>
                </div>
                <div class="toggle-item">
                  <span>{{ $t('common.sound') }}</span>
                  <label class="toggle-switch">
                    <input type="checkbox" v-model="settings.sounds" />
                    <span class="toggle-slider"></span>
                  </label>
                </div>
                <div class="toggle-item">
                  <span>{{ $t('common.desktop_notifications') }}</span>
                  <label class="toggle-switch">
                    <input type="checkbox" v-model="settings.desktop" />
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Privacy Tab -->
          <div v-if="activeTab === 'privacy'" class="settings-section">
            <h2>{{ $t('settings.privacy') }}</h2>
            <div class="settings-form">
              <div class="form-group toggle-group">
                <div class="toggle-item">
                  <span>{{ $t('common.show_online_status') }}</span>
                  <label class="toggle-switch">
                    <input type="checkbox" v-model="privacy.showStatus" />
                    <span class="toggle-slider"></span>
                  </label>
                </div>
                <div class="toggle-item">
                  <span>{{ $t('common.allow_friend_requests') }}</span>
                  <label class="toggle-switch">
                    <input type="checkbox" v-model="privacy.allowFriendRequests" />
                    <span class="toggle-slider"></span>
                  </label>
                </div>
                <div class="toggle-item">
                  <span>{{ $t('common.show_email') }}</span>
                  <label class="toggle-switch">
                    <input type="checkbox" v-model="privacy.showEmail" />
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Security Tab -->
          <div v-if="activeTab === 'security'" class="settings-section">
            <h2>{{ $t('settings.security') }}</h2>
            <div class="settings-form">
              <div class="form-group">
                <label>{{ $t('settings.change_password') }}</label>
                <button class="btn-secondary" @click="changePassword">{{ $t('settings.change_password') }}</button>
              </div>
              <div class="form-group">
                <label>{{ $t('settings.two_factor_auth') }}</label>
                <label class="toggle-switch">
                  <input type="checkbox" v-model="security.twoFactor" />
                  <span class="toggle-slider"></span>
                </label>
              </div>
              <div class="form-group danger-group">
                <button class="btn-danger" @click="deleteAccount">{{ $t('settings.delete_account') }}</button>
              </div>
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
import Navbar from '../components/Navbar.vue';
import Sidebar from '../components/Sidebar.vue';

export default {
  name: 'SettingsView',
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

    const tabs = [
      { id: 'profile', label: 'Profile' },
      { id: 'appearance', label: 'Appearance' },
      { id: 'language', label: 'Language' },
      { id: 'notifications', label: 'Notifications' },
      { id: 'privacy', label: 'Privacy' },
      { id: 'security', label: 'Security' }
    ];

    const activeTab = ref('profile');
    const selectedTheme = ref('light');
    const selectedFontSize = ref('medium');
    const selectedLanguage = ref('en');

    const themes = [
      { id: 'light', label: 'Light', icon: '☀️' },
      { id: 'dark', label: 'Dark', icon: '🌙' },
      { id: 'auto', label: 'Auto', icon: '🔄' }
    ];

    const fontSizes = [
      { id: 'small', label: 'Small' },
      { id: 'medium', label: 'Medium' },
      { id: 'large', label: 'Large' }
    ];

    const languages = [
      { code: 'en', name: 'English' },
      { code: 'de', name: 'German' }
    ];

    const profile = ref({
      username: currentUser?.username || '',
      email: '',
      avatar_url: ''
    });

    const settings = ref({
      notifications: true,
      sounds: true,
      desktop: false
    });

    const privacy = ref({
      showStatus: true,
      allowFriendRequests: true,
      showEmail: false
    });

    const security = ref({
      twoFactor: false
    });

    const goBack = () => {
      // Navigate back
      console.log('Go back');
    };

    const saveProfile = () => {
      alert('Profile saved');
    };

    const changePassword = () => {
      alert('Change password');
    };

    const deleteAccount = () => {
      if (confirm('Are you sure you want to delete your account?')) {
        alert('Account deletion initiated');
      }
    };

    const changeLanguage = (code) => {
      selectedLanguage.value = code;
      alert('Language changed');
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
      tabs,
      activeTab,
      selectedTheme,
      selectedFontSize,
      selectedLanguage,
      themes,
      fontSizes,
      languages,
      profile,
      settings,
      privacy,
      security,
      goBack,
      saveProfile,
      changePassword,
      deleteAccount,
      changeLanguage,
      handleVoiceAction
    };
  }
};
</script>

<style scoped>
.settings-view {
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

.settings-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.settings-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
}

.back-btn {
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
}

.back-btn:hover {
  background: #e2e8f0;
  color: #334155;
}

.settings-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
}

.settings-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 32px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.tab-btn {
  padding: 10px 20px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: #a0aec0;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.tab-btn:hover {
  color: #4a5568;
  background: #f8fafc;
  border-radius: 6px;
}

.tab-btn.active {
  color: #5865f2;
  border-bottom-color: #5865f2;
  background: #eef2ff;
}

.settings-body {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.settings-section {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 32px;
}

.settings-section h2 {
  font-size: 20px;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.form-group input,
.form-group textarea {
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

.theme-options,
.font-size-options,
.language-options {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.theme-btn,
.font-btn,
.lang-btn {
  padding: 12px 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #475569;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.theme-btn:hover,
.font-btn:hover,
.lang-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.theme-btn.active {
  background: #eef2ff;
  border-color: #5865f2;
  color: #5865f2;
}

.font-btn.active,
.lang-btn.active {
  background: #eef2ff;
  border-color: #5865f2;
  color: #5865f2;
}

.theme-icon {
  font-size: 20px;
}

.active-badge {
  background: #5865f2;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 12px;
  font-weight: 700;
  margin-left: 6px;
}

.toggle-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.toggle-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
}

.toggle-item:last-child {
  border-bottom: none;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #cbd5e1;
  transition: 0.2s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.2s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: #5865f2;
}

input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

.btn-primary {
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

.btn-primary:hover {
  background: #4752c4;
}

.btn-secondary {
  padding: 12px 24px;
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

.btn-danger {
  padding: 12px 24px;
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-danger:hover {
  background: #fecaca;
}

.danger-group {
  padding-top: 20px;
  border-top: 1px solid #f1f5f9;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }

  .settings-view {
    flex-direction: column;
  }

  .settings-content {
    padding: 16px;
  }

  .settings-section {
    padding: 20px;
  }
}
</style>