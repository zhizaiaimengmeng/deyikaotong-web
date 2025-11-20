<template>
  <div class="profile-container">
    <!-- 页面头部 -->
    <div class="profile-header">
      <div class="header-content">
        <h1>个人中心</h1>
        <p>管理您的学习资料和进度</p>
      </div>
    </div>

    <div class="profile-content">
      <!-- 左侧导航菜单 -->
      <div class="profile-sidebar">
        <el-menu
          :default-active="activeMenu"
          class="profile-menu"
          @select="handleMenuSelect"
        >
          <el-menu-item index="overview">
            <i class="el-icon-user"></i>
            <span>个人信息</span>
          </el-menu-item>
          <el-menu-item index="progress">
            <i class="el-icon-data-line"></i>
            <span>学习进度</span>
          </el-menu-item>
          <el-menu-item index="courses">
            <i class="el-icon-notebook-2"></i>
            <span>我的课程</span>
          </el-menu-item>
          <el-menu-item index="achievements">
            <i class="el-icon-medal"></i>
            <span>学习成就</span>
          </el-menu-item>
          <el-menu-item index="settings">
            <i class="el-icon-setting"></i>
            <span>账户设置</span>
          </el-menu-item>
        </el-menu>
      </div>

      <!-- 右侧内容区域 -->
      <div class="profile-main">
        <!-- 个人信息概览 -->
        <div v-if="activeMenu === 'overview'" class="overview-section">
          <el-card class="user-info-card">
            <div class="user-header">
              <div class="avatar-section">
                <div class="user-avatar">
                  <img
                    v-if="userInfo.avatar"
                    :src="userInfo.avatar"
                    alt="头像"
                  />
                  <i v-else class="el-icon-user-solid"></i>
                </div>
                <div class="user-details">
                  <h2>{{ userInfo.name || "用户" }}</h2>
                  <p class="user-level">
                    当前级别：{{ userInfo.level || "A1" }}
                  </p>
                  <p class="join-date">
                    加入时间：{{ userInfo.joinDate || "2024年1月" }}
                  </p>
                </div>
              </div>
              <!-- <el-button
                type="primary"
                icon="el-icon-edit"
                @click="editProfile"
              >
                编辑资料
              </el-button> -->
            </div>

            <el-divider></el-divider>

            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-number">
                  {{ learningStats.totalHours || 0 }}
                </div>
                <div class="stat-label">学习时长(小时)</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">
                  {{ learningStats.completedCourses || 0 }}
                </div>
                <div class="stat-label">完成课程</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">
                  {{ learningStats.correctRate || "0%" }}
                </div>
                <div class="stat-label">平均正确率</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">
                  {{ learningStats.streakDays || 0 }}
                </div>
                <div class="stat-label">连续学习天数</div>
              </div>
            </div>
          </el-card>

          <!-- 最近活动 -->
          <el-card class="recent-activities">
            <template #header>
              <span>最近学习活动</span>
            </template>
            <div class="activities-list">
              <div
                v-for="activity in recentActivities"
                :key="activity.id"
                class="activity-item"
              >
                <i :class="activity.icon"></i>
                <div class="activity-content">
                  <p class="activity-title">{{ activity.title }}</p>
                  <p class="activity-time">{{ activity.time }}</p>
                </div>
                <el-tag :type="activity.type">{{ activity.status }}</el-tag>
              </div>
            </div>
          </el-card>
        </div>

        <!-- 学习进度 -->
        <div v-if="activeMenu === 'progress'" class="progress-section">
          <el-card>
            <template #header>
              <span>学习进度总览</span>
            </template>
            <div class="progress-charts">
              <div class="chart-container">
                <h3>各级别完成情况</h3>
                <div class="level-progress">
                  <div
                    v-for="level in levelProgress"
                    :key="level.name"
                    class="level-item"
                  >
                    <span class="level-name">{{ level.name }}</span>
                    <el-progress
                      :percentage="level.percentage"
                      :status="level.status"
                      :stroke-width="8"
                    ></el-progress>
                    <span class="level-percent">{{ level.percentage }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </div>

        <!-- 我的课程 -->
        <div v-if="activeMenu === 'courses'" class="courses-section">
          <el-card>
            <template #header>
              <span>我的课程</span>
            </template>
            <div class="courses-grid">
              <el-card
                v-for="course in userCourses"
                :key="course.id"
                class="course-card"
              >
                <div class="course-header">
                  <span class="course-level">{{ course.level }}</span>
                  <el-tag
                    :type="course.status === '进行中' ? 'primary' : 'success'"
                  >
                    {{ course.status }}
                  </el-tag>
                </div>
                <h3>{{ course.title }}</h3>
                <p>{{ course.description }}</p>
                <el-progress :percentage="course.progress"></el-progress>
                <div class="course-actions">
                  <el-button type="primary" size="small">继续学习</el-button>
                  <el-button size="small">查看详情</el-button>
                </div>
              </el-card>
            </div>
          </el-card>
        </div>

        <!-- 学习成就 -->
        <div v-if="activeMenu === 'achievements'" class="achievements-section">
          <el-card>
            <template #header>
              <span>学习成就</span>
            </template>
            <div class="achievements-grid">
              <div
                v-for="achievement in achievements"
                :key="achievement.id"
                class="achievement-item"
                :class="{ unlocked: achievement.unlocked }"
              >
                <div class="achievement-icon">
                  <i :class="achievement.icon"></i>
                </div>
                <div class="achievement-info">
                  <h4>{{ achievement.title }}</h4>
                  <p>{{ achievement.description }}</p>
                  <span class="achievement-date" v-if="achievement.unlocked">
                    获得时间：{{ achievement.date }}
                  </span>
                </div>
              </div>
            </div>
          </el-card>
        </div>

        <!-- 账户设置 -->
        <div v-if="activeMenu === 'settings'" class="settings-section">
          <el-card>
            <template #header>
              <span>账户设置</span>
            </template>
            <el-form :model="settingsForm" label-width="120px">
              <el-form-item label="用户名">
                <el-input v-model="settingsForm.username"></el-input>
              </el-form-item>
              <el-form-item label="用户姓名">
                <el-input v-model="settingsForm.name"></el-input>
              </el-form-item>
              <!-- <el-form-item label="邮箱地址">
                <el-input v-model="settingsForm.email"></el-input>
              </el-form-item> -->
              <el-form-item label="手机号码">
                <el-input v-model="settingsForm.mobile"></el-input>
              </el-form-item>
              <!-- <el-form-item label="学习目标">
                <el-select
                  v-model="settingsForm.learningGoal"
                  placeholder="请选择学习目标"
                >
                  <el-option label="通过A1考试" value="A1"></el-option>
                  <el-option label="通过A2考试" value="A2"></el-option>
                  <el-option label="通过B1考试" value="B1"></el-option>
                  <el-option label="通过B2考试" value="B2"></el-option>
                </el-select>
              </el-form-item> -->
              <!-- <el-form-item label="通知设置">
                <el-checkbox-group v-model="settingsForm.notifications">
                  <el-checkbox label="学习提醒"></el-checkbox>
                  <el-checkbox label="课程更新"></el-checkbox>
                  <el-checkbox label="系统消息"></el-checkbox>
                </el-checkbox-group>
              </el-form-item> -->
              <el-form-item>
                <el-button type="primary" @click="saveSettings"
                  >保存设置</el-button
                >
                <!-- <el-button @click="resetSettings">重置</el-button> -->
              </el-form-item>
            </el-form>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { updateUser } from "@/api/organization/user";

import { getInfo } from "@/api/user";
export default {
  name: "Profile",
  data() {
    return {
      activeMenu: "overview",
      userInfo: {
        name: "德语学习者",
        level: "A2",
        joinDate: "2024年1月15日",
      },
      learningStats: {
        totalHours: 48,
        completedCourses: 12,
        correctRate: "85%",
        streakDays: 7,
      },
      recentActivities: [
        {
          id: 1,
          icon: "el-icon-headphones",
          title: "完成了A1听力练习",
          time: "2小时前",
          type: "success",
          status: "已完成",
        },
        {
          id: 2,
          icon: "el-icon-notebook-2",
          title: "学习了新词汇",
          time: "今天 09:30",
          type: "primary",
          status: "进行中",
        },
      ],
      levelProgress: [
        { name: "A1", percentage: 100, status: "success" },
        { name: "A2", percentage: 75, status: "primary" },
        { name: "B1", percentage: 30, status: "warning" },
        { name: "B2", percentage: 0, status: "exception" },
      ],
      userCourses: [
        {
          id: 1,
          level: "A2",
          title: "日常对话训练",
          description: "掌握日常交流必备的德语表达",
          progress: 75,
          status: "进行中",
        },
      ],
      achievements: [
        {
          id: 1,
          icon: "el-icon-trophy",
          title: "学习先锋",
          description: "连续学习7天",
          unlocked: true,
          date: "2024-01-20",
        },
      ],
      settingsForm: {
        id: "",
        username: "",
        name: "",
        mobile: "",
        // email: "",
        // learningGoal: "B1",
        // notifications: ["学习提醒", "课程更新"],
      },
    };
  },
  mounted() {
    this.loadUserData();
  },
  methods: {
    handleMenuSelect(index) {
      this.activeMenu = index;
    },

    editProfile() {
      this.$message.info("编辑资料功能开发中");
    },

    saveSettings() {
      updateUser(this.settingsForm).then(() => {
        this.$message("设置已保存");
      });
    },

    resetSettings() {
      this.$message.info("设置已重置");
    },

    loadUserData() {
      debugger;
      // 这里可以调用API获取真实数据
      console.log("加载用户数据");
      var username = sessionStorage.getItem("username");
      getInfo(username).then((response) => {
        const userData = response.data;
        this.settingsForm.id = userData.id;
        this.settingsForm.username = userData.username;
        this.settingsForm.name = userData.name;
        this.settingsForm.mobile = userData.mobile;
        this.userInfo.name = userData.name;
      });
    },
  },
};
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background: #f5f7fa;
}

.profile-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem 0;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.header-content h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.header-content p {
  opacity: 0.9;
  font-size: 1.1rem;
}

.profile-content {
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  gap: 2rem;
}

.profile-sidebar {
  width: 250px;
  flex-shrink: 0;
}

.profile-menu {
  border-radius: 8px;
  background: white;
}

.profile-main {
  flex: 1;
  min-height: 600px;
}

/* 用户信息卡片样式 */
.user-info-card {
  margin-bottom: 1.5rem;
}

.user-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.user-details h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
}

.user-level {
  color: #667eea;
  font-weight: 500;
  margin: 0.25rem 0;
}

.join-date {
  color: #666;
  margin: 0.25rem 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-top: 1rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

/* 活动列表样式 */
.activities-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 0;
}

.activity-item i {
  font-size: 1.5rem;
  color: #667eea;
}

.activity-content {
  flex: 1;
}

.activity-title {
  margin: 0;
  font-weight: 500;
}

.activity-time {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

/* 进度条样式 */
.level-progress {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.level-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.level-name {
  width: 40px;
  font-weight: 500;
}

.level-percent {
  width: 50px;
  text-align: right;
  color: #666;
}

/* 课程网格样式 */
.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.course-card {
  transition: transform 0.3s;
}

.course-card:hover {
  transform: translateY(-2px);
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.course-level {
  font-weight: bold;
  color: #667eea;
}

.course-actions {
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
}

/* 成就网格样式 */
.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.achievement-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  opacity: 0.6;
  transition: all 0.3s;
}

.achievement-item.unlocked {
  opacity: 1;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.achievement-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.achievement-info h4 {
  margin: 0 0 0.5rem 0;
}

.achievement-info p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.achievement-date {
  font-size: 0.8rem;
  color: #999;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .profile-content {
    flex-direction: column;
    padding: 1rem;
  }

  .profile-sidebar {
    width: 100%;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .user-header {
    flex-direction: column;
    gap: 1rem;
  }

  .courses-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .header-content h1 {
    font-size: 2rem;
  }
}
</style>