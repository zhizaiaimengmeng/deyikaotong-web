<template>
  <div class="level-courses">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">{{ currentLevel }} 级别课程</h1>
      <p class="page-subtitle">选择您想要练习的技能</p>
    </div>

    <!-- 技能卡片网格 -->
    <div class="skills-grid">
      <div class="skill-card" @click="goToSkill('listening')">
        <div class="skill-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
            <path
              d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"
            ></path>
          </svg>
        </div>
        <div class="skill-content">
          <h3>听力训练</h3>
          <p>提高德语听力理解能力</p>
        </div>
      </div>

      <div class="skill-card" @click="goToSkill('reading')">
        <div class="skill-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
          </svg>
        </div>
        <div class="skill-content">
          <h3>阅读训练</h3>
          <p>提升德语阅读理解能力</p>
        </div>
      </div>

      <div class="skill-card" @click="goToSkill('writing')">
        <div class="skill-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
            <path d="M2 2l7.586 7.586"></path>
            <circle cx="11" cy="11" r="2"></circle>
          </svg>
        </div>
        <div class="skill-content">
          <h3>写作训练</h3>
          <p>练习德语书面表达</p>
        </div>
      </div>

      <div class="skill-card" @click="goToSkill('speaking')">
        <div class="skill-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M17 8h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"></path>
            <path d="M7 8H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path>
            <line x1="12" y1="6" x2="12" y2="18"></line>
            <line x1="9" y1="12" x2="15" y2="12"></line>
          </svg>
        </div>
        <div class="skill-content">
          <h3>口语训练</h3>
          <p>提高德语口语交流能力</p>
        </div>
      </div>
    </div>

    <!-- 底部操作按钮 -->
    <div class="action-section">
      <button class="action-btn" @click="$router.push('/levels')">
        返回级别选择
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "LevelCourses",
  props: {
    level: {
      type: String,
      default: "A1",
    },
  },
  computed: {
    currentLevel() {
      return this.level || this.$route.params.level || "A1";
    },
  },
  methods: {
    goToSkill(skill) {
      // 使用路由名称而不是路径进行导航
      const routes = {
        listening: "ListeningList",
        reading: "ReadingList",
        writing: "WritingList",
        speaking: "SpeakingList",
      };
      // 确保路由存在
      if (routes[skill]) {
        this.$router.push({
          name: routes[skill],
          params: {
            level: this.currentLevel,
          },
        });
      } else {
        console.error(`未找到技能 ${skill} 的路由`);
      }
    },
  },
};
</script>

<style scoped>
.level-courses {
  min-height: 100vh;
  padding: 2rem;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
}

/* 页面标题 */
.page-header {
  text-align: center;
  margin-bottom: 3rem;
  padding-top: 1rem;
}

.page-title {
  font-size: 2.2rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #718096;
}

/* 技能网格 */
.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  max-width: 900px;
  margin: 0 auto;
}

/* 技能卡片 */
.skill-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

.skill-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.skill-icon {
  width: 48px;
  height: 48px;
  margin-right: 1.5rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f7fafc;
  border-radius: 10px;
  color: #4f46e5;
}

.skill-icon svg {
  width: 24px;
  height: 24px;
}

.skill-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.skill-content p {
  color: #718096;
  font-size: 0.95rem;
}

/* 操作区域 */
.action-section {
  margin-top: 3rem;
  text-align: center;
}

.action-btn {
  padding: 0.75rem 1.5rem;
  background: transparent;
  color: #4f46e5;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .level-courses {
    padding: 1.5rem;
  }

  .page-title {
    font-size: 1.8rem;
  }

  .skills-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .skill-card {
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.6rem;
  }

  .skill-icon {
    width: 40px;
    height: 40px;
    margin-right: 1rem;
  }

  .skill-icon svg {
    width: 20px;
    height: 20px;
  }

  .skill-content h3 {
    font-size: 1.1rem;
  }
}
</style>