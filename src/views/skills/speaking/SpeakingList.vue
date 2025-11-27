<template>
  <div class="speaking-list">
    <!-- 顶部导航 -->
    <div class="list-header">
      <div class="header-content">
        <h1 class="page-title">口语训练</h1>
        <p class="page-subtitle">通过口语练习提升表达能力</p>
      </div>
      <div class="user-stats">
        <span class="stat-item">
          <i class="fas fa-microphone-alt"></i>
          已完成: {{ completedCount }}/{{ speakingList.length }}
        </span>
        <span class="stat-item">
          <i class="fas fa-star"></i>
          平均得分: {{ averageScore }}
        </span>
      </div>
    </div>

    <!-- 筛选和搜索 -->
    <div class="filters-section">
      <div class="filter-group">
        <div class="filter-item">
          <label>类型:</label>
          <select v-model="filters.type" @change="applyFilters">
            <option value="">全部</option>
            <option value="monologue">独白</option>
            <option value="dialogue">对话</option>
            <option value="picture">图片描述</option>
            <option value="topic">话题讨论</option>
          </select>
        </div>

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
          placeholder="搜索口语题目..."
          @input="applyFilters"
        />
      </div>
    </div>

    <!-- 口语题目列表 - 紧凑布局 -->
    <div class="speaking-list-container compact">
      <div
        v-for="speaking in filteredSpeakings"
        :key="speaking.id"
        class="speaking-card compact"
        :class="getCardClass(speaking)"
        @click="goToSpeakingExercise(speaking)"
      >
        <!-- 卡片头部 - 紧凑布局 -->
        <div class="card-header compact">
          <div class="title-section">
            <div class="speaking-title">{{ speaking.title }}</div>
            <div class="speaking-meta">
              <span class="type-tag">{{ getTypeText(speaking.type) }}</span>
              <span class="difficulty-tag" :class="speaking.difficulty">
                {{ getDifficultyText(speaking.difficulty) }}
              </span>
            </div>
          </div>
          <div class="level-time">
            <span class="level-tag">{{ speaking.language_level }}</span>
            <div class="time-info">
              <span class="time-item">
                <i class="fas fa-clock"></i>
                {{ speaking.preparation_time }}s
              </span>
              <span class="time-item">
                <i class="fas fa-microphone"></i>
                {{ speaking.speaking_time }}s
              </span>
            </div>
          </div>
        </div>

        <!-- 卡片内容 - 紧凑描述 -->
        <div class="card-content compact">
          <p class="speaking-description">
            {{ truncateDescription(speaking.description) }}
          </p>
        </div>

        <!-- 卡片底部 - 进度和操作 -->
        <div class="card-footer compact">
          <div class="progress-section" v-if="speaking.progress">
            <div class="progress-bar compact">
              <div
                class="progress-fill"
                :style="{ width: speaking.progress.percentage + '%' }"
                :class="{
                  'full-progress': speaking.progress.percentage === 100,
                }"
              ></div>
            </div>
            <div class="progress-info compact">
              <span class="percentage"
                >{{ speaking.progress.percentage }}%</span
              >
              <span class="score" v-if="speaking.progress.score">
                {{ speaking.progress.score }}分
              </span>
              <span class="not-started" v-else>未开始</span>
            </div>
          </div>

          <div class="action-section compact">
            <button
              class="start-btn compact"
              :class="{
                'continue-btn':
                  speaking.progress && speaking.progress.percentage > 0,
              }"
              @click.stop="goToSpeakingExercise(speaking.id)"
            >
              <i class="fas" :class="getButtonIcon(speaking)"></i>
              {{ getCompactButtonText(speaking) }}
            </button>

            <div
              class="last-updated compact"
              v-if="speaking.progress && speaking.progress.last_updated"
              :title="formatFullDate(speaking.progress.last_updated)"
            >
              {{ formatRelativeDate(speaking.progress.last_updated) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="filteredSpeakings.length === 0" class="empty-state compact">
      <i class="fas fa-microphone-slash"></i>
      <h3>暂无匹配的口语练习</h3>
      <p>尝试调整筛选条件或搜索关键词</p>
      <button class="reset-filters" @click="resetFilters">重置筛选</button>
    </div>
  </div>
</template>

<script>
import {
  getSpeakingQuestions,
  // getUserSpeakingProgress,
} from "@/api/question/speaking/exercise";

export default {
  name: "SpeakingList",
  props: {
    level: {
      type: String,
      default: "A1",
    },
  },
  data() {
    return {
      speakingList: [],
      filteredSpeakings: [],
      loading: false,
      searchQuery: "",
      filters: {
        type: "",
        difficulty: "",
        status: "",
      },
    };
  },
  computed: {
    completedCount() {
      return this.speakingList.filter(
        (s) => s.progress && s.progress.percentage === 100
      ).length;
    },
    averageScore() {
      const completed = this.speakingList.filter(
        (s) => s.progress && s.progress.score
      );
      if (completed.length === 0) return 0;
      const total = completed.reduce((sum, s) => sum + s.progress.score, 0);
      return Math.round(total / completed.length);
    },
  },
  async created() {
    await this.loadSpeakingList();
  },
  methods: {
    async loadSpeakingList() {
      this.loading = true;
      try {
        const data = {
          level: this.level,
        };
        const response = await getSpeakingQuestions(data);
        this.speakingList = response.data;

        // const progressResponse = await getUserSpeakingProgress();
        // const progressMap = {};
        // progressResponse.data.forEach((p) => {
        //   progressMap[p.speaking_id] = p;
        // });

        // this.speakingList = this.speakingList.map((speaking) => ({
        //   ...speaking,
        //   progress: progressMap[speaking.id] || null,
        // }));

        this.applyFilters();
      } catch (error) {
        console.error("加载口语列表失败:", error);
      } finally {
        this.loading = false;
      }
    },
    applyFilters() {
      let filtered = this.speakingList;

      if (this.filters.type) {
        filtered = filtered.filter((s) => s.type === this.filters.type);
      }

      if (this.filters.difficulty) {
        filtered = filtered.filter(
          (s) => s.difficulty === this.filters.difficulty
        );
      }

      if (this.filters.status) {
        switch (this.filters.status) {
          case "not-started":
            filtered = filtered.filter(
              (s) => !s.progress || s.progress.percentage === 0
            );
            break;
          case "in-progress":
            filtered = filtered.filter(
              (s) =>
                s.progress &&
                s.progress.percentage > 0 &&
                s.progress.percentage < 100
            );
            break;
          case "completed":
            filtered = filtered.filter(
              (s) => s.progress && s.progress.percentage === 100
            );
            break;
        }
      }

      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (s) =>
            s.title.toLowerCase().includes(query) ||
            s.description.toLowerCase().includes(query)
        );
      }

      this.filteredSpeakings = filtered;
    },

    resetFilters() {
      this.searchQuery = "";
      this.filters = { type: "", difficulty: "", status: "" };
      this.applyFilters();
    },

    goToSpeakingExercise(speaking) {
      this.$router.push({
        name: "SpeakingExercise",
        params: {
          speakingId: speaking.id,
          level: this.level,
          currentSpeaking: speaking,
        },
      });
    },

    getCardClass(speaking) {
      const classes = [speaking.difficulty, speaking.type];
      if (speaking.progress) {
        if (speaking.progress.percentage === 100) {
          classes.push("completed");
        } else if (speaking.progress.percentage > 0) {
          classes.push("in-progress");
        }
      }
      return classes;
    },

    getTypeText(type) {
      const typeMap = {
        monologue: "独白",
        dialogue: "对话",
        picture: "图片",
        topic: "话题",
      };
      return typeMap[type] || type;
    },

    getDifficultyText(difficulty) {
      const difficultyMap = {
        easy: "简单",
        medium: "中等",
        hard: "困难",
      };
      return difficultyMap[difficulty] || difficulty;
    },

    getButtonIcon(speaking) {
      if (speaking.progress && speaking.progress.percentage > 0) {
        return "fa-redo";
      }
      return "fa-microphone";
    },

    getCompactButtonText(speaking) {
      if (speaking.progress && speaking.progress.percentage > 0) {
        return "继续";
      }
      return "开始";
    },

    truncateDescription(description) {
      if (description.length > 60) {
        return description.substring(0, 60) + "...";
      }
      return description;
    },

    formatRelativeDate(dateString) {
      if (!dateString) return "";
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) return "1天前";
      if (diffDays < 7) return `${diffDays}天前`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
      return `${Math.floor(diffDays / 30)}月前`;
    },

    formatFullDate(dateString) {
      if (!dateString) return "";
      return new Date(dateString).toLocaleDateString("zh-CN");
    },
  },
};
</script>

<style scoped>
.speaking-list {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  background: #f8fafc;
  min-height: 100vh;
}

/* 头部样式 - 保持原有 */
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.header-content .page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 6px 0;
}

.header-content .page-subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.user-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #f1f5f9;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}

/* 筛选区域样式 - 紧凑 */
.filters-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background: white;
  padding: 16px 20px;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.filter-group {
  display: flex;
  gap: 16px;
  align-items: center;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-item label {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  white-space: nowrap;
}

.filter-item select {
  padding: 6px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 5px;
  background: white;
  color: #334155;
  font-size: 13px;
  cursor: pointer;
  width: 100px;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-box i {
  position: absolute;
  left: 10px;
  color: #94a3b8;
  font-size: 13px;
}

.search-box input {
  padding: 8px 10px 8px 30px;
  border: 1px solid #e2e8f0;
  border-radius: 5px;
  width: 200px;
  font-size: 13px;
}

/* 紧凑卡片布局 */
.speaking-list-container.compact {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

/* 紧凑卡片样式 */
.speaking-card.compact {
  background: white;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 3px solid #e2e8f0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  height: fit-content;
  min-height: 140px;
  display: flex;
  flex-direction: column;
}

.speaking-card.compact:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 类型颜色 */
.speaking-card.compact.monologue {
  border-left-color: #3b82f6;
}

.speaking-card.compact.dialogue {
  border-left-color: #10b981;
}

.speaking-card.compact.picture {
  border-left-color: #f59e0b;
}

.speaking-card.compact.topic {
  border-left-color: #8b5cf6;
}

/* 紧凑卡片头部 */
.card-header.compact {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
  gap: 8px;
}

.title-section {
  flex: 1;
  min-width: 0;
}

.speaking-title {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 6px;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.speaking-meta {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.type-tag,
.difficulty-tag,
.level-tag {
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.type-tag {
  background: #eff6ff;
  color: #1d4ed8;
}

.difficulty-tag.easy {
  background: #f0fdf4;
  color: #166534;
}

.difficulty-tag.medium {
  background: #fef7ed;
  color: #9a3412;
}

.difficulty-tag.hard {
  background: #fef2f2;
  color: #991b1b;
}

.level-tag {
  background: #f3e8ff;
  color: #7c3aed;
  white-space: nowrap;
}

.level-time {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  min-width: fit-content;
}

.time-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.time-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #64748b;
  white-space: nowrap;
}

.time-item i {
  font-size: 10px;
  width: 12px;
  text-align: center;
}

/* 紧凑卡片内容 */
.card-content.compact {
  margin-bottom: 12px;
  flex: 1;
}

.speaking-description {
  color: #64748b;
  font-size: 13px;
  line-height: 1.4;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 紧凑卡片底部 */
.card-footer.compact {
  border-top: 1px solid #f1f5f9;
  padding-top: 10px;
}

.progress-section {
  margin-bottom: 8px;
}

.progress-bar.compact {
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 4px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.progress-fill.full-progress {
  background: #10b981;
}

.progress-info.compact {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: #64748b;
}

.progress-info .percentage {
  font-weight: 600;
  color: #475569;
}

.progress-info .score {
  color: #10b981;
  font-weight: 600;
}

.progress-info .not-started {
  color: #94a3b8;
  font-style: italic;
}

.action-section.compact {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.start-btn.compact {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.start-btn.compact:hover {
  background: #2563eb;
  transform: scale(1.05);
}

.start-btn.compact.continue-btn {
  background: #f59e0b;
}

.start-btn.compact.continue-btn:hover {
  background: #d97706;
}

.last-updated.compact {
  font-size: 10px;
  color: #94a3b8;
  white-space: nowrap;
  cursor: help;
}

/* 空状态紧凑 */
.empty-state.compact {
  text-align: center;
  padding: 40px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  grid-column: 1 / -1;
}

.empty-state.compact i {
  font-size: 36px;
  color: #cbd5e1;
  margin-bottom: 12px;
}

.empty-state.compact h3 {
  font-size: 16px;
  color: #475569;
  margin-bottom: 6px;
}

.empty-state.compact p {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 16px;
}

.reset-filters {
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .speaking-list-container.compact {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (max-width: 768px) {
  .speaking-list {
    padding: 16px;
  }

  .speaking-list-container.compact {
    grid-template-columns: 1fr;
  }

  .list-header {
    flex-direction: column;
    gap: 12px;
  }

  .filters-section {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .filter-group {
    flex-wrap: wrap;
    justify-content: center;
  }

  .search-box input {
    width: 100%;
  }

  .card-header.compact {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .level-time {
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
    align-items: center;
  }

  .time-info {
    flex-direction: row;
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .speaking-list-container.compact {
    grid-template-columns: 1fr;
  }

  .speaking-card.compact {
    padding: 12px;
  }

  .filter-item {
    flex: 1;
    min-width: 120px;
  }

  .filter-item select {
    width: 100%;
  }
}

/* 加载动画 */
.speaking-card.compact {
  animation: fadeInUp 0.4s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 悬停效果增强 */
.speaking-card.compact:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.speaking-card.compact.monologue:hover {
  border-left-color: #2563eb;
}

.speaking-card.compact.dialogue:hover {
  border-left-color: #059669;
}

.speaking-card.compact.picture:hover {
  border-left-color: #d97706;
}

.speaking-card.compact.topic:hover {
  border-left-color: #7c3aed;
}
</style>