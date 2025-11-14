<template>
  <nav class="app-header" :class="{ scrolled: isScrolled }">
    <div class="header-container">
      <!-- Logo 区域 -->
      <div class="logo-section">
        <router-link to="/" class="logo-link">
          <span class="logo-icon">🇩🇪</span>
          <span class="logo-text">
            <span class="brand-name">德易考通</span>
            <span class="brand-subtitle">德语考试平台</span>
          </span>
        </router-link>
      </div>

      <!-- 导航菜单 -->
      <ul class="nav-menu">
        <li v-for="item in menuItems" :key="item.path" class="nav-item">
          <router-link
            :to="item.path"
            class="nav-link"
            :class="{ active: $route.path === item.path }"
          >
            {{ item.name }}
          </router-link>
        </li>
      </ul>

      <!-- 用户操作区域 -->
      <div class="user-actions">
        <!-- 未登录状态 -->
        <div v-if="!token" class="auth-buttons">
          <button class="btn-secondary" @click="$router.push('/login')">
            登录
          </button>
          <button class="btn-primary" @click="$router.push('/register')">
            开始学习
          </button>
        </div>

        <!-- 已登录状态 -->
        <div v-else class="user-info">
          <el-dropdown @command="handleCommand" class="user-dropdown">
            <span class="el-dropdown-link">
              <div class="user-avatar">
                <img
                  v-if="avatar"
                  :src="avatar"
                  alt="用户头像"
                  class="avatar-img"
                />
                <i v-else class="el-icon-user-solid"></i>
              </div>
              <span class="username">{{ name || "用户" }}</span>
              <i class="el-icon-arrow-down el-icon--right"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="profile">
                <i class="el-icon-user"></i> 个人中心
              </el-dropdown-item>
              <el-dropdown-item command="progress">
                <i class="el-icon-data-line"></i> 学习进度
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <i class="el-icon-switch-button"></i> 退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "AppHeader",
  data() {
    return {
      isScrolled: false,
      menuItems: [
        { path: "/", name: "首页" },
        { path: "/levels", name: "课程级别" },
        { path: "/skills", name: "技能训练" },
        { path: "/exams", name: "模拟考试" },
        { path: "/resources", name: "学习资源" },
      ],
    };
  },
  computed: {
    ...mapGetters(["token", "avatar", "name", "introduction", "roles"]),
  },
  mounted() {
    window.addEventListener("scroll", this.handleScroll);
  },
  beforeDestroy() {
    window.removeEventListener("scroll", this.handleScroll);
  },
  methods: {
    handleScroll() {
      this.isScrolled = window.scrollY > 20;
    },

    // 处理下拉菜单命令
    handleCommand(command) {
      switch (command) {
        case "profile":
          this.$router.push("/profile");
          break;
        case "progress":
          this.$router.push("/progress");
          break;
        case "logout":
          this.handleLogout();
          break;
      }
    },

    // 处理退出登录
    async handleLogout() {
      try {
        await this.$confirm("确定要退出登录吗？", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        });

        // 调用退出登录 action
        await this.$store.dispatch("user/logout");

        // 清除本地存储
        localStorage.removeItem("token");
        sessionStorage.clear();

        this.$message({
          message: "退出登录成功",
          type: "success",
          duration: 2000,
        });

        // 跳转到首页
        this.$router.push("/");
      } catch (error) {
        if (error !== "cancel") {
          console.error("退出登录失败:", error);
          this.$message.error("退出登录失败");
        }
      }
    },
  },
};
</script>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 70px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(229, 231, 235, 0.8);
  z-index: 1000;
  transition: all 0.3s ease;
}

.app-header.scrolled {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 100%;
  height: 100%;
  margin: 0 auto;
  padding: 0 2rem;
}

.logo-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  gap: 12px;
}

.logo-icon {
  font-size: 28px;
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.brand-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #4f46e5;
  line-height: 1.2;
}

.brand-subtitle {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 400;
}

.nav-menu {
  display: flex;
  list-style: none;
  gap: 2rem;
}

.nav-link {
  text-decoration: none;
  color: #4b5563;
  font-weight: 500;
  padding: 8px 0;
  position: relative;
  transition: color 0.2s ease;
}

.nav-link:hover {
  color: #4f46e5;
}

.nav-link.active {
  color: #4f46e5;
}

.nav-link.active::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #4f46e5;
  border-radius: 2px;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.auth-buttons {
  display: flex;
  gap: 0.75rem;
}

.btn-primary,
.btn-secondary {
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-primary {
  background: #4f46e5;
  color: white;
}

.btn-primary:hover {
  background: #4338ca;
  transform: translateY(-1px);
}

.btn-secondary {
  background: transparent;
  color: #4f46e5;
  border: 1px solid #e5e7eb;
}

.btn-secondary:hover {
  background: #f9fafb;
  border-color: #4f46e5;
}

/* 用户信息样式 */
.user-info {
  display: flex;
  align-items: center;
}

.user-dropdown {
  cursor: pointer;
}

.el-dropdown-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background-color 0.3s;
}

.el-dropdown-link:hover {
  background-color: #f5f5f5;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.username {
  font-weight: 500;
  color: #374151;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-container {
    padding: 0 1rem;
  }

  .brand-subtitle {
    display: none;
  }

  .nav-menu {
    gap: 1.5rem;
  }

  .username {
    display: none;
  }
}

@media (max-width: 640px) {
  .nav-menu {
    display: none;
  }

  .auth-buttons {
    flex-direction: column;
    gap: 0.5rem;
  }

  .btn-primary,
  .btn-secondary {
    padding: 6px 12px;
    font-size: 0.8rem;
  }
}
</style>