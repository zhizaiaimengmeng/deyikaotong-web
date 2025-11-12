<template>
  <div class="listening-layout">
    <!-- 丰富版页面标题区域 -->
    <div class="page-header rich">
      <div class="header-content">
        <div class="header-main">
          <div class="level-badge">{{ currentLevel }}</div>
          <h1 class="page-title">听力训练</h1>
          <p class="page-subtitle">选择练习分类，提升德语听力能力</p>
        </div>
        <div class="header-stats">
          <div class="stat-item">
            <div class="stat-value">{{ totalQuestions }}</div>
            <div class="stat-label">总题数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ overallProgress }}%</div>
            <div class="stat-label">完成度</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">
              {{ completedCategories }}/{{ totalCategories }}
            </div>
            <div class="stat-label">已学分类</div>
          </div>
        </div>
      </div>
      <div class="progress-container">
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: overallProgress + '%' }"
          ></div>
        </div>
        <div class="progress-text">{{ overallProgress }}% 完成</div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧练习分类 -->
      <div class="categories-sidebar">
        <div class="sidebar-header">
          <h3>练习分类</h3>
        </div>
        <div class="categories-list">
          <div
            v-for="category in categories"
            :key="category.id"
            class="category-item"
            :class="{ active: selectedCategoryId === category.id }"
            @click="selectCategory(category.id)"
          >
            <div class="category-icon">
              <i :class="category.icon"></i>
            </div>
            <div class="category-info">
              <h4>{{ category.name }}</h4>
              <p>{{ category.description }}</p>
            </div>
            <div class="category-progress">
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :style="{ width: category.progress + '%' }"
                ></div>
              </div>
              <span class="progress-text">{{ category.progress }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧题目列表 -->
      <div class="questions-main">
        <div class="questions-header">
          <h2>{{ selectedCategory?.name }}</h2>
          <div class="questions-stats">
            <span
              >{{ completedQuestions }}/{{
                filteredQuestions.length
              }}
              完成</span
            >
          </div>
        </div>

        <div class="questions-list">
          <div
            v-for="question in filteredQuestions"
            :key="question.id"
            class="question-item"
            @click="startQuestion(question.id)"
          >
            <div class="question-order">{{ question.order }}</div>

            <div class="question-content">
              <div class="question-main">
                <h3 class="question-title">{{ question.title }}</h3>
                <p class="question-desc">{{ question.description }}</p>
                <div class="question-meta">
                  <span class="meta-item">
                    <i class="fas fa-clock"></i>
                    {{ question.duration }}
                  </span>
                  <span class="difficulty-tag" :class="question.difficulty">
                    {{ getDifficultyText(question.difficulty) }}
                  </span>
                </div>
              </div>

              <div class="question-actions">
                <div
                  class="status-indicator"
                  :class="getStatusClass(question.status)"
                >
                  {{ getStatusText(question.status) }}
                </div>
                <button
                  class="start-btn"
                  @click.stop="startQuestion(question.id)"
                >
                  <i class="fas fa-play"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div class="empty-state" v-if="filteredQuestions.length === 0">
          <i class="fas fa-music empty-icon"></i>
          <h3>暂无题目</h3>
          <p>该分类下暂时没有可用的听力题目</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ListeningLayoutRich",
  props: {
    level: {
      type: String,
      default: "A1",
    },
  },
  data() {
    return {
      selectedCategoryId: 1,
      categories: [
        {
          id: 1,
          name: "天气预报理解",
          description: "听懂德语天气预报信息",
          icon: "fas fa-cloud-sun",
          progress: 100,
        },
        {
          id: 2,
          name: "日常对话理解",
          description: "日常问候和简单对话",
          icon: "fas fa-comments",
          progress: 75,
        },
        {
          id: 3,
          name: "购物场景对话",
          description: "购物常用表达和词汇",
          icon: "fas fa-shopping-cart",
          progress: 50,
        },
        {
          id: 4,
          name: "餐厅点餐对话",
          description: "餐厅点餐对话技巧",
          icon: "fas fa-utensils",
          progress: 25,
        },
        {
          id: 5,
          name: "问路与指示",
          description: "询问方向和路线指示",
          icon: "fas fa-map-signs",
          progress: 0,
        },
        {
          id: 6,
          name: "公共交通",
          description: "公交火车交通信息",
          icon: "fas fa-bus",
          progress: 30,
        },
      ],
      questions: [
        {
          id: 101,
          categoryId: 1,
          order: "01",
          title: "柏林天气预报",
          description: "收听柏林地区未来三天的天气情况",
          duration: "2分钟",
          difficulty: "medium",
          status: "completed",
        },
        {
          id: 102,
          categoryId: 1,
          order: "02",
          title: "慕尼黑天气预警",
          description: "理解慕尼黑地区的特殊天气预警信息",
          duration: "3分钟",
          difficulty: "hard",
          status: "in-progress",
        },
        {
          id: 103,
          categoryId: 1,
          order: "03",
          title: "全国天气概况",
          description: "了解德国主要城市的天气对比",
          duration: "4分钟",
          difficulty: "easy",
          status: "not-started",
        },
        {
          id: 201,
          categoryId: 2,
          order: "01",
          title: "早晨问候",
          description: "学习德语中常见的早晨问候方式",
          duration: "1分钟",
          difficulty: "easy",
          status: "completed",
        },
        {
          id: 202,
          categoryId: 2,
          order: "02",
          title: "家庭对话",
          description: "理解家庭成员间的日常交流",
          duration: "2分钟",
          difficulty: "medium",
          status: "in-progress",
        },
        {
          id: 301,
          categoryId: 3,
          order: "01",
          title: "超市购物",
          description: "在超市询问价格和购买商品",
          duration: "3分钟",
          difficulty: "medium",
          status: "not-started",
        },
        {
          id: 302,
          categoryId: 3,
          order: "02",
          title: "服装店试穿",
          description: "在服装店试穿和询问尺寸",
          duration: "2分钟",
          difficulty: "easy",
          status: "not-started",
        },
      ],
    };
  },
  computed: {
    currentLevel() {
      return this.level || this.$route.params.level || "A1";
    },
    selectedCategory() {
      return this.categories.find((cat) => cat.id === this.selectedCategoryId);
    },
    filteredQuestions() {
      return this.questions.filter(
        (q) => q.categoryId === this.selectedCategoryId
      );
    },
    completedQuestions() {
      return this.filteredQuestions.filter((q) => q.status === "completed")
        .length;
    },
    totalQuestions() {
      return this.questions.length;
    },
    totalCategories() {
      return this.categories.length;
    },
    completedCategories() {
      return this.categories.filter((cat) => cat.progress === 100).length;
    },
    overallProgress() {
      const totalProgress = this.categories.reduce(
        (sum, cat) => sum + cat.progress,
        0
      );
      return Math.round(totalProgress / this.categories.length);
    },
  },
  methods: {
    selectCategory(categoryId) {
      this.selectedCategoryId = categoryId;
    },
    startQuestion(questionId) {
      this.$router.push({
        name: "ListeningExercise",
        params: {
          questionId: questionId,
          level: this.currentLevel,
        },
      });
    },
    getDifficultyText(difficulty) {
      const map = {
        easy: "简单",
        medium: "中等",
        hard: "困难",
      };
      return map[difficulty] || "简单";
    },
    getStatusClass(status) {
      const map = {
        completed: "completed",
        "in-progress": "in-progress",
        "not-started": "not-started",
      };
      return map[status] || "not-started";
    },
    getStatusText(status) {
      const map = {
        completed: "已完成",
        "in-progress": "进行中",
        "not-started": "开始",
      };
      return map[status] || "开始";
    },
  },
};
</script>

<style scoped>
.listening-layout {
  padding: 1rem;
  background: #f8fafc;
  min-height: 100vh;
}

/* 丰富版页面标题区域样式 */
.page-header.rich {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  color: white;
  position: relative;
  overflow: hidden;
}

.page-header.rich::before {
  content: "";
  position: absolute;
  top: -50%;
  right: -20%;
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.page-header.rich::after {
  content: "";
  position: absolute;
  bottom: -30%;
  right: 10%;
  width: 120px;
  height: 120px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  z-index: 2;
  margin-bottom: 1rem;
}

.header-main {
  flex: 1;
}

.level-badge {
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  font-size: 0.875rem;
  opacity: 0.9;
  margin: 0;
  font-weight: 400;
}

.header-stats {
  display: flex;
  gap: 1.5rem;
  text-align: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  opacity: 0.8;
  font-weight: 500;
}

.progress-container {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 3px;
  transition: width 0.5s ease;
  box-shadow: 0 0 10px rgba(79, 172, 254, 0.5);
}

.progress-text {
  font-size: 0.8125rem;
  font-weight: 600;
  min-width: 60px;
  text-align: right;
}

/* 主要内容布局 */
.main-content {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* 左侧分类菜单 */
.categories-sidebar {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  overflow: hidden;
  height: fit-content;
}

.sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f7fafc;
}

.sidebar-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.categories-list {
  padding: 0.5rem;
}

.category-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  margin-bottom: 0.25rem;
}

.category-item:hover {
  background: #f7fafc;
}

.category-item.active {
  background: #ebf8ff;
  border: 1px solid #bee3f8;
}

.category-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: #e0f2fe;
  color: #0ea5e9;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
  flex-shrink: 0;
  font-size: 0.875rem;
}

.category-item.active .category-icon {
  background: #0ea5e9;
  color: white;
}

.category-info {
  flex: 1;
  min-width: 0;
}

.category-info h4 {
  font-size: 0.875rem;
  font-weight: 500;
  color: #2d3748;
  margin: 0 0 0.125rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.category-info p {
  font-size: 0.75rem;
  color: #718096;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.category-progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.category-progress .progress-bar {
  width: 40px;
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  overflow: hidden;
}

.category-progress .progress-fill {
  height: 100%;
  background: #0ea5e9;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.category-progress .progress-text {
  font-size: 0.75rem;
  font-weight: 500;
  color: #64748b;
  min-width: 24px;
}

/* 右侧题目列表 */
.questions-main {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.questions-header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f7fafc;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.questions-header h2 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.questions-stats {
  font-size: 0.8125rem;
  color: #718096;
  font-weight: 500;
}

.questions-list {
  padding: 0.75rem;
}

.question-item {
  display: flex;
  align-items: center;
  padding: 0.875rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.15s ease;
  gap: 0.75rem;
}

.question-item:hover {
  border-color: #cbd5e0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.question-item:last-child {
  margin-bottom: 0;
}

.question-order {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: #f1f5f9;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8125rem;
  font-weight: 600;
  flex-shrink: 0;
}

.question-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  gap: 1rem;
  min-width: 0;
}

.question-main {
  flex: 1;
  min-width: 0;
}

.question-title {
  font-size: 0.9375rem;
  font-weight: 500;
  color: #2d3748;
  margin: 0 0 0.25rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.question-desc {
  font-size: 0.8125rem;
  color: #718096;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.question-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: #64748b;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.difficulty-tag {
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 500;
}

.difficulty-tag.easy {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #dcfce7;
}

.difficulty-tag.medium {
  background: #fffbeb;
  color: #d97706;
  border: 1px solid #fef3c7;
}

.difficulty-tag.hard {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fee2e2;
}

/* 题目操作区域 */
.question-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.status-indicator {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 500;
  white-space: nowrap;
}

.status-indicator.completed {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #dcfce7;
}

.status-indicator.in-progress {
  background: #fffbeb;
  color: #d97706;
  border: 1px solid #fef3c7;
}

.status-indicator.not-started {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.start-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: #0ea5e9;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 0.75rem;
}

.start-btn:hover {
  background: #0284c7;
  transform: scale(1.05);
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 2rem 1rem;
  color: #64748b;
}

.empty-icon {
  font-size: 2rem;
  color: #cbd5e1;
  margin-bottom: 0.75rem;
}

.empty-state h3 {
  font-size: 1rem;
  color: #475569;
  margin-bottom: 0.25rem;
}

.empty-state p {
  font-size: 0.875rem;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 260px 1fr;
    gap: 0.75rem;
  }
}

@media (max-width: 768px) {
  .listening-layout {
    padding: 0.75rem;
  }

  .page-header.rich {
    padding: 1.25rem;
    margin-bottom: 1rem;
  }

  .header-content {
    flex-direction: column;
    gap: 1rem;
  }

  .header-stats {
    width: 100%;
    justify-content: space-around;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .stat-value {
    font-size: 1.125rem;
  }

  .main-content {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .categories-sidebar {
    order: 2;
  }

  .questions-main {
    order: 1;
  }

  .question-content {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .question-actions {
    justify-content: space-between;
  }
}

@media (max-width: 480px) {
  .listening-layout {
    padding: 0.5rem;
  }

  .page-header.rich {
    padding: 1rem;
    border-radius: 8px;
  }

  .page-title {
    font-size: 1.375rem;
  }

  .header-stats {
    gap: 1rem;
  }

  .stat-value {
    font-size: 1rem;
  }

  .category-item {
    padding: 0.625rem;
  }

  .question-item {
    padding: 0.75rem;
    gap: 0.5rem;
  }

  .questions-header {
    padding: 0.875rem 1rem;
  }

  .questions-list {
    padding: 0.5rem;
  }
}
</style>