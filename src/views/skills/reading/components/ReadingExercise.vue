<template>
  <div class="reading-exercise">
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
            >进度: {{ currentQuestionIndex + 1 }}/{{ questions.length }}</span
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

    <!-- 主要内容区域 - 左右布局 -->
    <div class="exercise-content">
      <!-- 左侧：文章内容 -->
      <div class="content-left">
        <div class="article-container">
          <div class="article-header">
            <h2 class="article-title">{{ article.title }}</h2>
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
            </div>
          </div>

          <div class="article-content">
            <div
              v-for="(paragraph, index) in article.content"
              :key="index"
              class="paragraph"
            >
              <p>{{ paragraph }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：问题区域 -->
      <div class="content-right">
        <div class="question-container">
          <div class="question-card" v-if="currentQuestion">
            <div class="question-header">
              <div class="question-info">
                <h3>问题 {{ currentQuestionIndex + 1 }}</h3>
                <div class="question-points">
                  {{ currentQuestion.points }} 分
                </div>
              </div>
            </div>

            <div class="question-content">
              <p class="question-text">{{ currentQuestion.questionText }}</p>

              <div class="options">
                <div
                  v-for="(option, index) in currentQuestion.options"
                  :key="index"
                  class="option"
                  :class="getOptionClass(index)"
                  @click="selectOption(index)"
                >
                  <div class="option-selector">
                    <div class="selector-circle">
                      <div
                        class="selector-dot"
                        v-if="isOptionSelected(index)"
                      ></div>
                    </div>
                  </div>
                  <div class="option-content">
                    <span class="option-label">{{
                      String.fromCharCode(65 + index)
                    }}</span>
                    <span class="option-text">{{ option }}</span>
                  </div>
                  <div v-if="showAnswer" class="option-feedback">
                    <i
                      v-if="isOptionCorrect(index)"
                      class="fas fa-check correct-icon"
                    ></i>
                    <i
                      v-else-if="isOptionIncorrect(index)"
                      class="fas fa-times incorrect-icon"
                    ></i>
                  </div>
                </div>
              </div>
            </div>

            <!-- 答案解析 -->
            <transition name="slide">
              <div v-if="showAnswer" class="explanation-section">
                <div class="explanation-header">
                  <i class="fas fa-lightbulb"></i>
                  <span>答案解析</span>
                </div>
                <p class="explanation-text">
                  {{ currentQuestion.explanation }}
                </p>
              </div>
            </transition>
          </div>

          <!-- 导航控制 -->
          <div class="navigation-controls">
            <button
              class="nav-btn"
              @click="prevQuestion"
              :disabled="currentQuestionIndex === 0"
            >
              <i class="fas fa-chevron-left"></i>
              <span>上一题</span>
            </button>

            <div class="main-actions">
              <button
                v-if="!showAnswer"
                class="check-btn"
                @click="checkAnswer"
                :disabled="!isAnswerSelected"
              >
                <i class="fas fa-check-circle"></i>
                <span>检查答案</span>
              </button>

              <button
                v-else-if="!isLastQuestion"
                class="next-btn"
                @click="nextQuestion"
              >
                <span>下一题</span>
                <i class="fas fa-chevron-right"></i>
              </button>

              <button v-else class="finish-btn" @click="finishExercise">
                <i class="fas fa-flag-checkered"></i>
                <span>完成练习</span>
              </button>
            </div>

            <button
              class="skip-btn"
              @click="nextQuestion"
              v-if="!showAnswer && !isLastQuestion"
            >
              <span>跳过</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 全局反馈提示 -->
    <transition name="fade">
      <div
        v-if="showAnswer"
        class="global-feedback"
        :class="isAnswerCorrect ? 'correct' : 'incorrect'"
      >
        <div class="feedback-content">
          <i
            :class="
              isAnswerCorrect ? 'fas fa-check-circle' : 'fas fa-times-circle'
            "
          ></i>
          <div class="feedback-text">
            <h4>{{ isAnswerCorrect ? "回答正确！" : "回答不正确" }}</h4>
            <p>继续努力，完成所有题目</p>
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
  name: "ReadingExercise",
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
      questions: [],
      currentQuestionIndex: 0,
      userAnswers: {},
      showAnswer: false,
      isAnswerCorrect: false,
      currentLevel: "A2",
      userProgressId: null,
    };
  },
  computed: {
    currentQuestion() {
      return this.questions[this.currentQuestionIndex] || null;
    },
    isAnswerSelected() {
      return this.userAnswers[this.currentQuestionIndex] !== undefined;
    },
    isLastQuestion() {
      return this.currentQuestionIndex === this.questions.length - 1;
    },
    progressPercentage() {
      return ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
    },
  },
  methods: {
    async goBack() {
      this.$router.go(-1);
    },

    async loadArticleData() {
      try {
        const articleId = this.currentArticle.id;
        if (!articleId) {
          throw new Error("未提供文章ID");
        }
        // 获取文章详情
        this.article = {
          ...this.currentArticle,
          content:
            typeof this.currentArticle.content === "string"
              ? JSON.parse(this.currentArticle.content)
              : this.currentArticle.content,
        };
        console.log(this.article);
        const data = {
          articleId: articleId,
        };
        const questionsResponse = await getReadingQuestions(data);
        // 获取问题列表

        this.questions = questionsResponse.data.map((q) => ({
          ...q,
          options:
            typeof q.options === "string" ? JSON.parse(q.options) : q.options,
          correctAnswer:
            typeof q.correctAnswer === "string"
              ? JSON.parse(q.correctAnswer)
              : q.correctAnswer,
        }));

        // // 创建用户进度记录
        // await this.createUserProgress();
      } catch (error) {
        console.error("加载文章数据失败:", error);
        this.$message.error("加载文章失败，请稍后重试");
        this.loadMockData();
      }
    },

    async createUserProgress() {
      try {
        // 假设有当前用户ID
        const userId = sessionStorage.getItem("username"); // 实际应从用户状态获取
        const response = await this.$api.post("/api/reading/progress", {
          user_id: userId,
          article_id: this.article.id,
        });
        this.userProgressId = response.data.progress_id;
      } catch (error) {
        console.error("创建学习进度失败:", error);
      }
    },

    selectOption(index) {
      if (!this.showAnswer) {
        if (this.currentQuestion.questionType === "single_choice") {
          this.$set(this.userAnswers, this.currentQuestionIndex, index);
        } else if (this.currentQuestion.questionType === "multiple_choice") {
          const currentAnswers =
            this.userAnswers[this.currentQuestionIndex] || [];
          const answerIndex = currentAnswers.indexOf(index);
          if (answerIndex > -1) {
            currentAnswers.splice(answerIndex, 1);
          } else {
            currentAnswers.push(index);
          }
          this.$set(
            this.userAnswers,
            this.currentQuestionIndex,
            currentAnswers
          );
        }
      }
    },

    async checkAnswer() {
      try {
        const selectedAnswer = this.userAnswers[this.currentQuestionIndex];
        const correctAnswer = this.currentQuestion.correctAnswer;

        // 检查答案是否正确
        if (this.currentQuestion.questionType === "single_choice") {
          this.isAnswerCorrect = selectedAnswer === correctAnswer;
        } else if (this.currentQuestion.questionType === "multiple_choice") {
          const sortedSelected = Array.isArray(selectedAnswer)
            ? [...selectedAnswer].sort()
            : [];
          const sortedCorrect = Array.isArray(correctAnswer)
            ? [...correctAnswer].sort()
            : [];
          this.isAnswerCorrect =
            sortedSelected.length === sortedCorrect.length &&
            sortedSelected.every((val, idx) => val === sortedCorrect[idx]);
        }

        this.showAnswer = true;

        // 保存用户答案
        await this.saveUserAnswer();
      } catch (error) {
        console.error("检查答案失败:", error);
      }
    },

    async saveUserAnswer() {
      try {
        await this.$api.post(
          `/api/reading/progress/${this.userProgressId}/answers`,
          {
            question_id: this.currentQuestion.id,
            selected_answer: this.userAnswers[this.currentQuestionIndex],
            is_correct: this.isAnswerCorrect,
          }
        );
      } catch (error) {
        console.error("保存答案失败:", error);
      }
    },

    nextQuestion() {
      if (this.currentQuestionIndex < this.questions.length - 1) {
        this.currentQuestionIndex++;
        this.showAnswer = false;
        this.isAnswerCorrect = false;
      }
    },

    prevQuestion() {
      if (this.currentQuestionIndex > 0) {
        this.currentQuestionIndex--;
        this.showAnswer = false;
        this.isAnswerCorrect = false;
      }
    },

    async finishExercise() {
      try {
        // 计算总分
        const correctAnswers = Object.keys(this.userAnswers).filter((index) => {
          const answer = this.userAnswers[index];
          const question = this.questions[index];
          const correctAnswer = question.correct_answer;

          if (question.questionType === "single_choice") {
            return answer === correctAnswer;
          } else if (question.questionType === "multiple_choice") {
            const sortedSelected = Array.isArray(answer)
              ? [...answer].sort()
              : [];
            const sortedCorrect = Array.isArray(correctAnswer)
              ? [...correctAnswer].sort()
              : [];
            return (
              sortedSelected.length === sortedCorrect.length &&
              sortedSelected.every((val, idx) => val === sortedCorrect[idx])
            );
          }
          return false;
        }).length;

        const totalScore = correctAnswers * 10;
        const percentage = Math.round(
          (correctAnswers / this.questions.length) * 100
        );

        // 更新学习进度
        await this.$api.put(
          `/api/reading/progress/${this.userProgressId}/complete`,
          {
            score: totalScore,
            correct_answers: correctAnswers,
            total_questions: this.questions.length,
            completed: true,
          }
        );

        alert(
          `练习完成！正确: ${correctAnswers}/${this.questions.length} 得分: ${totalScore} (${percentage}%)`
        );

        this.$router.go(-1); // 返回列表
      } catch (error) {
        console.error("完成练习失败:", error);
      }
    },

    isOptionSelected(index) {
      const answer = this.userAnswers[this.currentQuestionIndex];
      if (this.currentQuestion.questionType === "single_choice") {
        return answer === index;
      } else if (this.currentQuestion.questionType === "multiple_choice") {
        return Array.isArray(answer) && answer.includes(index);
      }
      return false;
    },

    isOptionCorrect(index) {
      if (!this.showAnswer) return false;

      const correctAnswer = this.currentQuestion.correctAnswer;
      if (this.currentQuestion.questionType === "single_choice") {
        return index === correctAnswer;
      } else if (this.currentQuestion.questionType === "multiple_choice") {
        return Array.isArray(correctAnswer) && correctAnswer.includes(index);
      }
      return false;
    },

    isOptionIncorrect(index) {
      return (
        this.showAnswer &&
        this.isOptionSelected(index) &&
        !this.isOptionCorrect(index)
      );
    },

    getOptionClass(index) {
      return {
        selected: this.isOptionSelected(index),
        correct: this.isOptionCorrect(index),
        incorrect: this.isOptionIncorrect(index),
      };
    },

    getDifficultyText(difficulty) {
      const difficultyMap = {
        easy: "简单",
        medium: "中等",
        hard: "困难",
      };
      return difficultyMap[difficulty] || difficulty;
    },

    loadMockData() {
      // 降级到模拟数据
      this.article = {
        id: 1,
        title: "德国教育体系的特点",
        reading_time: 12,
        word_count: 980,
        difficulty: "easy",
        content: [
          "德国教育体系在国际上享有盛誉，以其高质量、公平性和多样性而著称。该体系的一个显著特点是其联邦制结构，这意味着教育政策主要由各州政府负责，而非联邦政府。",
          "德国教育从幼儿园开始，但幼儿园教育不是强制性的。正式的学校教育从6岁开始，通常持续12-13年。德国的中小学教育分为几种类型，包括基础学校、实科中学、文理中学和综合学校。",
        ],
      };

      this.questions = [
        {
          id: 1,
          question_text: "德国教育体系最独特的特点是什么？",
          options: [
            "联邦制结构",
            "双元制职业教育体系",
            "免费高等教育",
            "多种学校类型",
          ],
          correct_answer: 1,
          explanation:
            "文章明确指出'德国教育体系最独特的特点之一是其双元制职业教育体系'。",
          points: 10,
          question_type: "single_choice",
        },
      ];
    },
  },
  created() {
    this.loadArticleData();
  },
};
</script>

<style scoped>
.reading-exercise {
  max-width: 1400px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 顶部导航 */
.exercise-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
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

/* 主要内容区域 - 左右布局 */
.exercise-content {
  display: flex;
  min-height: 70vh;
}

/* 左侧：文章内容 */
.content-left {
  flex: 1;
  padding: 30px;
  border-right: 1px solid #e2e8f0;
  background: #f8fafc;
}

.article-container {
  background: white;
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  height: 100%;
}

.article-header {
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.article-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 15px;
}

.article-meta {
  display: flex;
  gap: 20px;
  font-size: 0.95rem;
  color: #718096;
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

.article-content {
  line-height: 1.7;
  color: #4a5568;
}

.paragraph {
  margin-bottom: 20px;
}

.paragraph:last-child {
  margin-bottom: 0;
}

/* 右侧：问题区域 */
.content-right {
  width: 40%;
  min-width: 450px;
  padding: 30px;
  display: flex;
  flex-direction: column;
}

.question-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.question-card {
  background: #f8fafc;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  flex: 1;
  display: flex;
  flex-direction: column;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e2e8f0;
}

.question-info h3 {
  font-size: 1.3rem;
  font-weight: 600;
  color: #2d3748;
}

.question-points {
  background: #bee3f8;
  color: #2c5282;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.question-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.question-text {
  font-size: 1.1rem;
  font-weight: 500;
  color: #2d3748;
  margin-bottom: 20px;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.option {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.option:hover {
  border-color: #cbd5e0;
  background: #f7fafc;
}

.option.selected {
  border-color: #4299e1;
  background: #ebf8ff;
}

.option.correct {
  border-color: #48bb78;
  background: #f0fff4;
}

.option.incorrect {
  border-color: #f56565;
  background: #fff5f5;
}

.option-selector {
  margin-right: 12px;
}

.selector-circle {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #cbd5e0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.option.selected .selector-circle {
  border-color: #4299e1;
  background: #4299e1;
}

.option.correct .selector-circle {
  border-color: #48bb78;
  background: #48bb78;
}

.option.incorrect .selector-circle {
  border-color: #f56565;
  background: #f56565;
}

.selector-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: white;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.option.selected .selector-dot,
.option.correct .selector-dot,
.option.incorrect .selector-dot {
  opacity: 1;
}

.option-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}

.option-label {
  font-weight: 700;
  color: #6b7280;
  min-width: 20px;
}

.option-text {
  color: #374151;
  font-weight: 500;
}

.option-feedback {
  margin-left: 8px;
}

.correct-icon {
  color: #48bb78;
}

.incorrect-icon {
  color: #f56565;
}

/* 答案解析 */
.explanation-section {
  margin-top: 20px;
  padding: 15px;
  background: #f7fafc;
  border-radius: 8px;
  border-left: 4px solid #4299e1;
}

.explanation-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: #2b6cb0;
  font-weight: 600;
}

.explanation-text {
  color: #4a5568;
  line-height: 1.6;
}

/* 导航控制 */
.navigation-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.nav-btn {
  padding: 10px 20px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  color: #4a5568;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-btn:hover:not(:disabled) {
  background: #f7fafc;
  border-color: #cbd5e0;
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.main-actions {
  display: flex;
  gap: 10px;
}

.check-btn,
.next-btn,
.finish-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.check-btn {
  background: #4299e1;
  color: white;
}

.check-btn:hover:not(:disabled) {
  background: #3182ce;
}

.check-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.next-btn {
  background: #48bb78;
  color: white;
}

.next-btn:hover {
  background: #38a169;
}

.finish-btn {
  background: #9f7aea;
  color: white;
}

.finish-btn:hover {
  background: #805ad5;
}

.skip-btn {
  padding: 10px 15px;
  background: transparent;
  color: #718096;
  border: none;
  font-weight: 500;
  cursor: pointer;
}

.skip-btn:hover {
  color: #4a5568;
}

/* 全局反馈提示 */
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

/* 动画效果 */
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

/* 响应式设计 */
@media (max-width: 1024px) {
  .exercise-content {
    flex-direction: column;
  }

  .content-right {
    width: 100%;
    min-width: auto;
  }

  .content-left {
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
  }
}

@media (max-width: 768px) {
  .exercise-header {
    padding: 15px 20px;
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .header-info {
    width: 100%;
    justify-content: space-between;
  }

  .content-left,
  .content-right {
    padding: 20px;
  }

  .article-container {
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

  .question-card {
    padding: 20px;
  }

  .navigation-controls {
    flex-direction: column;
    gap: 15px;
  }

  .main-actions {
    order: -1;
    width: 100%;
  }

  .check-btn,
  .next-btn,
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
}
</style>