<template>
  <div class="reading-list">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">{{ currentLevel }} 级别阅读理解</h1>
      <p class="page-subtitle">选择文章开始练习，提升您的德语阅读能力</p>
    </div>

    <!-- 文章列表 -->
    <div class="articles-container">
      <div
        class="article-card"
        v-for="article in articles"
        :key="article.id"
        @click="startReading(article)"
      >
        <div class="article-image">
          <div
            class="image-placeholder"
            :style="{ background: getGradient(article.difficulty) }"
          >
            <i :class="getArticleIcon(article.exerciseType)"></i>
          </div>
        </div>
        <div class="article-content">
          <div class="article-header">
            <h3 class="article-title">{{ article.title }}</h3>
            <div class="article-meta">
              <span class="meta-item">
                <i class="fas fa-clock"></i>
                {{ article.readingTime }}分钟
              </span>
              <span class="meta-item">
                <i class="fas fa-book"></i>
                {{ article.wordCount }}词
              </span>
              <span class="exercise-type-tag" :class="article.exerciseType">
                {{ getExerciseTypeText(article.exerciseType) }}
              </span>
            </div>
          </div>
          <p class="article-excerpt">{{ article.excerpt }}</p>
          <div class="article-footer">
            <div class="difficulty-tag" :class="article.difficulty">
              <span class="tag-dot"></span>
              {{ getDifficultyText(article.difficulty) }}
            </div>
            <div class="question-count">
              <i class="fas fa-question-circle"></i>
              {{ article.questionCount }}个问题
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner">
        <div class="spinner"></div>
      </div>
      <span>加载文章中...</span>
    </div>

    <!-- 无数据提示 -->
    <div v-if="!loading && articles.length === 0" class="empty-state">
      <div class="empty-illustration">
        <i class="fas fa-book-open"></i>
      </div>
      <h3>暂无阅读材料</h3>
      <p>当前级别没有可用的阅读材料</p>
      <button class="empty-action-btn" @click="$router.go(-1)">
        <i class="fas fa-arrow-left"></i>
        返回级别选择
      </button>
    </div>

    <!-- 底部操作按钮 -->
    <div class="action-section">
      <button class="action-btn" @click="$router.go(-1)">
        <i class="fas fa-arrow-left"></i>
        返回级别选择
      </button>
    </div>
  </div>
</template>
<script>
import { getReadingArticles } from "@/api/question/reading/exercise";
export default {
  name: "ReadingList",
  props: {
    level: {
      type: String,
      default: "A1",
    },
  },
  data() {
    return {
      articles: [],
      loading: true,
    };
  },
  computed: {
    currentLevel() {
      return this.level || this.$route.params.level || "A1";
    },
  },
  methods: {
    async fetchArticles() {
      this.loading = true;
      const data = {
        level: this.level,
      };

      try {
        const response = await getReadingArticles(data);
        this.articles = response.data;
        this.loading = false;

        // 模拟API调用延迟
        // await new Promise((resolve) => setTimeout(resolve, 800));

        // // 使用模拟数据（包含完型填空文章）
        // this.articles = [
        //   {
        //     id: 1,
        //     title: "德国教育体系的特点",
        //     excerpt:
        //       "德国教育体系以其高质量和多样性而闻名。本文探讨德国教育的主要特点。",
        //     reading_time: 12,
        //     word_count: 980,
        //     difficulty: "easy",
        //     level: "A2",
        //     topic: "教育",
        //     exercise_type: "reading_comprehension",
        //     question_count: 4,
        //     content: ["段落1", "段落2"],
        //   },
        //   {
        //     id: 2,
        //     title: "德国环保政策与可持续发展",
        //     excerpt:
        //       "德国在环保和可持续发展方面走在世界前列。本文介绍德国的主要环保政策和措施。",
        //     reading_time: 15,
        //     word_count: 1250,
        //     difficulty: "medium",
        //     level: "B1",
        //     topic: "环保",
        //     exercise_type: "reading_comprehension",
        //     question_count: 5,
        //     content: ["段落1", "段落2"],
        //   },
        //   {
        //     id: 3,
        //     title: "德国文化节日与传统",
        //     excerpt: "完形填空练习：德国丰富的文化传统和多样的节日庆典。",
        //     reading_time: 10,
        //     word_count: 850,
        //     difficulty: "easy",
        //     level: "A2",
        //     topic: "文化",
        //     exercise_type: "cloze_test",
        //     question_count: 3,
        //     content: [
        //       "德国拥有丰富的文化传统和多样的节日庆典。从慕尼黑啤酒节到圣诞市集，这些活动展示了德国文化的[blank1]魅力。",
        //       "慕尼黑啤酒节是德国最著名的节日之一，每年吸引数百万游客前来[blank2]。这个节日始于1810年，最初是为了庆祝路德维希王子的婚礼。",
        //       "圣诞市集是德国冬季的传统活动，各城市在圣诞节前设立市集，售卖手工艺品、美食和圣诞[blank3]。",
        //     ],
        //   },
        //   {
        //     id: 4,
        //     title: "德国医疗保障体系",
        //     excerpt:
        //       "完形填空练习：德国的医疗保障体系被认为是世界上最好的之一。",
        //     reading_time: 14,
        //     word_count: 1100,
        //     difficulty: "medium",
        //     level: "B1",
        //     topic: "医疗",
        //     exercise_type: "cloze_test",
        //     question_count: 3,
        //     content: [
        //       "德国的医疗保障体系被认为是世界上最好的之一。德国实行全民医疗保险制度，是世界上最早建立社会保障[blank1]的国家之一。",
        //       "德国的医疗保险分为法定医疗保险和私人医疗保险两种。法定医疗保险覆盖了德国约90%的人口，保费按收入比例[blank2]。",
        //       "保障范围广泛，包括门诊、住院、牙科和药品等。德国的医疗体系以其高质量、公平性和可[blank3]性而闻名。",
        //     ],
        //   },
        // ];
      } catch (error) {
        console.error("获取阅读材料失败:", error);
        this.$message.error("加载文章失败1，请稍后重试");
      } finally {
        this.loading = false;
      }
    },

    startReading(article) {
      // 根据文章类型跳转到不同的练习页面
      const routeName =
        article.exerciseType === "cloze_test"
          ? "ClozeExercise"
          : "ReadingExercise";
      this.$router.push({
        name: routeName,
        params: {
          level: this.currentLevel,
          articleId: article.id,
          articleTitle: article.title,
          currentArticle: article,
        },
      });
    },

    getDifficultyText(difficulty) {
      const difficultyMap = {
        easy: "简单",
        medium: "中等",
        hard: "困难",
      };
      return difficultyMap[difficulty] || difficulty;
    },

    getExerciseTypeText(type) {
      const typeMap = {
        reading_comprehension: "阅读理解",
        cloze_test: "完型填空",
      };
      return typeMap[type] || type;
    },

    getArticleIcon(type) {
      const iconMap = {
        reading_comprehension: "fas fa-book-open",
        cloze_test: "fas fa-edit",
      };
      return iconMap[type] || "fas fa-book";
    },

    getGradient(difficulty) {
      const gradients = {
        easy: "linear-gradient(135deg, #48bb78, #38a169)",
        medium: "linear-gradient(135deg, #ed8936, #dd6b20)",
        hard: "linear-gradient(135deg, #f56565, #e53e3e)",
      };
      return gradients[difficulty] || gradients.medium;
    },
  },
  created() {
    this.fetchArticles();
  },
};
</script>

<style scoped>
/* 原有样式保持不变，添加以下新样式 */

.exercise-type-tag {
  padding: 0.3rem 0.6rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.exercise-type-tag.reading_comprehension {
  background: rgba(66, 153, 225, 0.1);
  color: #2b6cb0;
}

.exercise-type-tag.cloze_test {
  background: rgba(159, 122, 234, 0.1);
  color: #553c9a;
}

.article-image .image-placeholder i {
  font-size: 1.8rem;
}
.reading-list {
  min-height: 100vh;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  display: flex;
  flex-direction: column;
}

/* 页面标题 */
.page-header {
  text-align: center;
  margin-bottom: 2rem;
  padding-top: 0.5rem;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 0.95rem;
  color: #718096;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.5;
}

/* 文章容器 - 更紧凑的网格布局 */
.articles-container {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

/* 文章卡片 - 进一步缩小尺寸 */
.article-card {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  display: flex;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  height: 100%;
  flex-direction: column;
  min-height: 200px; /* 设置最小高度 */
}

.article-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  border-color: #cbd5e0;
}

.article-image {
  height: 40px; /* 进一步缩小图片区域 */
  overflow: hidden;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem; /* 缩小图标 */
}

.article-content {
  flex: 1;
  padding: 1rem; /* 减少内边距 */
  display: flex;
  flex-direction: column;
}

.article-header {
  margin-bottom: 0.5rem; /* 减少间距 */
}

.article-title {
  font-size: 1rem; /* 缩小标题字体 */
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.4rem;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-meta {
  display: flex;
  gap: 0.75rem;
  font-size: 0.8rem; /* 缩小元信息字体 */
  color: #718096;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.article-excerpt {
  color: #4a5568;
  line-height: 1.4;
  flex: 1;
  margin-bottom: 0.8rem;
  font-size: 0.85rem; /* 缩小摘要字体 */
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.difficulty-tag {
  padding: 0.25rem 0.5rem; /* 缩小标签内边距 */
  border-radius: 12px;
  font-size: 0.75rem; /* 缩小标签字体 */
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.difficulty-tag.easy {
  background: rgba(72, 187, 120, 0.1);
  color: #38a169;
}

.difficulty-tag.medium {
  background: rgba(237, 137, 54, 0.1);
  color: #dd6b20;
}

.difficulty-tag.hard {
  background: rgba(245, 101, 101, 0.1);
  color: #e53e3e;
}

.tag-dot {
  width: 5px; /* 缩小圆点 */
  height: 5px;
  border-radius: 50%;
}

.difficulty-tag.easy .tag-dot {
  background: #38a169;
}

.difficulty-tag.medium .tag-dot {
  background: #dd6b20;
}

.difficulty-tag.hard .tag-dot {
  background: #e53e3e;
}

.question-count {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: #718096;
  font-size: 0.75rem; /* 缩小问题计数字体 */
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #718096;
  grid-column: 1 / -1;
}

.loading-spinner {
  margin-bottom: 1rem;
}

.spinner {
  width: 28px; /* 缩小加载动画 */
  height: 28px;
  border: 2px solid #e2e8f0;
  border-left: 2px solid #4299e1;
  border-radius: 50%;
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

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 3rem 1.5rem;
  color: #718096;
  grid-column: 1 / -1;
}

.empty-illustration {
  font-size: 2.5rem; /* 缩小空状态图标 */
  color: #cbd5e0;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.2rem; /* 缩小空状态标题 */
  margin-bottom: 0.5rem;
  color: #4a5568;
}

.empty-state p {
  margin-bottom: 1.5rem;
  max-width: 350px;
  margin-left: auto;
  margin-right: auto;
  font-size: 0.9rem;
}

.empty-action-btn {
  padding: 0.5rem 1rem; /* 缩小按钮 */
  background: #4299e1;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem; /* 缩小按钮字体 */
}

.empty-action-btn:hover {
  background: #3182ce;
  transform: translateY(-2px);
}

/* 操作区域 */
.action-section {
  margin-top: 2rem;
  text-align: center;
  grid-column: 1 / -1;
}

.action-btn {
  padding: 0.5rem 1rem; /* 缩小按钮 */
  background: white;
  color: #4a5568;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  font-size: 0.85rem; /* 缩小按钮字体 */
}

.action-btn:hover {
  background: #f7fafc;
  border-color: #cbd5e1;
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .articles-container {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 900px) {
  .articles-container {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    max-width: 600px;
  }
}

@media (max-width: 768px) {
  .reading-list {
    padding: 1rem;
  }

  .page-title {
    font-size: 1.5rem; /* 缩小移动端标题 */
  }

  .page-subtitle {
    font-size: 0.9rem;
  }

  .articles-container {
    grid-template-columns: 1fr;
    max-width: 500px;
    gap: 0.8rem; /* 缩小移动端间距 */
  }

  .article-card {
    min-height: 180px; /* 调整移动端最小高度 */
  }
}

@media (max-width: 480px) {
  .reading-list {
    padding: 0.75rem;
  }

  .page-title {
    font-size: 1.3rem;
  }

  .page-subtitle {
    font-size: 0.85rem;
  }

  .article-title {
    font-size: 0.95rem;
  }

  .article-excerpt {
    font-size: 0.8rem;
  }

  .article-meta {
    flex-direction: column;
    gap: 0.3rem;
    align-items: flex-start;
  }

  .articles-container {
    gap: 0.7rem;
  }

  .article-content {
    padding: 0.8rem;
  }
}

@media (max-width: 360px) {
  .articles-container {
    grid-template-columns: 1fr;
  }

  .article-image {
    height: 35px;
  }

  .image-placeholder {
    font-size: 1.3rem;
  }

  .article-card {
    min-height: 160px;
  }
}
</style>