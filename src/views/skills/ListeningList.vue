<template>
  <div class="listening-list">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">{{ currentLevel }} 听力训练</h1>
      <p class="page-subtitle">选择您想要练习的听力题目</p>
    </div>

    <!-- 练习列表 -->
    <div class="exercises-grid">
      <div
        v-for="exercise in exercises"
        :key="exercise.id"
        class="exercise-card"
        @click="selectExercise(exercise)"
      >
        <div class="exercise-header">
          <div class="exercise-icon">
            <i class="fas fa-headphones"></i>
          </div>
          <div class="exercise-info">
            <h3>{{ exercise.title }}</h3>
            <div class="exercise-meta">
              <span class="difficulty">{{ exercise.difficulty }}</span>
              <span class="duration">{{ exercise.duration }}</span>
              <span class="questions">{{ exercise.questions }} 个问题</span>
            </div>
          </div>
        </div>

        <div class="exercise-progress">
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: exercise.progress + '%' }"
            ></div>
          </div>
          <span class="progress-text">{{ exercise.progress }}% 完成</span>
        </div>

        <button class="start-btn">开始练习</button>
      </div>
    </div>

    <!-- 返回按钮 -->
    <div class="action-section">
      <button class="action-btn" @click="$router.push('/levels')">
        <i class="fas fa-arrow-left"></i> 返回级别选择
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "ListeningList",
  props: {
    level: {
      type: String,
      default: "A1",
    },
  },
  data() {
    return {
      exercises: [
        {
          id: 1,
          title: "日常对话理解",
          difficulty: "简单",
          duration: "10分钟",
          questions: 5,
          progress: 75,
        },
        {
          id: 2,
          title: "购物场景对话",
          difficulty: "中等",
          duration: "15分钟",
          questions: 6,
          progress: 50,
        },
        {
          id: 3,
          title: "餐厅点餐对话",
          difficulty: "中等",
          duration: "15分钟",
          questions: 7,
          progress: 25,
        },
        {
          id: 4,
          title: "问路与指示",
          difficulty: "较难",
          duration: "20分钟",
          questions: 8,
          progress: 0,
        },
      ],
    };
  },
  computed: {
    currentLevel() {
      return this.level || this.$route.params.level || "A1";
    },
  },
  methods: {
    selectExercise(exercise) {
      this.$router.push({
        name: "ListeningExercise",
        params: { exerciseId: exercise.id, level: this.currentLevel },
      });
    },
  },
};
</script>

<style scoped>
.listening-list {
  padding: 2rem;
  background-color: #f8fafc;
  min-height: 100vh;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1.2rem;
  color: #718096;
  max-width: 600px;
  margin: 0 auto;
}

.exercises-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  max-width: 1000px;
  margin: 0 auto 3rem;
}

.exercise-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
}

.exercise-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.exercise-header {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
}

.exercise-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: #e0f2fe;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  color: #0ea5e9;
  font-size: 1.5rem;
}

.exercise-info h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.exercise-meta {
  display: flex;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: #64748b;
}

.difficulty {
  padding: 0.25rem 0.5rem;
  background: #f1f5f9;
  border-radius: 4px;
}

.exercise-progress {
  margin-bottom: 1.5rem;
}

.progress-bar {
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: #0ea5e5;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.progress-text {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.start-btn {
  width: 100%;
  padding: 0.75rem;
  background: #0ea5e9;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
}

.start-btn:hover {
  background: #0284c7;
}

.action-section {
  text-align: center;
}

.action-btn {
  padding: 0.75rem 1.5rem;
  background: transparent;
  color: #0ea5e9;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.action-btn:hover {
  background: #f1f5f9;
  border-color: #0ea5e9;
}

@media (max-width: 768px) {
  .listening-list {
    padding: 1rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .exercises-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.75rem;
  }

  .exercise-header {
    flex-direction: column;
    text-align: center;
  }

  .exercise-icon {
    margin-right: 0;
    margin-bottom: 1rem;
  }
}
</style>