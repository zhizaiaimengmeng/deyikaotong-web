<template>
  <div class="cloze-exercise">
    <!-- 顶部导航 -->
    <div class="exercise-header">
      <button class="back-btn" @click="goBack">
        <i class="fas fa-arrow-left"></i>
        <span>返回列表</span>
      </button>
      <div class="header-info">
        <div class="level-tag">{{ currentLevel }}</div>
        <div class="progress-indicator">
          <span class="progress-text"
            >进度: {{ answeredCount }}/{{ blanks.length }}</span
          >
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: progressPercentage + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="exercise-content">
      <div class="content-container">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <span>加载中...</span>
          </div>
        </div>

        <!-- 文章内容 -->
        <div v-else-if="initialized" class="content-loaded">
          <!-- 文章标题和元信息 -->
          <div class="article-header">
            <h1 class="article-title">{{ article.title }}</h1>
            <div class="article-meta">
              <span class="meta-item">
                <i class="fas fa-clock"></i>
                阅读时间: {{ article.reading_time }}分钟
              </span>
              <span class="meta-item">
                <i class="fas fa-book"></i>
                {{ article.word_count }}词
              </span>
              <span class="difficulty-tag">{{
                getDifficultyText(article.difficulty)
              }}</span>
              <span class="exercise-type-tag">完形填空</span>
            </div>
          </div>

          <!-- 文章内容区域 -->
          <div class="article-content">
            <p
              v-for="(processed, pIndex) in processedParagraphs"
              :key="'para-' + pIndex"
              class="paragraph"
            >
              <span
                v-for="(segment, sIndex) in processed.segments"
                :key="'seg-' + pIndex + '-' + sIndex"
              >
                <template v-if="segment.type === 'text'">
                  {{ segment.text }}
                </template>
                <template v-else-if="segment.type === 'blank'">
                  <!-- 填空处 -->
                  <span
                    class="blank-item"
                    :class="{
                      'has-answer': userAnswers[segment.blankId] !== undefined,
                      active: activeBlank === segment.blankId,
                    }"
                    @click="activateBlank(segment.blankId)"
                  >
                    <span class="blank-content">
                      {{ getSelectedOptionText(segment.blankId) || "______" }}
                    </span>
                    <span class="blank-arrow"></span>
                  </span>
                </template>
              </span>
            </p>
          </div>

          <!-- 共用下拉框 -->
          <div v-if="activeBlank !== null" class="shared-dropdown">
            <div class="dropdown-header">
              <span>选择词语 (空白 {{ activeBlank + 1 }})</span>
              <button class="close-dropdown" @click="deactivateBlank">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="options-list">
              <div
                v-for="(option, index) in sharedOptions"
                :key="index"
                class="option-item"
                :class="{
                  selected: userAnswers[activeBlank] === index,
                  used:
                    isOptionUsed(index) && userAnswers[activeBlank] !== index,
                }"
                @click="selectOption(index)"
              >
                {{ option }}
                <span
                  v-if="
                    isOptionUsed(index) && userAnswers[activeBlank] !== index
                  "
                  class="used-badge"
                  >已使用</span
                >
              </div>
            </div>
          </div>

          <!-- 答案解析区域 -->
          <transition name="slide">
            <div v-if="showAnswer" class="explanation-panel">
              <h3 class="panel-title">
                <i class="fas fa-lightbulb"></i>
                答案解析
              </h3>
              <div class="explanations-container">
                <div
                  v-for="(blank, index) in blanks"
                  :key="index"
                  class="explanation-item"
                  :class="getExplanationClass(index)"
                >
                  <div class="explanation-header">
                    <span class="question-number">空白 {{ index + 1 }}</span>
                    <span class="result-badge" :class="getResultClass(index)">
                      {{ getResultText(index) }}
                    </span>
                  </div>
                  <p class="explanation-text">{{ blank.explanation }}</p>
                </div>
              </div>
            </div>
          </transition>

          <!-- 导航控制 -->
          <div class="navigation-controls">
            <div class="main-actions">
              <button
                v-if="!showAnswer"
                class="check-btn"
                @click="checkAnswer"
                :disabled="!isComplete"
              >
                <i class="fas fa-check-circle"></i>
                <span>检查答案</span>
              </button>

              <button v-else class="finish-btn" @click="finishExercise">
                <i class="fas fa-flag-checkered"></i>
                <span>完成练习</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-container">
          <div class="empty-content">
            <i class="fas fa-file-alt"></i>
            <p>暂无文章内容</p>
            <button class="retry-btn" @click="loadArticleData">重新加载</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 全局反馈提示 -->
    <transition name="fade">
      <div
        v-if="showAnswer"
        class="global-feedback"
        :class="isAllCorrect ? 'correct' : 'incorrect'"
      >
        <div class="feedback-content">
          <i
            :class="
              isAllCorrect ? 'fas fa-check-circle' : 'fas fa-times-circle'
            "
          ></i>
          <div class="feedback-text">
            <h4>{{ isAllCorrect ? "全部正确！" : "有错误答案" }}</h4>
            <p>
              正确: {{ correctCount }}/{{ blanks.length }} 得分: {{ score }}
            </p>
          </div>
        </div>
        <button class="close-feedback" @click="showAnswer = false">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </transition>
  </div>
</template>

<script>
import { getReadingQuestions } from "@/api/question/reading/exercise";

export default {
  name: "ClozeExercise",
  props: {
    currentArticle: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      article: {
        id: null,
        title: "",
        reading_time: 0,
        word_count: 0,
        difficulty: "easy",
        content: [],
      },
      // 所有填空处共用同一组选项
      sharedOptions: [],
      // 填空处定义
      blanks: [],
      userAnswers: {},
      showAnswer: false,
      currentLevel: "A2",
      activeBlank: null, // 当前激活的空白ID
      loading: false,
      initialized: false,
    };
  },
  computed: {
    // 使用计算属性优化性能
    processedParagraphs() {
      if (
        !this.initialized ||
        !this.article.content ||
        this.article.content.length === 0
      ) {
        return [];
      }

      // console.log("计算属性: 处理", this.article.content.length, "个段落");

      return this.article.content.map((paragraph, index) => {
        return {
          original: paragraph,
          segments: this.getParagraphSegments(paragraph, index),
        };
      });
    },

    isComplete() {
      return this.blanks.every(
        (blank, index) => this.userAnswers[index] !== undefined
      );
    },
    isAllCorrect() {
      return this.blanks.every(
        (blank, index) => this.userAnswers[index] === blank.correctAnswer
      );
    },
    correctCount() {
      return this.blanks.filter(
        (blank, index) => this.userAnswers[index] === blank.correctAnswer
      ).length;
    },
    answeredCount() {
      return this.blanks.filter(
        (blank, index) => this.userAnswers[index] !== undefined
      ).length;
    },
    progressPercentage() {
      return (this.answeredCount / this.blanks.length) * 100;
    },
    score() {
      return this.correctCount * 5;
    },
  },
  created() {
    this.loadArticleData();
  },
  methods: {
    async loadArticleData() {
      this.loading = true;
      this.initialized = false;

      try {
        const articleId = this.currentArticle?.id;
        if (!articleId) {
          throw new Error("未提供文章ID");
        }

        // console.log("开始加载文章数据，文章ID:", articleId);

        // 获取文章详情
        this.article = {
          ...this.currentArticle,
          content:
            typeof this.currentArticle.content === "string"
              ? JSON.parse(this.currentArticle.content)
              : this.currentArticle.content,
        };

        // console.log(
        //   "文章内容设置完成，段落数:",
        //   this.article.content?.length || 0
        // );

        // 获取问题列表
        const data = { articleId: articleId };
        const questionsResponse = await getReadingQuestions(data);

        // console.log("获取到问题数量:", questionsResponse.data?.length || 0);

        // 一次性设置所有数据
        this.blanks = questionsResponse.data.map((q) => ({
          id: q.questionOrder,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
        }));

        this.sharedOptions = JSON.parse(questionsResponse.data[0].options);

        // console.log("数据加载完成");

        // 标记初始化完成
        this.initialized = true;
      } catch (error) {
        console.error("加载文章数据失败:", error);
        this.$message.error("加载文章失败，请稍后重试");
      } finally {
        this.loading = false;
      }
    },

    // 将段落拆分为文本段和空白段
    getParagraphSegments(paragraph, paragraphIndex) {
      // 简化调试信息
      if (paragraphIndex === 0) {
        console.log("开始处理段落，总共", this.article.content.length, "段");
      }

      const segments = [];

      if (!this.blanks || this.blanks.length === 0) {
        segments.push({ type: "text", text: paragraph });
        return segments;
      }

      let lastIndex = 0;
      this.blanks.forEach((blank, index) => {
        const blankMarker = `[blank${index + 1}]`;
        const blankIndex = paragraph.indexOf(blankMarker, lastIndex);

        if (blankIndex === -1) return; // 跳过不存在的空白标记

        // 添加空白前的文本
        if (blankIndex > lastIndex) {
          segments.push({
            type: "text",
            text: paragraph.substring(lastIndex, blankIndex),
          });
        }

        // 添加空白
        segments.push({
          type: "blank",
          blankId: index,
        });

        lastIndex = blankIndex + blankMarker.length;
      });

      // 添加剩余文本
      if (lastIndex < paragraph.length) {
        segments.push({
          type: "text",
          text: paragraph.substring(lastIndex),
        });
      }

      return segments;
    },

    // 获取选中选项的文本
    getSelectedOptionText(blankId) {
      const answerIndex = this.userAnswers[blankId];
      if (answerIndex === undefined) return "";
      return this.sharedOptions[answerIndex];
    },

    // 激活填空处（显示下拉框）
    activateBlank(blankId) {
      if (this.showAnswer) return;
      this.activeBlank = blankId;
    },

    // 关闭填空处（隐藏下拉框）
    deactivateBlank() {
      this.activeBlank = null;
    },

    // 选择选项
    selectOption(optionIndex) {
      if (this.showAnswer) return;

      // 检查选项是否已被使用
      if (
        this.isOptionUsed(optionIndex) &&
        this.userAnswers[this.activeBlank] !== optionIndex
      ) {
        alert("这个选项已经被其他空白使用，请选择其他选项");
        return;
      }

      // 设置新答案
      this.$set(this.userAnswers, this.activeBlank, optionIndex);

      // 关闭下拉框
      this.activeBlank = null;
    },

    // 检查选项是否已被使用
    isOptionUsed(optionIndex) {
      // 检查是否有其他空白使用了这个选项
      return Object.values(this.userAnswers).includes(optionIndex);
    },

    checkAnswer() {
      this.showAnswer = true;
      this.activeBlank = null;
    },

    finishExercise() {
      alert(
        `练习完成！正确: ${this.correctCount}/${this.blanks.length} 得分: ${this.score}`
      );
      this.goBack();
    },

    getExplanationClass(blankIndex) {
      const isCorrect =
        this.userAnswers[blankIndex] === this.blanks[blankIndex].correctAnswer;
      return {
        correct: isCorrect,
        incorrect: !isCorrect,
      };
    },

    getResultClass(blankIndex) {
      const isCorrect =
        this.userAnswers[blankIndex] === this.blanks[blankIndex].correctAnswer;
      return isCorrect ? "correct" : "incorrect";
    },

    getResultText(blankIndex) {
      const isCorrect =
        this.userAnswers[blankIndex] === this.blanks[blankIndex].correctAnswer;
      return isCorrect ? "正确" : "错误";
    },

    getDifficultyText(difficulty) {
      const difficultyMap = {
        easy: "简单",
        medium: "中等",
        hard: "困难",
      };
      return difficultyMap[difficulty] || difficulty;
    },

    goBack() {
      // 在实际应用中，这里应该是路由返回
      // console.log("返回上一页");
      this.$router.go(-1);
    },
  },
  mounted() {
    // 点击页面其他区域关闭下拉框
    document.addEventListener("click", (e) => {
      if (
        !e.target.closest(".blank-item") &&
        !e.target.closest(".shared-dropdown")
      ) {
        this.activeBlank = null;
      }
    });
  },
};
</script>

<style scoped>
.cloze-exercise {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.exercise-header {
  background: linear-gradient(135deg, #9f7aea 0%, #805ad5 100%);
  color: white;
  padding: 20px 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 8px 15px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.header-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.level-tag {
  background: rgba(255, 255, 255, 0.2);
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.progress-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-text {
  font-size: 0.9rem;
  opacity: 0.9;
}

.progress-bar {
  width: 150px;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: white;
  border-radius: 3px;
  transition: width 0.5s ease;
}

.exercise-content {
  max-width: 1000px;
  margin: 0 auto;
  padding: 30px;
}

.content-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  position: relative;
  min-height: 400px;
}

/* 加载状态样式 */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 30px;
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
}

.loading-spinner span {
  font-size: 1.1rem;
}

/* 空状态样式 */
.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 30px;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  color: #718096;
}

.empty-content i {
  font-size: 3rem;
  opacity: 0.5;
}

.empty-content p {
  font-size: 1.1rem;
  margin: 0;
}

.retry-btn {
  background: #9f7aea;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.retry-btn:hover {
  background: #805ad5;
  transform: translateY(-2px);
}

/* 内容加载后样式 */
.content-loaded {
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.article-header {
  padding: 30px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.article-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 15px;
  line-height: 1.3;
}

.article-meta {
  display: flex;
  gap: 20px;
  font-size: 0.95rem;
  color: #718096;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.difficulty-tag {
  background: #f0fff4;
  color: #38a169;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.exercise-type-tag {
  background: rgba(159, 122, 234, 0.1);
  color: #553c9a;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.article-content {
  padding: 30px;
  line-height: 1.8;
  font-size: 1.1rem;
  color: #2d3748;
  white-space: pre-line;
}

.paragraph {
  margin-bottom: 25px;
  text-align: justify;
}

.paragraph:last-child {
  margin-bottom: 0;
}

/* 填空处样式 - 小尺寸 */
.blank-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 50px;
  height: 30px;
  padding: 0 10px;
  background-color: #f8f8f8;
  border: 3px solid #9f7aea;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  color: #333;
  margin: 0 2px;
  position: relative;
}

.blank-item:hover {
  background-color: #f0f0f0;
  border-color: #f57c00;
}

.blank-item.active {
  border-color: #f57c00;
  box-shadow: 0 0 0 2px rgba(255, 152, 0, 0.2);
}

.blank-item.has-answer {
  background-color: #fff8f0;
}

.blank-content {
  flex: 1;
  text-align: center;
  font-size: 14px;
}

.blank-arrow {
  margin-left: 4px;
  color: #333;
  font-size: 15px;
  transition: transform 0.3s ease;
}

.blank-item.active .blank-arrow {
  transform: rotate(180deg);
}

/* 共用下拉框样式 */
.shared-dropdown {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  width: 180px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -45%);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  border-bottom: 1px solid #e2e8f0;
  font-weight: 600;
  color: #4a5568;
  background-color: #f8fafc;
  border-radius: 8px 8px 0 0;
}

.close-dropdown {
  background: none;
  border: none;
  color: #a0aec0;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-dropdown:hover {
  background: #f7fafc;
  color: #718096;
}

.options-list {
  max-height: 200px;
  overflow-y: auto;
  padding: 5px 0;
}

.option-item {
  padding: 8px 15px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.option-item:hover:not(.used) {
  background-color: #f7fafc;
}

.option-item.selected {
  background-color: #ebf8ff;
  color: #2b6cb0;
  font-weight: 600;
}

.option-item.used {
  color: #a0aec0;
  cursor: not-allowed;
}

.used-badge {
  font-size: 0.7rem;
  background: #f7fafc;
  color: #a0aec0;
  padding: 2px 6px;
  border-radius: 10px;
}

/* 答案解析区域 */
.explanation-panel {
  padding: 25px 30px;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 20px;
}

.explanations-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.explanation-item {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.explanation-item.correct {
  border-left: 4px solid #48bb78;
}

.explanation-item.incorrect {
  border-left: 4px solid #f56565;
}

.explanation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.question-number {
  font-weight: 600;
  color: #4a5568;
}

.result-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.result-badge.correct {
  background: #f0fff4;
  color: #22543d;
}

.result-badge.incorrect {
  background: #fff5f5;
  color: #742a2a;
}

.explanation-text {
  color: #4a5568;
  line-height: 1.6;
}

/* 导航控制 */
.navigation-controls {
  display: flex;
  justify-content: center;
  padding: 20px 30px;
  border-top: 1px solid #e2e8f0;
  background: white;
}

.main-actions {
  display: flex;
  gap: 10px;
}

.check-btn,
.finish-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
}

.check-btn {
  background: #9f7aea;
  color: white;
}

.check-btn:hover:not(:disabled) {
  background: #805ad5;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(159, 122, 234, 0.3);
}

.check-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.finish-btn {
  background: #ed8936;
  color: white;
}

.finish-btn:hover {
  background: #dd6b20;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(237, 137, 54, 0.3);
}

.global-feedback {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 15px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 15px;
  z-index: 1000;
  max-width: 350px;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.global-feedback.correct {
  background: #f0fff4;
  border-left: 4px solid #48bb78;
  color: #22543d;
}

.global-feedback.incorrect {
  background: #fff5f5;
  border-left: 4px solid #f56565;
  color: #742a2a;
}

.feedback-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.feedback-content i {
  font-size: 1.5rem;
}

.feedback-text h4 {
  font-weight: 600;
  margin-bottom: 5px;
}

.close-feedback {
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  opacity: 0.7;
}

.close-feedback:hover {
  opacity: 1;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}
.slide-enter,
.slide-leave-to {
  transform: translateY(10px);
  opacity: 0;
}

@media (max-width: 768px) {
  .exercise-content {
    padding: 20px;
  }

  .article-header {
    padding: 20px;
  }

  .article-title {
    font-size: 1.5rem;
  }

  .article-meta {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }

  .article-content {
    padding: 20px;
    font-size: 1rem;
  }

  .explanation-panel {
    padding: 20px;
  }

  .navigation-controls {
    padding: 20px;
  }

  .check-btn,
  .finish-btn {
    width: 100%;
    justify-content: center;
  }

  .global-feedback {
    bottom: 1rem;
    right: 1rem;
    left: 1rem;
    max-width: none;
  }

  .blank-item {
    min-width: 50px;
    height: 24px;
    font-size: 12px;
  }

  .shared-dropdown {
    width: 160px;
  }
}
</style>