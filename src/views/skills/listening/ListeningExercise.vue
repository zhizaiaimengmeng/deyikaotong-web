<template>
  <div class="listening-exercise">
    <!-- 顶部导航栏 -->
    <div class="exercise-header">
      <div class="header-content">
        <button class="back-btn" @click="goBack">
          <i class="fas fa-arrow-left"></i>
          <span>返回列表</span>
        </button>

        <div class="header-info">
          <div class="breadcrumb">
            <span class="level-tag">{{ currentLevel }}</span>
            <span class="separator">/</span>
            <span class="category">{{ currentCategory.name }}</span>
            <span class="separator">/</span>
            <span class="exercise active">{{ currentAudio.title }}</span>
          </div>

          <div class="progress-indicator">
            <span class="progress-text"
              >进度: {{ currentQuestionIndex + 1 }}/{{ questions.length }}</span
            >
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{
                  width:
                    ((currentQuestionIndex + 1) / questions.length) * 100 + '%',
                }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 - 紧凑布局 -->
    <div class="exercise-content">
      <!-- 音频播放区域 -->
      <div class="audio-section">
        <div class="audio-card">
          <div class="audio-header">
            <h2 class="audio-title">{{ currentAudio.title }}</h2>
            <div class="audio-meta">
              <span
                class="meta-tag difficulty"
                :class="currentAudio.difficulty"
              >
                {{ getDifficultyText(currentAudio.difficulty) }}
              </span>
              <span class="meta-tag duration">
                <i class="fas fa-clock"></i>
                {{ formatTime(currentAudio.audio_duration) }}
              </span>
            </div>
          </div>

          <div class="audio-player">
            <audio
              ref="audioElement"
              :src="currentAudio.audio_url"
              @timeupdate="updateProgress"
              @ended="onAudioEnded"
              @loadedmetadata="onAudioLoaded"
            ></audio>

            <div class="player-controls">
              <button
                class="control-btn play-btn"
                @click="togglePlay"
                :disabled="!hasAudio"
              >
                <i :class="isPlaying ? 'fas fa-pause' : 'fas fa-play'"></i>
              </button>

              <div class="progress-container" @click="seekAudio">
                <div class="time-display">{{ formatTime(currentTime) }}</div>
                <div class="progress-bar">
                  <div class="progress-track"></div>
                  <div
                    class="progress-fill"
                    :style="{ width: audioProgress + '%' }"
                  ></div>
                </div>
                <div class="time-display">{{ formatTime(totalDuration) }}</div>
              </div>

              <button
                class="control-btn repeat-btn"
                @click="restartAudio"
                :disabled="!hasAudio"
              >
                <i class="fas fa-redo"></i>
              </button>
            </div>

            <div v-if="audioError" class="audio-error">
              <i class="fas fa-exclamation-triangle"></i>
              <span>音频加载失败，请检查网络连接</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 题目区域 -->
      <div class="question-section">
        <div class="question-card">
          <div class="question-header">
            <h3>问题 {{ currentQuestionIndex + 1 }}</h3>
            <div class="question-points">
              {{ currentQuestion.points || 10 }} 分
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
                  <span class="option-text">{{ option.text }}</span>
                </div>
                <div v-if="showAnswer" class="option-feedback">
                  <i
                    v-if="option.correct"
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
          <transition name="fade">
            <div v-if="showAnswer" class="explanation-section">
              <div class="explanation-header">
                <i class="fas fa-lightbulb"></i>
                <span>答案解析</span>
              </div>
              <p class="explanation-text">{{ currentQuestion.explanation }}</p>
            </div>
          </transition>
        </div>

        <!-- 导航控制 -->
        <div class="navigation-controls">
          <button
            class="nav-btn prev-btn"
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
              :class="{ disabled: !isAnswerSelected }"
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

    <!-- 听力原文区域 -->
    <div class="transcript-section">
      <div class="transcript-header" @click="toggleTranscript">
        <h3>听力原文</h3>
        <i
          class="fas"
          :class="showTranscript ? 'fa-chevron-up' : 'fa-chevron-down'"
        ></i>
      </div>
      <transition name="slide">
        <div v-if="showTranscript" class="transcript-content">
          <p>{{ currentAudio.transcript }}</p>
        </div>
      </transition>
    </div>

    <!-- 全局反馈提示 -->
    <transition name="slide-down">
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
import { getAudioQuestions } from "@/api/question/question";
export default {
  name: "ListeningExercise",
  props: {
    audioId: {
      type: [String, Number],
      required: true,
    },
    categoryId: {
      type: [String, Number],
      required: true,
    },
    level: {
      type: String,
      default: "A1",
    },
    category: {
      type: Object,
      default: null,
    },
    audio: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      currentAudio: {},
      currentCategory: {},
      questions: [],
      currentQuestionIndex: 0,
      userAnswers: [],

      // 音频播放状态
      isPlaying: false,
      currentTime: 0,
      totalDuration: 0,
      audioProgress: 0,
      hasAudio: false,
      audioError: false,

      // 界面状态
      showTranscript: false,
      showAnswer: false,
      isAnswerCorrect: false,
    };
  },
  computed: {
    currentQuestion() {
      return this.questions[this.currentQuestionIndex] || {};
    },
    isAnswerSelected() {
      return this.userAnswers[this.currentQuestionIndex] !== undefined;
    },
    isLastQuestion() {
      return this.currentQuestionIndex === this.questions.length - 1;
    },
    currentLevel() {
      return this.level || "A1";
    },
  },
  methods: {
    // 音频控制方法
    togglePlay() {
      const audio = this.$refs.audioElement;
      if (this.isPlaying) {
        audio.pause();
      } else {
        audio.play().catch((error) => {
          console.error("播放失败:", error);
          this.audioError = true;
        });
      }
      this.isPlaying = !this.isPlaying;
    },

    restartAudio() {
      this.$refs.audioElement.currentTime = 0;
      this.currentTime = 0;
      this.audioProgress = 0;
      if (!this.isPlaying) {
        this.togglePlay();
      }
    },

    updateProgress() {
      const audio = this.$refs.audioElement;
      this.currentTime = audio.currentTime;
      this.audioProgress = this.totalDuration
        ? (this.currentTime / this.totalDuration) * 100
        : 0;
    },

    seekAudio(event) {
      const progressBar = event.currentTarget;
      const clickPosition = event.offsetX;
      const totalWidth = progressBar.offsetWidth;
      const seekTime = (clickPosition / totalWidth) * this.totalDuration;

      this.$refs.audioElement.currentTime = seekTime;
    },

    onAudioLoaded() {
      this.hasAudio = true;
      this.totalDuration =
        this.$refs.audioElement.duration || this.currentAudio.audio_duration;
    },

    onAudioEnded() {
      this.isPlaying = false;
    },

    // 答题方法
    selectOption(index) {
      if (!this.showAnswer) {
        this.$set(this.userAnswers, this.currentQuestionIndex, index);
      }
    },

    checkAnswer() {
      const selectedOption =
        this.currentQuestion.options[
          this.userAnswers[this.currentQuestionIndex]
        ];
      this.isAnswerCorrect = selectedOption?.correct || false;
      this.showAnswer = true;
    },

    nextQuestion() {
      if (this.currentQuestionIndex < this.questions.length - 1) {
        this.currentQuestionIndex++;
        this.showAnswer = false;
        this.restartAudio();
      }
    },

    prevQuestion() {
      if (this.currentQuestionIndex > 0) {
        this.currentQuestionIndex--;
        this.showAnswer = false;
        this.restartAudio();
      }
    },

    finishExercise() {
      // 计算得分
      const correctAnswers = this.userAnswers.filter((answer, index) => {
        if (answer === undefined) return false;
        return this.questions[index].options[answer].correct;
      }).length;

      const totalScore = correctAnswers * 10;
      const percentage = Math.round(
        (correctAnswers / this.questions.length) * 100
      );

      // 显示结果
      this.$message.success(
        `练习完成！正确: ${correctAnswers}/${this.questions.length} 得分: ${totalScore} (${percentage}%)`
      );

      // 返回上一页
      this.goBack();
    },

    goBack() {
      this.$router.go(-1);
    },

    toggleTranscript() {
      this.showTranscript = !this.showTranscript;
    },

    // 工具方法
    formatTime(seconds) {
      if (!seconds) return "0:00";
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
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

    getOptionClass(index) {
      if (!this.showAnswer) {
        return {
          selected: this.isOptionSelected(index),
        };
      }

      return {
        correct: this.currentQuestion.options[index].correct,
        incorrect: this.isOptionIncorrect(index),
        selected: this.isOptionSelected(index),
      };
    },

    isOptionSelected(index) {
      return this.userAnswers[this.currentQuestionIndex] === index;
    },

    isOptionIncorrect(index) {
      return (
        this.isOptionSelected(index) &&
        !this.currentQuestion.options[index].correct
      );
    },

    // 模拟数据加载
    async loadExerciseData() {
      //分类数据;
      this.currentCategory = this.category;

      // 音频数据
      this.currentAudio = this.audio;
      // this.currentAudio = {

      // 题目数据
      const data = { audioId: this.audio.id };
      try {
        const response = await getAudioQuestions(data);
        this.questions = this.convertQuestionData(response.data);
      } catch (error) {
        console.error("加载听力题目信息失败:", error);
      }

      this.userAnswers = new Array(this.questions.length);
    },

    convertQuestionData(dbQuestions) {
      return dbQuestions.map((question) => {
        const options = question.optionList.map((text, index) => {
          let isCorrect = false;
          // 处理 correct_answer 字段
          if (question.questionType === "single_choice") {
            const correctIndex = parseInt(question.correctAnswer);
            // 按索引处理
            isCorrect = index === correctIndex;
          } else if (question.questionType === "multiple_choice") {
            // 多选题：检查索引是否在正确答案数组中
            isCorrect = question.correctAnswer.includes(index);
          } else if (question.questionType === "true_false") {
            //按值匹配
            isCorrect = text === question.correctAnswer;
          }

          return { text, correct: isCorrect };
        });

        return {
          id: question.id,
          questionText: question.questionText,
          options,
          explanation: question.explanation,
          points: question.points,
        };
      });
    },
  },
  created() {
    this.currentCategory = this.$route.params.category;
    this.loadExerciseData();
  },
};
</script>

<style scoped>
.listening-exercise {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
  font-family: "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 1200px; /* 减少最大宽度 */
  margin: 0 auto;
}

/* 顶部导航栏 */
.exercise-header {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.header-content {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  gap: 20px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px 16px;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.back-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

.header-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 14px;
}

.level-tag {
  background: #e0f2fe;
  color: #0ea5e9;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 600;
}

.separator {
  opacity: 0.5;
}

.breadcrumb .active {
  color: #334155;
  font-weight: 600;
}

.progress-indicator {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-text {
  font-size: 14px;
  color: #64748b;
}

.progress-bar {
  width: 120px;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #059669);
  border-radius: 3px;
  transition: width 0.3s ease;
}

/* 主要内容区域 */
.exercise-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

/* 音频区域 */
.audio-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.audio-card {
  padding: 24px;
}

.audio-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.audio-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  line-height: 1.3;
}

.audio-meta {
  display: flex;
  gap: 12px;
}

.meta-tag {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.meta-tag.difficulty.easy {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #dcfce7;
}

.meta-tag.difficulty.medium {
  background: #fffbeb;
  color: #d97706;
  border: 1px solid #fef3c7;
}

.meta-tag.difficulty.hard {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fee2e2;
}

.meta-tag.duration {
  background: #f0f9ff;
  color: #0ea5e9;
  border: 1px solid #e0f2fe;
}

.audio-player {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.player-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.control-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.1rem;
  transition: all 0.2s;
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.control-btn.play-btn {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.control-btn.play-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
}

.control-btn.repeat-btn {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.control-btn.repeat-btn:hover:not(:disabled) {
  background: #e2e8f0;
}

.progress-container {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.time-display {
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 600;
  min-width: 40px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  position: relative;
  cursor: pointer;
}

.progress-track {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 3px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #059669);
  border-radius: 3px;
  transition: width 0.1s;
}

.audio-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #dc2626;
  font-size: 0.875rem;
}

/* 题目区域 */
.question-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.question-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.question-header {
  padding: 20px 24px;
  background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.question-header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.question-points {
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
}

.question-content {
  padding: 24px;
}

.question-text {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 24px 0;
  line-height: 1.5;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.option:hover {
  border-color: #d1d5db;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.option.selected {
  border-color: #3b82f6;
  background: #eff6ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.option.correct {
  border-color: #10b981;
  background: #ecfdf5;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
}

.option.incorrect {
  border-color: #ef4444;
  background: #fef2f2;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
}

.option-selector {
  margin-right: 12px;
}

.selector-circle {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #d1d5db;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.option.selected .selector-circle {
  border-color: #3b82f6;
  background: #3b82f6;
}

.option.correct .selector-circle {
  border-color: #10b981;
  background: #10b981;
}

.option.incorrect .selector-circle {
  border-color: #ef4444;
  background: #ef4444;
}

.selector-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: white;
  opacity: 0;
  transition: opacity 0.2s;
}

.option.selected .selector-dot,
.option.correct .selector-dot,
.option.incorrect .selector-dot {
  opacity: 1;
}

.option-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
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
  color: #10b981;
  font-size: 1.1rem;
}

.incorrect-icon {
  color: #ef4444;
  font-size: 1.1rem;
}

/* 答案解析 */
.explanation-section {
  margin-top: 20px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid #8b5cf6;
}

.explanation-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: #6d28d9;
  font-weight: 600;
}

.explanation-text {
  margin: 0;
  color: #475569;
  line-height: 1.5;
}

/* 导航控制 */
.navigation-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 20px 24px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.nav-btn,
.check-btn,
.next-btn,
.finish-btn,
.skip-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-btn:disabled,
.check-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.prev-btn {
  background: #f8fafc;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.prev-btn:hover:not(:disabled) {
  background: #f1f5f9;
  transform: translateY(-2px);
}

.main-actions {
  display: flex;
  gap: 12px;
}

.check-btn {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.check-btn:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
}

.next-btn {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.next-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.finish-btn {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.finish-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(139, 92, 246, 0.4);
}

.skip-btn {
  background: transparent;
  color: #64748b;
  border: 1px solid #d1d5db;
}

.skip-btn:hover {
  background: #f8fafc;
  color: #475569;
}

/* 听力原文区域 */
.transcript-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.transcript-header {
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: background 0.2s;
}

.transcript-header:hover {
  background: #f8fafc;
}

.transcript-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #374151;
}

.transcript-content {
  padding: 0 24px 20px;
}

.transcript-content p {
  margin: 0;
  line-height: 1.6;
  color: #4b5563;
  font-size: 0.95rem;
}

/* 全局反馈提示 */
.global-feedback {
  position: fixed;
  top: 20px;
  right: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  padding: 16px;
  max-width: 320px;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 12px;
}

.global-feedback.correct {
  border-left: 4px solid #10b981;
}

.global-feedback.incorrect {
  border-left: 4px solid #ef4444;
}

.feedback-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.feedback-content i {
  font-size: 1.5rem;
}

.global-feedback.correct .feedback-content i {
  color: #10b981;
}

.global-feedback.incorrect .feedback-content i {
  color: #ef4444;
}

.feedback-text h4 {
  margin: 0 0 4px 0;
  font-size: 1rem;
}

.feedback-text p {
  margin: 0;
  font-size: 0.875rem;
  color: #64748b;
}

.close-feedback {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}

.close-feedback:hover {
  background: #f3f4f6;
  color: #6b7280;
}

/* 动画效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
  max-height: 200px;
}

.slide-enter,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .listening-exercise {
    padding: 15px;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .header-info {
    width: 100%;
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .audio-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .player-controls {
    flex-wrap: wrap;
  }

  .progress-container {
    order: 3;
    width: 100%;
    margin-top: 15px;
  }

  .navigation-controls {
    flex-direction: column;
    gap: 15px;
  }

  .main-actions {
    order: -1;
  }

  .nav-btn,
  .check-btn,
  .next-btn,
  .finish-btn,
  .skip-btn {
    width: 100%;
    justify-content: center;
  }

  .global-feedback {
    position: relative;
    top: auto;
    right: auto;
    max-width: none;
    margin: 0 0 15px 0;
  }
}
</style>