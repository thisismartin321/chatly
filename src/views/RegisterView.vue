<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <div class="logo">💬</div>
        <h1>{{ $t('app.title') }}</h1>
        <p>{{ $t('auth.register') }}</p>
      </div>

      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label>{{ $t('auth.username') }}</label>
          <input
            v-model="userData.username"
            type="text"
            placeholder="Choose a username (3-20 chars)"
            required
            maxlength="20"
          />
        </div>

        <div class="form-group">
          <label>{{ $t('auth.password') }}</label>
          <input
            v-model="userData.password"
            type="password"
            placeholder="Create a password (min 8 chars)"
            required
            minlength="8"
          />
        </div>

        <div class="form-group">
          <label>{{ $t('auth.email') }}</label>
          <input
            v-model="userData.email"
            type="email"
            placeholder="Enter your email"
            required
          />
        </div>

        <div class="form-group">
          <label>{{ $t('auth.invite_code') }}</label>
          <input
            v-model="userData.inviteCode"
            type="text"
            placeholder="Invite code"
            required
          />
        </div>

        <button type="submit" class="btn-primary btn-register" :disabled="isLoading">
          {{ isLoading ? $t('common.loading') : $t('auth.register_button') }}
        </button>
      </form>

      <div class="auth-footer">
        <span>{{ $t('auth.have_account') }}</span>
        <router-link :to="{ name: 'Login' }">{{ $t('auth.login') }}</router-link>
      </div>

      <div v-if="error" class="error-message">{{ error }}</div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useAuthStore } from '../store/auth';

export default {
  name: 'RegisterView',
  setup() {
    const authStore = useAuthStore();
    const userData = ref({
      username: '',
      password: '',
      email: '',
      inviteCode: ''
    });
    const isLoading = ref(false);
    const error = ref(null);

    const handleRegister = async () => {
      isLoading.value = true;
      error.value = null;

      // Basic validation
      if (!userData.value.username || !userData.value.password || !userData.value.inviteCode) {
        error.value = 'Please fill in all required fields';
        isLoading.value = false;
        return;
      }

      if (userData.value.password.length < 8) {
        error.value = 'Password must be at least 8 characters';
        isLoading.value = false;
        return;
      }

      try {
        const result = await authStore.register(userData.value);
        if (result.success) {
          // Redirect handled by router guard
        } else {
          error.value = result.error || $t('auth.registration_error');
        }
      } catch (err) {
        error.value = err.message || $t('errors.network_error');
      } finally {
        isLoading.value = false;
      }
    };

    return {
      userData,
      isLoading,
      error,
      handleRegister,
      $t: (key) => key
    };
  }
};
</script>

<style scoped>
.auth-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #5865f2 0%, #4752c4 100%);
  padding: 20px;
}

.auth-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 40px;
  width: 100%;
  max-width: 400px;
}

.auth-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  width: 48px;
  height: 48px;
  background: white;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.auth-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 8px;
  letter-spacing: -0.5px;
}

.auth-header p {
  color: #64748b;
  font-size: 16px;
  margin: 0;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.form-group input {
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #5865f2;
  box-shadow: 0 0 0 3px rgba(88, 101, 242, 0.1);
}

.btn-primary {
  padding: 12px 24px;
  background: #5865f2;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 8px;
}

.btn-primary:hover:not(:disabled) {
  background: #4752c4;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-register {
  margin-top: 24px;
}

.auth-footer {
  margin-top: 24px;
  text-align: center;
  font-size: 14px;
  color: #6b7280;
}

.auth-footer span {
  color: #6b7280;
}

.auth-footer a {
  color: #5865f2;
  text-decoration: none;
  font-weight: 600;
}

.auth-footer a:hover {
  text-decoration: underline;
}

.error-message {
  margin-top: 16px;
  padding: 12px;
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 14px;
  text-align: center;
}

@media (max-width: 480px) {
  .auth-card {
    padding: 32px 24px;
  }

  .auth-header h1 {
    font-size: 28px;
  }
}
</style>