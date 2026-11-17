<template>
  <nav class="navbar">
    <div class="navbar-brand">
      <div class="logo">💬</div>
      <span class="app-name">{{ $t('app.title') }}</span>
    </div>

    <div class="navbar-search">
      <input type="text" class="search-input" placeholder="{{ $t('common.search') }}" />
      <i class="fas fa-search search-icon"></i>
    </div>

    <div class="navbar-user">
      <button class="user-menu-btn" @click="toggleUserMenu">
        <div class="user-avatar">{{ currentUser?.username?.charAt(0).toUpperCase() || '?' }}</div>
        <span class="username">{{ currentUser?.username || 'User' }}</span>
        <i class="fas fa-chevron-down"></i>
      </button>

      <div class="user-dropdown" v-if="showUserMenu">
        <div class="dropdown-item" @click="goToSettings">
          <i class="fas fa-cog"></i> {{ $t('settings.title') }}
        </div>
        <div class="dropdown-item danger" @click="logout">
          <i class="fas fa-sign-out-alt"></i> {{ $t('auth.logout') }}
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { computed } from 'vue';
import { useAuthStore } from '../store/auth';
import { useRouter } from 'vue-router';

export default {
  name: 'Navbar',
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();
    const showUserMenu = ref(false);

    const currentUser = computed(() => authStore.user);

    const toggleUserMenu = () => {
      showUserMenu.value = !showUserMenu.value;
    };

    const goToSettings = () => {
      router.push({ name: 'Settings' });
      showUserMenu.value = false;
    };

    const logout = () => {
      authStore.logout();
      router.push({ name: 'Login' });
      showUserMenu.value = false;
    };

    return {
      currentUser,
      showUserMenu,
      toggleUserMenu,
      goToSettings,
      logout
    };
  }
};
</script>

<style scoped>
.navbar {
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  height: 64px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.logo {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #5865f2, #4752c4);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.app-name {
  font-weight: 700;
  font-size: 20px;
  color: #2c3e50;
  letter-spacing: -0.5px;
}

.navbar-search {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8f9fa;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 6px 12px;
}

.search-input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  color: #4a5568;
  width: 200px;
}

.search-icon {
  color: #a0aec0;
}

.navbar-user {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-menu-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background 0.2s;
}

.user-menu-btn:hover {
  background: #f1f5f9;
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: #5865f2;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

.username {
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
}

.user-dropdown {
  position: absolute;
  top: 64px;
  right: 24px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 200px;
  z-index: 200;
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid #f1f5f9;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  background: #f8fafc;
}

.dropdown-item i {
  width: 20px;
  color: #64748b;
}

.dropdown-item.danger i {
  color: #ef4444;
}

.dropdown-item.danger:hover {
  color: #ef4444;
  background: #fef2f2;
}
</style>