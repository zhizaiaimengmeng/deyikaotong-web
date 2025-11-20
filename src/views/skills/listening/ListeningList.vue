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
            <div class="stat-value">{{ totalAudios }}</div>
            <div class="stat-label">总音频</div>
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

      <!-- 右侧音频列表 -->
      <div class="audios-main">
        <div class="audios-header">
          <h2>{{ selectedCategory?.name }}</h2>
          <div class="audios-stats">
            <span>{{ completedAudios }}/{{ filteredAudios.length }} 完成</span>
          </div>
        </div>

        <div class="audios-list">
          <div
            v-for="audio in filteredAudios"
            :key="audio.id"
            class="audio-item"
            @click="startAudio(audio)"
          >
            <div class="audio-order">{{ audio.sortOrder }}</div>

            <div class="audio-content">
              <div class="audio-main">
                <h3 class="audio-title">{{ audio.title }}</h3>
                <p class="audio-desc">{{ audio.description }}</p>
                <div class="audio-meta">
                  <span class="meta-item">
                    <i class="fas fa-clock"></i>
                    {{ formatDuration(audio.audioDuration) }}
                  </span>
                  <span class="meta-item">
                    <i class="fas fa-question-circle"></i>
                    {{ audio.questionCount }} 个问题
                  </span>
                  <span class="difficulty-tag" :class="audio.difficulty">
                    {{ getDifficultyText(audio.difficulty) }}
                  </span>
                </div>
              </div>

              <div class="audio-actions">
                <div
                  class="status-indicator"
                  :class="getStatusClass(audio.status)"
                >
                  {{ getStatusText(audio.status) }}
                </div>
                <button class="start-btn" @click.stop="startAudio(audio)">
                  <i class="fas fa-play"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div class="empty-state" v-if="filteredAudios.length === 0">
          <i class="fas fa-music empty-icon"></i>
          <h3>暂无音频材料</h3>
          <p>该分类下暂时没有可用的听力音频</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getListeningCategory,
  getAudiosByCategory,
  getAudioQuestionCount,
} from "@/api/question/question";

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
      categories: [],
      audios: [], // 改为存储音频列表
      userProgress: [], // 用户学习进度
      useMockData: false, // 添加一个开关，方便切换
    };
  },
  created() {
    // this.getListeningCategory();
    // this.getAudiosByCategory();
    // this.loadUserProgress();

    if (this.useMockData) {
      this.loadMockData();
    } else {
      this.getListeningCategory();
      this.getAudiosByCategory();
    }
  },
  computed: {
    currentLevel() {
      return this.level || this.$route.params.level || "A1";
    },
    selectedCategory() {
      return this.categories.find((cat) => cat.id === this.selectedCategoryId);
    },
    filteredAudios() {
      // 根据选中的分类筛选音频
      return this.audios.filter(
        (audio) => audio.categoryId === this.selectedCategoryId
      );
    },
    completedAudios() {
      return this.filteredAudios.filter((audio) => audio.status === "completed")
        .length;
    },
    totalAudios() {
      return this.audios.length;
    },
    totalCategories() {
      return this.categories.length;
    },
    completedCategories() {
      return this.categories.filter((cat) => cat.progress === 100).length;
    },
    overallProgress() {
      if (this.categories.length === 0) return 0;
      const totalProgress = this.categories.reduce(
        (sum, cat) => sum + (cat.progress || 0),
        0
      );
      return Math.round(totalProgress / this.categories.length);
    },
  },
  methods: {
    loadMockData() {
      // 使用上面的模拟数据
      this.categories = [
        {
          id: 1,
          name: "日常对话",
          description: "基础日常交流对话练习",
          icon: "fas fa-comments",
          level: "A1",
          sortOrder: 1,
          progress: 30,
        },
        {
          id: 2,
          name: "天气预报",
          description: "德语天气预报理解训练",
          icon: "fas fa-cloud-sun",
          level: "A1",
          sortOrder: 2,
          progress: 60,
        },
        {
          id: 3,
          name: "餐厅点餐",
          description: "餐厅用餐和点餐场景",
          icon: "fas fa-utensils",
          level: "A2",
          sortOrder: 3,
          progress: 0,
        },
        {
          id: 4,
          name: "购物对话",
          description: "购物和价格询问对话",
          icon: "fas fa-shopping-cart",
          level: "A2",
          sortOrder: 4,
          progress: 80,
        },
        {
          id: 5,
          name: "问路指路",
          description: "询问方向和地点指示",
          icon: "fas fa-map-signs",
          level: "B1",
          sortOrder: 5,
          progress: 45,
        },
      ];

      this.audios = [
        {
          id: 1,
          categoryId: 1,
          title: "早晨问候对话",
          description: "学习德语早晨问候的基本表达",
          audio_url: "/audio/greeting-morning.mp3",
          audio_duration: 60,
          difficulty: "easy",
          sort_order: 1,
          questionCount: 3,
          status: "not_started",
          progress: 0,
        },
        {
          id: 2,
          categoryId: 1,
          title: "自我介绍对话",
          description: "学习如何进行德语自我介绍",
          audio_url: "/audio/self-introduction.mp3",
          audio_duration: 90,
          difficulty: "easy",
          sort_order: 2,
          questionCount: 4,
          status: "in_progress",
          progress: 50,
        },
        {
          id: 3,
          categoryId: 2,
          title: "柏林天气预报",
          description: "柏林地区详细天气预报",
          audio_url: "/audio/berlin-weather.mp3",
          audio_duration: 120,
          difficulty: "medium",
          sort_order: 1,
          questionCount: 5,
          status: "completed",
          progress: 100,
        },
        {
          id: 4,
          categoryId: 2,
          title: "慕尼黑天气预警",
          description: "慕尼黑地区特殊天气预警",
          audio_url: "/audio/munich-weather.mp3",
          audio_duration: 150,
          difficulty: "hard",
          sort_order: 2,
          questionCount: 3,
          status: "not_started",
          progress: 0,
        },
        {
          id: 5,
          categoryId: 3,
          title: "餐厅订位对话",
          description: "学习在餐厅订位的德语表达",
          audio_url: "/audio/restaurant-booking.mp3",
          audio_duration: 110,
          difficulty: "medium",
          sort_order: 1,
          questionCount: 4,
          status: "not_started",
          progress: 0,
        },
        {
          id: 6,
          categoryId: 3,
          title: "点餐对话",
          description: "学习餐厅点餐的完整流程",
          audio_url: "/audio/ordering-food.mp3",
          audio_duration: 160,
          difficulty: "medium",
          sort_order: 2,
          questionCount: 6,
          status: "in_progress",
          progress: 30,
        },
        {
          id: 7,
          categoryId: 4,
          title: "价格询问对话",
          description: "学习询问商品价格的表达",
          audio_url: "/audio/price-ask.mp3",
          audio_duration: 95,
          difficulty: "easy",
          sort_order: 1,
          questionCount: 3,
          status: "completed",
          progress: 100,
        },
        {
          id: 8,
          categoryId: 4,
          title: "尺寸选择对话",
          description: "学习选择服装尺寸的表达",
          audio_url: "/audio/size-select.mp3",
          audio_duration: 130,
          difficulty: "medium",
          sort_order: 2,
          questionCount: 4,
          status: "completed",
          progress: 100,
        },
        {
          id: 9,
          categoryId: 5,
          title: "问路基础对话",
          description: "学习基本的问路表达",
          audio_url: "/audio/asking-directions.mp3",
          audio_duration: 95,
          difficulty: "easy",
          sort_order: 1,
          questionCount: 3,
          status: "in_progress",
          progress: 60,
        },
        {
          id: 10,
          categoryId: 5,
          title: "复杂路线指示",
          description: "学习复杂的路线指示理解",
          audio_url: "/audio/complex-directions.mp3",
          audio_duration: 180,
          difficulty: "hard",
          sort_order: 2,
          questionCount: 5,
          status: "not_started",
          progress: 0,
        },
      ];
    },
    selectCategory(categoryId) {
      this.selectedCategoryId = categoryId;
      this.getAudiosByCategory();
    },

    startAudio(audio) {
      this.$router.push({
        name: "ListeningExercise",
        params: {
          audioId: audio.id,
          categoryId: this.selectedCategoryId,
          level: this.currentLevel,
          category: this.categories.find(
            (cat) => cat.id === this.selectedCategoryId
          ),
          audio: audio,
        },
      });
    },

    formatDuration(seconds) {
      if (!seconds) return "0:00";
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
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
        in_progress: "in-progress",
        not_started: "not-started",
      };
      return map[status] || "not-started";
    },

    getStatusText(status) {
      const map = {
        completed: "已完成",
        in_progress: "进行中",
        not_started: "开始",
      };
      return map[status] || "开始";
    },

    async getListeningCategory() {
      try {
        const response = await getListeningCategory();
        this.categories = response.data.map((cat) => ({
          ...cat,
          progress: 0, // 初始化进度
        }));
      } catch (error) {
        console.error("加载分类失败:", error);
      }
    },

    async getAudiosByCategory() {
      try {
        const data = {
          categoryId: this.selectedCategoryId,
        };
        const response = await getAudiosByCategory(data);
        this.audios = await Promise.all(
          response.data.map(async (audio) => {
            // 获取每个音频的题目数量
            const questionCount = await audio.questionCount;
            // 获取用户学习状态
            const userProgress = this.getAudioProgress(audio.id);

            return {
              ...audio,
              questionCount,
              status: userProgress?.status || "not_started",
              userProgress,
            };
          })
        );
      } catch (error) {
        console.error("加载音频列表失败:", error);
        this.audios = [];
      }
    },

    async getAudioQuestionCount(audioId) {
      try {
        const response = await getAudioQuestionCount(audioId);
        return response.data.count || 0;
      } catch (error) {
        console.error("获取题目数量失败:", error);
        return 0;
      }
    },

    getAudioProgress(audioId) {
      return this.userProgress.find((progress) => progress.audioId === audioId);
    },

    async loadUserProgress() {
      // 模拟加载用户学习进度
      this.userProgress = [
        { audioId: 1, status: "completed", score: 85 },
        { audioId: 2, status: "in_progress", score: 60 },
        // ... 其他进度数据
      ];
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

/* 右侧音频列表 */
.audios-main {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.audios-header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f7fafc;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.audios-header h2 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.audios-stats {
  font-size: 0.8125rem;
  color: #718096;
  font-weight: 500;
}

.audios-list {
  padding: 0.75rem;
}

.audio-item {
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

.audio-item:hover {
  border-color: #cbd5e0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.audio-item:last-child {
  margin-bottom: 0;
}

.audio-order {
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

.audio-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  gap: 1rem;
  min-width: 0;
}

.audio-main {
  flex: 1;
  min-width: 0;
}

.audio-title {
  font-size: 0.9375rem;
  font-weight: 500;
  color: #2d3748;
  margin: 0 0 0.25rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.audio-desc {
  font-size: 0.8125rem;
  color: #718096;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.audio-meta {
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

/* 音频操作区域 */
.audio-actions {
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

  .audios-main {
    order: 1;
  }

  .audio-content {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .audio-actions {
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

  .audio-item {
    padding: 0.75rem;
    gap: 0.5rem;
  }

  .audios-header {
    padding: 0.875rem 1rem;
  }

  .audios-list {
    padding: 0.5rem;
  }
}
</style>