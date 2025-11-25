<template>
  <div class="writing-list">
    <!-- 顶部导航 -->
    <div class="list-header">
      <div class="header-content">
        <h1 class="page-title">写作训练</h1>
        <p class="page-subtitle">通过写作练习提升语言表达能力</p>
      </div>
      <div class="user-info">
        <div class="user-stats">
          <span class="stat-item">
            <i class="fas fa-pen-alt"></i>
            已完成: {{ completedCount }}/{{ writingList.length }}
          </span>
          <span class="stat-item">
            <i class="fas fa-star"></i>
            平均得分: {{ averageScore }}
          </span>
        </div>
      </div>
    </div>

    <!-- 筛选和搜索 -->
    <div class="filters-section">
      <div class="filter-group">
        <div class="filter-item">
          <label>难度:</label>
          <select v-model="filters.difficulty" @change="applyFilters">
            <option value="">全部</option>
            <option value="easy">简单</option>
            <option value="medium">中等</option>
            <option value="hard">困难</option>
          </select>
        </div>

        <div class="filter-item">
          <label>类型:</label>
          <select v-model="filters.type" @change="applyFilters">
            <option value="">全部</option>
            <option value="letter">书信</option>
            <option value="essay">议论文</option>
            <option value="report">报告</option>
            <option value="story">故事</option>
          </select>
        </div>

        <div class="filter-item">
          <label>状态:</label>
          <select v-model="filters.status" @change="applyFilters">
            <option value="">全部</option>
            <option value="not-started">未开始</option>
            <option value="in-progress">进行中</option>
            <option value="completed">已完成</option>
          </select>
        </div>
      </div>

      <div class="search-box">
        <i class="fas fa-search"></i>
        <input
          v-model="searchQuery"
          placeholder="搜索写作题目..."
          @input="applyFilters"
        />
      </div>
    </div>

    <!-- 写作练习列表 -->
    <div class="writing-list-container">
      <div
        v-for="writing in filteredWritings"
        :key="writing.id"
        class="writing-card"
        :class="getCardClass(writing)"
        @click="goToWritingExercise(writing.id)"
      >
        <div class="card-header">
          <div class="writing-title">{{ writing.title }}</div>
          <div class="writing-meta">
            <span class="difficulty-tag" :class="writing.difficulty">
              {{ getDifficultyText(writing.difficulty) }}
            </span>
            <span class="type-tag">{{ getTypeText(writing.type) }}</span>
          </div>
        </div>

        <div class="card-content">
          <p class="writing-description">{{ writing.description }}</p>

          <div class="writing-stats">
            <div class="stat">
              <i class="fas fa-clock"></i>
              <span>建议时间: {{ writing.suggested_time }}分钟</span>
            </div>
            <div class="stat">
              <i class="fas fa-file-word"></i>
              <span>建议字数: {{ writing.suggested_word_count }}+</span>
            </div>
          </div>
        </div>

        <div class="card-footer">
          <div class="progress-section" v-if="writing.progress">
            <div class="progress-info">
              <span>完成度: {{ writing.progress.percentage }}%</span>
              <span class="score" v-if="writing.progress.score">
                得分: {{ writing.progress.score }}/100
              </span>
              <span class="not-started" v-else>未开始</span>
            </div>
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: writing.progress.percentage + '%' }"
              ></div>
            </div>
          </div>

          <div class="action-section">
            <button
              class="start-btn"
              :class="{
                'continue-btn':
                  writing.progress && writing.progress.percentage > 0,
              }"
              @click.stop="goToWritingExercise(writing.id)"
            >
              <i
                class="fas"
                :class="
                  writing.progress && writing.progress.percentage > 0
                    ? 'fa-play'
                    : 'fa-pen'
                "
              ></i>
              {{
                writing.progress && writing.progress.percentage > 0
                  ? "继续写作"
                  : "开始写作"
              }}
            </button>

            <div
              class="last-updated"
              v-if="writing.progress && writing.progress.last_updated"
            >
              上次更新: {{ formatDate(writing.progress.last_updated) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="filteredWritings.length === 0" class="empty-state">
      <i class="fas fa-file-alt"></i>
      <h3>暂无匹配的写作练习</h3>
      <p>尝试调整筛选条件或搜索关键词</p>
      <button class="reset-filters" @click="resetFilters">重置筛选</button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <span>加载中...</span>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getWritingQuestions,
  getUserWritingProgress,
} from "@/api/question/writing/exercise";

export default {
  name: "WritingList",
  props: {
    level: {
      type: String,
      default: "A1",
    },
  },
  data() {
    return {
      writingList: [],
      filteredWritings: [],
      loading: false,
      searchQuery: "",
      filters: {
        difficulty: "",
        type: "",
        status: "",
      },
    };
  },
  computed: {
    completedCount() {
      return this.writingList.filter(
        (w) => w.progress && w.progress.percentage === 100
      ).length;
    },
    averageScore() {
      const completed = this.writingList.filter(
        (w) => w.progress && w.progress.score
      );
      if (completed.length === 0) return 0;
      const total = completed.reduce((sum, w) => sum + w.progress.score, 0);
      return Math.round(total / completed.length);
    },
  },
  async created() {
    await this.loadWritingList();
  },
  methods: {
    async loadWritingList() {
      this.loading = true;
      try {
        // 获取写作练习列表
        const data = {
          level: this.level,
        };
        const response = await getWritingQuestions(data);
        this.writingList = response.data;

        // 获取用户进度
        // const progressResponse = await getUserWritingProgress();
        // const progressMap = {};
        // progressResponse.data.forEach((p) => {
        //   progressMap[p.writing_id] = p;
        // });

        // 合并进度信息
        // this.writingList = this.writingList.map((writing) => ({
        //   ...writing,
        //   progress: progressMap[writing.id] || null,
        // }));

        this.applyFilters();
      } catch (error) {
        console.error("加载写作列表失败:", error);
        this.$message.error("加载失败，请稍后重试");

        // 加载模拟数据
        // this.loadMockData();
      } finally {
        this.loading = false;
      }
    },

    loadMockData() {
      this.writingList = [
        {
          id: 1,
          title: "给朋友的一封信",
          description: "给你的朋友写一封信，分享你最近的生活和感受。",
          difficulty: "easy",
          type: "letter",
          suggested_time: 30,
          suggested_word_count: 200,
          progress: {
            percentage: 0,
            score: null,
            last_updated: null,
          },
        },
        {
          id: 2,
          title: "环境保护的重要性",
          description: "就环境保护的重要性发表你的看法，提出保护环境的建议。",
          difficulty: "medium",
          type: "essay",
          suggested_time: 45,
          suggested_word_count: 300,
          progress: {
            percentage: 75,
            score: 85,
            last_updated: "2023-10-15T14:30:00Z",
          },
        },
        {
          id: 3,
          title: "一次难忘的旅行经历",
          description: "描述一次让你难忘的旅行经历，包括所见所闻和感受。",
          difficulty: "medium",
          type: "story",
          suggested_time: 40,
          suggested_word_count: 250,
          progress: {
            percentage: 100,
            score: 92,
            last_updated: "2023-10-10T09:15:00Z",
          },
        },
        {
          id: 4,
          title: "人工智能对未来的影响",
          description: "分析人工智能技术对未来社会、经济和生活的影响。",
          difficulty: "hard",
          type: "report",
          suggested_time: 60,
          suggested_word_count: 400,
          progress: {
            percentage: 30,
            score: null,
            last_updated: "2023-10-18T16:45:00Z",
          },
        },
        {
          id: 5,
          title: "我的理想职业",
          description: "描述你理想中的职业，并说明为什么选择这个职业。",
          difficulty: "easy",
          type: "essay",
          suggested_time: 35,
          suggested_word_count: 250,
          progress: {
            percentage: 0,
            score: null,
            last_updated: null,
          },
        },
        {
          id: 6,
          title: "如何保持健康的生活方式",
          description: "分享你对于保持健康生活方式的看法和建议。",
          difficulty: "medium",
          type: "report",
          suggested_time: 50,
          suggested_word_count: 350,
          progress: {
            percentage: 100,
            score: 88,
            last_updated: "2023-10-05T11:20:00Z",
          },
        },
      ];
      this.applyFilters();
    },

    applyFilters() {
      let filtered = this.writingList;

      // 难度筛选
      if (this.filters.difficulty) {
        filtered = filtered.filter(
          (w) => w.difficulty === this.filters.difficulty
        );
      }

      // 类型筛选
      if (this.filters.type) {
        filtered = filtered.filter((w) => w.type === this.filters.type);
      }

      // 状态筛选
      if (this.filters.status) {
        switch (this.filters.status) {
          case "not-started":
            filtered = filtered.filter(
              (w) => !w.progress || w.progress.percentage === 0
            );
            break;
          case "in-progress":
            filtered = filtered.filter(
              (w) =>
                w.progress &&
                w.progress.percentage > 0 &&
                w.progress.percentage < 100
            );
            break;
          case "completed":
            filtered = filtered.filter(
              (w) => w.progress && w.progress.percentage === 100
            );
            break;
        }
      }

      // 搜索筛选
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (w) =>
            w.title.toLowerCase().includes(query) ||
            w.description.toLowerCase().includes(query)
        );
      }

      this.filteredWritings = filtered;
    },

    resetFilters() {
      this.searchQuery = "";
      this.filters = {
        difficulty: "",
        type: "",
        status: "",
      };
      this.applyFilters();
    },

    goToWritingExercise(writingId) {
      this.$router.push({
        name: "WritingExercise",
        params: {
          writingId: writingId,
          level: this.level,
        },
      });
    },

    getCardClass(writing) {
      const classes = [writing.difficulty];
      if (writing.progress) {
        if (writing.progress.percentage === 100) {
          classes.push("completed");
        } else if (writing.progress.percentage > 0) {
          classes.push("in-progress");
        }
      }
      return classes;
    },

    getDifficultyText(difficulty) {
      const difficultyMap = {
        easy: "简单",
        medium: "中等",
        hard: "困难",
      };
      return difficultyMap[difficulty] || difficulty;
    },

    getTypeText(type) {
      const typeMap = {
        letter: "书信",
        essay: "议论文",
        report: "报告",
        story: "故事",
      };
      return typeMap[type] || type;
    },

    formatDate(dateString) {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleDateString("zh-CN");
    },
  },
};
</script>

<style scoped>
.writing-list {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 20px;
}

.list-header {
  background: white;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h1 {
  font-size: 2rem;
  color: #2d3748;
  margin-bottom: 8px;
}

.header-content p {
  color: #718096;
  font-size: 1.1rem;
}

.user-stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f7fafc;
  padding: 10px 15px;
  border-radius: 8px;
  color: #4a5568;
  font-weight: 500;
}

.stat-item i {
  color: #9f7aea;
}

.filters-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.filter-group {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-item label {
  font-weight: 500;
  color: #4a5568;
}

.filter-item select {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  color: #4a5568;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-box i {
  position: absolute;
  left: 12px;
  color: #a0aec0;
}

.search-box input {
  padding: 8px 12px 8px 35px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  width: 250px;
}

.writing-list-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.writing-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
  border-left: 4px solid #e2e8f0;
}

.writing-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.writing-card.easy {
  border-left-color: #48bb78;
}

.writing-card.medium {
  border-left-color: #ed8936;
}

.writing-card.hard {
  border-left-color: #f56565;
}

.writing-card.completed {
  background: #f0fff4;
}

.writing-card.in-progress {
  background: #fffaf0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.writing-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 8px;
}

.writing-meta {
  display: flex;
  gap: 8px;
}

.difficulty-tag {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.difficulty-tag.easy {
  background: #c6f6d5;
  color: #22543d;
}

.difficulty-tag.medium {
  background: #fed7d7;
  color: #c53030;
}

.difficulty-tag.hard {
  background: #fed7d7;
  color: #c53030;
}

.type-tag {
  background: #e9d8fd;
  color: #553c9a;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.card-content {
  margin-bottom: 15px;
}

.writing-description {
  color: #718096;
  line-height: 1.5;
  margin-bottom: 15px;
}

.writing-stats {
  display: flex;
  gap: 15px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #a0aec0;
  font-size: 0.9rem;
}

.card-footer {
  border-top: 1px solid #f1f5f9;
  padding-top: 15px;
}

.progress-section {
  margin-bottom: 15px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.score {
  color: #48bb78;
  font-weight: 500;
}

.not-started {
  color: #a0aec0;
}

.progress-bar {
  height: 6px;
  background: #f1f5f9;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #48bb78;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.action-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.start-btn {
  background: #9f7aea;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 5px;
}

.start-btn:hover {
  background: #805ad5;
  transform: translateY(-1px);
}

.continue-btn {
  background: #ed8936;
}

.continue-btn:hover {
  background: #dd6b20;
}

.last-updated {
  font-size: 0.8rem;
  color: #a0aec0;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  color: #718096;
}

.empty-state i {
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state h3 {
  margin-bottom: 10px;
  color: #4a5568;
}

.reset-filters {
  background: #9f7aea;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  margin-top: 20px;
  cursor: pointer;
}

.loading-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  color: #718096;
}

.loading-spinner i {
  font-size: 2rem;
  color: #9f7aea;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .writing-list {
    padding: 15px;
  }

  .list-header {
    padding: 20px;
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .filters-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .filter-group {
    width: 100%;
    justify-content: space-between;
  }

  .filter-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .search-box {
    width: 100%;
  }

  .search-box input {
    width: 100%;
  }

  .writing-list-container {
    grid-template-columns: 1fr;
  }

  .writing-card {
    padding: 15px;
  }

  .card-header {
    flex-direction: column;
    gap: 10px;
  }

  .writing-stats {
    flex-direction: column;
    gap: 5px;
  }

  .action-section {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }

  .start-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>