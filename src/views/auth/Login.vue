<template>
  <div class="login-container">
    <!-- 登录内容区域 -->
    <div class="login-content">
      <div class="login-card">
        <div class="login-header">
          <h1>欢迎回来</h1>
          <p>登录您的德易考通账户</p>
        </div>

        <form class="login-form" @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="username">邮箱/手机号</label>
            <input
              type="text"
              id="username"
              v-model="loginForm.username"
              placeholder="请输入您的邮箱或手机号"
              required
              :class="{ error: errors.username }"
            />
            <span class="error-message" v-if="errors.username">{{
              errors.username
            }}</span>
          </div>

          <div class="form-group">
            <label for="password">密码</label>
            <input
              type="password"
              id="password"
              v-model="loginForm.password"
              placeholder="请输入您的密码"
              required
              :class="{ error: errors.password }"
            />
            <span class="error-message" v-if="errors.password">{{
              errors.password
            }}</span>
          </div>

          <div class="form-options">
            <div class="remember-me">
              <input
                type="checkbox"
                id="remember"
                v-model="loginForm.rememberMe"
              />
              <label for="remember">记住我</label>
            </div>
            <router-link to="/forgot-password" class="forgot-password"
              >忘记密码？</router-link
            >
          </div>

          <button type="submit" class="btn-login" :disabled="loading">
            <span v-if="loading">登录中...</span>
            <span v-else>登录</span>
          </button>
        </form>

        <div class="signup-link">
          还没有账户？ <router-link to="/register">立即注册</router-link>
        </div>
      </div>

      <!-- 平台介绍 -->
      <div class="platform-intro">
        <div class="intro-content">
          <h2>德易考通德语学习平台</h2>
          <p class="intro-subtitle">专业的A1-B2级别德语考试在线学习平台</p>
          <div class="features">
            <div class="feature">
              <i class="fas fa-headphones"></i>
              <div class="feature-text">
                <h3>听力训练</h3>
                <p>多种场景听力练习，提升听力理解能力</p>
              </div>
            </div>
            <div class="feature">
              <i class="fas fa-book"></i>
              <div class="feature-text">
                <h3>阅读练习</h3>
                <p>分级阅读材料，提高阅读理解能力</p>
              </div>
            </div>
            <div class="feature">
              <i class="fas fa-microphone"></i>
              <div class="feature-text">
                <h3>口语训练</h3>
                <p>模拟真实对话场景，提升口语表达能力</p>
              </div>
            </div>
            <div class="feature">
              <i class="fas fa-pencil-alt"></i>
              <div class="feature-text">
                <h3>写作指导</h3>
                <p>专业写作指导，提高书面表达能力</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Login",
  data() {
    return {
      loginForm: {
        username: "",
        password: "",
        rememberMe: false,
      },
      errors: {
        username: "",
        password: "",
      },
      loading: false,
    };
  },
  mounted() {
    // 检查 store 是否可用
    this.checkStoreAvailability();
  },
  methods: {
    checkStoreAvailability() {
      console.log("Store available:", !!this.$store);
      if (!this.$store) {
        console.error("Store 未正确注入到组件中");
        // 可以添加更详细的调试信息
        console.log("Vue instance:", this.$root);
      }
    },

    validateForm() {
      this.errors = { username: "", password: "" };
      let isValid = true;

      if (!this.loginForm.username) {
        this.errors.username = "请输入邮箱或手机号";
        isValid = false;
      } else if (!this.isValidUsername(this.loginForm.username)) {
        this.errors.username = "请输入有效的邮箱地址或手机号";
        isValid = false;
      }

      if (!this.loginForm.password) {
        this.errors.password = "请输入密码";
        isValid = false;
      } else if (this.loginForm.password.length < 6) {
        this.errors.password = "密码长度至少为6位";
        isValid = false;
      }

      return isValid;
    },

    isValidUsername(username) {
      const emailRegex =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      const phoneRegex = /^1[3-9]\d{9}$/;

      return emailRegex.test(username) || phoneRegex.test(username);
    },

    // 在 Login.vue 的 methods 中修改 handleLogin 方法
    async handleLogin() {
      // if (!this.validateForm()) {
      //   return;
      // }

      this.loading = true;

      try {
        // 使用模块化的 action
        await this.$store.dispatch("user/login", this.loginForm);
        await this.$store.dispatch("user/getInfo");

        sessionStorage.setItem("username", this.loginForm.username);

        this.$message({
          message: "登录成功！欢迎回到德易考通！",
          type: "success",
          duration: 3000,
        });

        await this.safeRouterPush();
      } catch (error) {
        this.$message({
          message: error.message || "登录失败，请检查您的凭据",
          type: "error",
          duration: 5000,
        });
      } finally {
        this.loading = false;
      }
    },

    async safeRouterPush() {
      try {
        const redirect = this.$route.query.redirect || "/";

        // 避免重复导航
        if (this.$route.path !== redirect) {
          await this.$router.push(redirect);
        }
      } catch (error) {
        // 忽略重复导航错误
        if (error.name !== "NavigationDuplicated") {
          console.error("路由跳转错误:", error);
        }
      }
    },
  },
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

/* 登录内容区域 */
.login-content {
  display: flex;
  max-width: 1000px;
  width: 100%;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.login-card {
  flex: 1;
  padding: 3rem;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h1 {
  font-size: 2rem;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.login-header p {
  color: #64748b;
}

.login-form {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #374151;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #0284c7;
  box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.1);
}

.form-group input.error {
  border-color: #ef4444;
}

.error-message {
  display: block;
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.remember-me {
  display: flex;
  align-items: center;
}

.remember-me input {
  margin-right: 0.5rem;
}

.remember-me label {
  margin-bottom: 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.forgot-password {
  color: #0284c7;
  text-decoration: none;
  font-size: 0.875rem;
}

.forgot-password:hover {
  text-decoration: underline;
}

.btn-login {
  width: 100%;
  padding: 0.75rem;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 1.5rem;
}

.btn-login:hover:not(:disabled) {
  background: #0369a1;
  transform: translateY(-1px);
}

.btn-login:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.signup-link {
  text-align: center;
  color: #6b7280;
  font-size: 0.875rem;
}

.signup-link a {
  color: #0284c7;
  text-decoration: none;
  font-weight: 500;
}

.signup-link a:hover {
  text-decoration: underline;
}

/* 平台介绍区域 */
.platform-intro {
  flex: 1;
  background: linear-gradient(135deg, #e2e0e7 0%, #4f46e5 100%);
  color: white;
  padding: 3rem;
  display: flex;
  align-items: center;
}

.intro-content h2 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.intro-subtitle {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.features {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.feature {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.feature i {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.feature-text h3 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.feature-text p {
  opacity: 0.9;
  line-height: 1.5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-container {
    padding: 1rem;
  }

  .login-content {
    flex-direction: column;
    max-width: 400px;
  }

  .login-card {
    max-width: 100%;
    padding: 2rem;
  }

  .platform-intro {
    padding: 2rem;
    text-align: center;
  }

  .intro-content h2 {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .login-card {
    padding: 1.5rem;
  }

  .platform-intro {
    padding: 1.5rem;
  }

  .form-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>