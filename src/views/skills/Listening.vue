<template>
  <div class="listening-training">
    <!-- 顶部导航 -->
    <div class="header">
      <div class="logo">
        <span class="logo-icon">🇩🇪</span>
        <span class="logo-text">德易考通</span>
      </div>
      <div class="user-actions">
        <button class="btn btn-outline">学习中心</button>
        <button class="btn btn-primary">我的进度</button>
      </div>
    </div>

    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">德语听力训练</h1>
      <p class="page-subtitle">
        选择适合您水平的听力练习，提高德语听力理解能力
      </p>
    </div>

    <!-- 主要内容区域 -->
    <div class="content">
      <!-- 左侧导航 -->
      <div class="sidebar">
        <div class="nav-section">
          <h3 class="nav-title">基础训练</h3>
          <ul class="nav-list">
            <li
              v-for="lesson in basicLessons"
              :key="lesson.id"
              class="nav-item"
              :class="{ active: currentLesson === lesson.id }"
              @click="selectLesson(lesson.id)"
            >
              <i :class="lesson.icon"></i>
              <span>{{ lesson.title }}</span>
              <span class="status-indicator" :class="lesson.status"></span>
            </li>
          </ul>
        </div>

        <div class="nav-section">
          <h3 class="nav-title">进阶训练</h3>
          <ul class="nav-list">
            <li
              v-for="lesson in advancedLessons"
              :key="lesson.id"
              class="nav-item"
              :class="{
                active: currentLesson === lesson.id,
                locked: lesson.locked,
              }"
              @click="!lesson.locked && selectLesson(lesson.id)"
            >
              <i :class="lesson.icon"></i>
              <span>{{ lesson.title }}</span>
              <span class="status-indicator" :class="lesson.status"></span>
              <i v-if="lesson.locked" class="fas fa-lock"></i>
            </li>
          </ul>
        </div>
      </div>

      <!-- 中央练习区域 -->
      <div class="main-content">
        <div class="exercise-card">
          <div class="exercise-header">
            <h2 class="exercise-title">{{ currentExercise.title }}</h2>
            <div class="exercise-meta">
              <span class="difficulty"
                >难度: {{ currentExercise.difficulty }}</span
              >
              <span class="duration">预计: {{ currentExercise.duration }}</span>
            </div>
          </div>

          <div class="exercise-content">
            <!-- 音频选择器 -->
            <div
              class="audio-selector"
              v-if="currentExercise.audios && currentExercise.audios.length > 1"
            >
              <div class="audio-tabs">
                <button
                  v-for="(audio, index) in currentExercise.audios"
                  :key="index"
                  class="audio-tab"
                  :class="{ active: currentAudioIndex === index }"
                  @click="selectAudio(index)"
                >
                  音频 {{ index + 1 }}
                </button>
              </div>
            </div>

            <!-- 音频播放器 -->
            <div class="audio-player">
              <div class="audio-controls">
                <button class="play-btn" @click="togglePlay">
                  <i :class="isPlaying ? 'fas fa-pause' : 'fas fa-play'"></i>
                </button>
                <div class="progress-container">
                  <div class="progress-bar">
                    <div
                      class="progress"
                      :style="{ width: audioProgress + '%' }"
                    ></div>
                  </div>
                  <div class="time-display">
                    {{ formatTime(currentTime) }} /
                    {{ formatTime(currentAudio.duration) }}
                  </div>
                </div>
                <button class="repeat-btn" @click="restartAudio">
                  <i class="fas fa-redo"></i>
                </button>
              </div>
            </div>

            <!-- 题目导航 -->
            <div class="question-navigation">
              <button
                class="nav-btn prev-btn"
                @click="prevQuestion"
                :disabled="currentQuestionIndex === 0"
              >
                <i class="fas fa-chevron-left"></i> 上一题
              </button>

              <div class="question-indicator">
                <span class="current-question">{{
                  currentQuestionIndex + 1
                }}</span>
                <span class="total-questions"
                  >/ {{ currentQuestions.length }}</span
                >
              </div>

              <button
                class="nav-btn next-btn"
                @click="nextQuestion"
                :disabled="currentQuestionIndex === currentQuestions.length - 1"
              >
                下一题 <i class="fas fa-chevron-right"></i>
              </button>
            </div>

            <!-- 当前题目 -->
            <div class="question-container">
              <h3 class="question-title">
                问题 {{ currentQuestionIndex + 1 }}
              </h3>
              <p class="question-text">{{ currentQuestion.text }}</p>

              <div class="options">
                <label
                  v-for="(option, index) in currentQuestion.options"
                  :key="index"
                  :class="{
                    selected: selectedAnswers[currentQuestionIndex] === index,
                    correct: showFeedback && option.correct,
                    incorrect:
                      showFeedback &&
                      !option.correct &&
                      selectedAnswers[currentQuestionIndex] === index,
                  }"
                  @click="selectAnswer(index)"
                >
                  <input
                    type="radio"
                    :name="'q' + currentQuestionIndex"
                    :value="index"
                    v-model="selectedAnswers[currentQuestionIndex]"
                    :disabled="showFeedback"
                  />
                  <span class="option-text">{{ option.text }}</span>
                </label>
              </div>
            </div>

            <!-- 控制按钮 -->
            <div class="exercise-controls">
              <button class="btn btn-secondary" @click="resetExercise">
                重听
              </button>
              <button
                class="btn btn-primary"
                @click="checkAnswers"
                :disabled="!isAnswerSelected || showFeedback"
              >
                检查答案
              </button>
              <button
                class="btn btn-success"
                @click="finishExercise"
                v-if="showFeedback && isLastQuestion"
              >
                完成练习
              </button>
            </div>

            <!-- 反馈区域 -->
            <div class="feedback-container" v-if="showFeedback">
              <div
                class="feedback-card"
                :class="{
                  correct: isAnswerCorrect,
                  incorrect: !isAnswerCorrect,
                }"
              >
                <div class="feedback-icon">
                  <i
                    :class="isAnswerCorrect ? 'fas fa-check' : 'fas fa-times'"
                  ></i>
                </div>
                <div class="feedback-content">
                  <h4>{{ isAnswerCorrect ? "回答正确！" : "回答不正确" }}</h4>
                  <p>{{ currentQuestion.explanation }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧工具 -->
      <div class="tools-sidebar">
        <div class="tool-card">
          <h4 class="tool-title">
            <i class="fas fa-lightbulb"></i>
            词汇提示
          </h4>
          <ul class="vocabulary-list">
            <li v-for="word in vocabularyHint" :key="word">{{ word }}</li>
          </ul>
        </div>

        <div class="tool-card">
          <h4 class="tool-title">
            <i class="fas fa-graduation-cap"></i>
            学习技巧
          </h4>
          <p class="learning-tips">{{ learningTips }}</p>
        </div>

        <div class="tool-card">
          <h4 class="tool-title">
            <i class="fas fa-chart-bar"></i>
            进度统计
          </h4>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-value">{{ completedExercises }}</span>
              <span class="stat-label">已完成练习</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ correctRate }}%</span>
              <span class="stat-label">正确率</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ currentStreak }}</span>
              <span class="stat-label">连续正确</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ListeningTraining",
  data() {
    return {
      currentLesson: 3,
      currentExercise: {},
      currentAudioIndex: 0,
      currentQuestionIndex: 0,
      selectedAnswers: [],
      isPlaying: false,
      currentTime: 0,
      audioProgress: 0,
      audioInterval: null,
      showFeedback: false,
      isAnswerCorrect: false,
      completedExercises: 12,
      correctAnswers: 42,
      totalAnswers: 50,
      currentStreak: 5,
      basicLessons: [
        {
          id: 1,
          title: "基础对话理解",
          icon: "fas fa-comments",
          status: "completed",
        },
        {
          id: 2,
          title: "数字与时间",
          icon: "fas fa-clock",
          status: "completed",
        },
        {
          id: 3,
          title: "日常生活场景",
          icon: "fas fa-home",
          status: "in-progress",
        },
        {
          id: 4,
          title: "问路与指示",
          icon: "fas fa-map-marker-alt",
          status: "not-started",
        },
      ],
      advancedLessons: [
        {
          id: 5,
          title: "新闻广播",
          icon: "fas fa-newspaper",
          status: "not-started",
          locked: false,
        },
        {
          id: 6,
          title: "学术讲座",
          icon: "fas fa-graduation-cap",
          status: "not-started",
          locked: true,
        },
        {
          id: 7,
          title: "商务对话",
          icon: "fas fa-briefcase",
          status: "not-started",
          locked: true,
        },
      ],
      vocabularyHint: ["Bahnhof", "Einkaufen", "Restaurant", "U-Bahn"],
      learningTips:
        "尝试先听整体内容，再关注细节。多次重复听难点部分，注意说话者的语调和重音。",
    };
  },
  computed: {
    currentAudio() {
      return this.currentExercise.audios
        ? this.currentExercise.audios[this.currentAudioIndex]
        : {};
    },
    currentQuestions() {
      return this.currentAudio.questions || [];
    },
    currentQuestion() {
      return this.currentQuestions[this.currentQuestionIndex] || {};
    },
    isAnswerSelected() {
      return (
        this.selectedAnswers[this.currentQuestionIndex] !== null &&
        this.selectedAnswers[this.currentQuestionIndex] !== undefined
      );
    },
    isLastQuestion() {
      return this.currentQuestionIndex === this.currentQuestions.length - 1;
    },
    correctRate() {
      return this.totalAnswers > 0
        ? Math.round((this.correctAnswers / this.totalAnswers) * 100)
        : 0;
    },
  },
  created() {
    this.loadExercise(3);
  },
  methods: {
    selectLesson(lessonId) {
      this.currentLesson = lessonId;
      this.loadExercise(lessonId);
    },
    loadExercise(lessonId) {
      // 模拟API调用获取练习数据
      this.currentExercise = {
        id: lessonId,
        title: "日常生活场景对话",
        difficulty: "中等",
        duration: "15分钟",
        audios: [
          {
            id: 1,
            title: "对话一：朋友见面",
            duration: 90, // 秒
            questions: [
              {
                text: "对话中提到了什么时间见面？",
                options: [
                  { text: "10:00", correct: false },
                  { text: "14:30", correct: true },
                  { text: "16:45", correct: false },
                  { text: "19:00", correct: false },
                ],
                explanation: '对话中明确提到："我们下午两点半见面"',
              },
              {
                text: "他们在哪里见面？",
                options: [
                  { text: "咖啡馆", correct: false },
                  { text: "图书馆", correct: true },
                  { text: "公园", correct: false },
                  { text: "火车站", correct: false },
                ],
                explanation: '对话中明确提到："在市中心图书馆门口见面"',
              },
            ],
          },
          {
            id: 2,
            title: "对话二：餐厅点餐",
            duration: 120, // 秒
            questions: [
              {
                text: "女士点了什么食物？",
                options: [
                  { text: "意大利面", correct: false },
                  { text: "沙拉", correct: true },
                  { text: "牛排", correct: false },
                  { text: "鱼", correct: false },
                ],
                explanation: '对话中明确提到："我想要一份沙拉"',
              },
              {
                text: "他们点了什么饮料？",
                options: [
                  { text: "咖啡", correct: false },
                  { text: "茶", correct: false },
                  { text: "水", correct: true },
                  { text: "果汁", correct: false },
                ],
                explanation: '对话中明确提到："请给我们两杯水"',
              },
              {
                text: "他们的账单是多少钱？",
                options: [
                  { text: "15欧元", correct: false },
                  { text: "22欧元", correct: false },
                  { text: "28欧元", correct: true },
                  { text: "35欧元", correct: false },
                ],
                explanation: '对话中明确提到："总共是28欧元"',
              },
            ],
          },
        ],
      };

      this.currentAudioIndex = 0;
      this.currentQuestionIndex = 0;
      this.resetExercise();
    },
    selectAudio(audioIndex) {
      this.currentAudioIndex = audioIndex;
      this.currentQuestionIndex = 0;
      this.resetExercise();
    },
    resetExercise() {
      this.selectedAnswers = new Array(this.currentQuestions.length).fill(null);
      this.resetAudio();
      this.showFeedback = false;
    },
    togglePlay() {
      this.isPlaying = !this.isPlaying;
      if (this.isPlaying) {
        this.startAudioProgress();
      } else {
        clearInterval(this.audioInterval);
      }
    },
    restartAudio() {
      this.resetAudio();
      this.togglePlay();
    },
    startAudioProgress() {
      clearInterval(this.audioInterval);

      this.audioInterval = setInterval(() => {
        if (this.currentTime < this.currentAudio.duration) {
          this.currentTime++;
          this.audioProgress =
            (this.currentTime / this.currentAudio.duration) * 100;
        } else {
          clearInterval(this.audioInterval);
          this.isPlaying = false;
        }
      }, 1000);
    },
    resetAudio() {
      this.currentTime = 0;
      this.audioProgress = 0;
      this.isPlaying = false;
      clearInterval(this.audioInterval);
    },
    formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    },
    selectAnswer(answerIndex) {
      if (!this.showFeedback) {
        this.$set(this.selectedAnswers, this.currentQuestionIndex, answerIndex);
      }
    },
    checkAnswers() {
      const selectedOption =
        this.currentQuestion.options[
          this.selectedAnswers[this.currentQuestionIndex]
        ];
      this.isAnswerCorrect = selectedOption.correct;
      this.showFeedback = true;

      // 更新统计数据
      this.totalAnswers++;
      if (this.isAnswerCorrect) {
        this.correctAnswers++;
        this.currentStreak++;
      } else {
        this.currentStreak = 0;
      }
    },
    nextQuestion() {
      if (this.currentQuestionIndex < this.currentQuestions.length - 1) {
        this.currentQuestionIndex++;
        this.showFeedback = false;
      }
    },
    prevQuestion() {
      if (this.currentQuestionIndex > 0) {
        this.currentQuestionIndex--;
        this.showFeedback = false;
      }
    },
    finishExercise() {
      // 完成练习的逻辑
      alert("练习完成！");
      this.completedExercises++;
    },
  },
  beforeUnmount() {
    clearInterval(this.audioInterval);
  },
};
</script>

<style scoped>
.listening-training {
  padding: 20px;
  background-color: #f8fafc;
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.logo {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logo-icon {
  font-size: 28px;
}

.logo-text {
  font-size: 24px;
  font-weight: 700;
  color: #4f46e5;
}

.user-actions {
  display: flex;
  gap: 15px;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #4f46e5;
  color: white;
  border: none;
}

.btn-primary:hover {
  background: #4338ca;
}

.btn-outline {
  background: transparent;
  color: #4f46e5;
  border: 1px solid #e5e7eb;
}

.btn-outline:hover {
  background: #f1f5f9;
}

.btn-secondary {
  background: #e5e7eb;
  color: #4b5563;
  border: none;
}

.btn-secondary:hover {
  background: #d1d5db;
}

.btn-success {
  background: #10b981;
  color: white;
  border: none;
}

.btn-success:hover {
  background: #059669;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 10px;
}

.page-subtitle {
  font-size: 1.2rem;
  color: #6b7280;
  max-width: 600px;
  margin: 0 auto;
}

.content {
  display: grid;
  grid-template-columns: 250px 1fr 300px;
  gap: 25px;
}

.sidebar {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.nav-section {
  margin-bottom: 30px;
}

.nav-title {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e5e7eb;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  padding: 12px 15px;
  margin-bottom: 8px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
  position: relative;
}

.nav-item:hover {
  background: #e5e7eb;
}

.nav-item.active {
  background: #4f46e5;
  color: white;
}

.nav-item.locked {
  opacity: 0.5;
  cursor: not-allowed;
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-left: auto;
}

.status-indicator.completed {
  background: #10b981;
}

.status-indicator.in-progress {
  background: #f59e0b;
}

.status-indicator.not-started {
  background: #9ca3af;
}

.main-content {
  min-height: 600px;
}

.exercise-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  height: 100%;
}

.exercise-header {
  padding: 25px 25px 0;
}

.exercise-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 10px;
}

.exercise-meta {
  display: flex;
  gap: 20px;
  color: #6b7280;
  font-size: 0.9rem;
  margin-bottom: 20px;
}

.exercise-content {
  padding: 0 25px 25px;
}

.audio-selector {
  margin-bottom: 20px;
}

.audio-tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
}

.audio-tab {
  padding: 10px 20px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-weight: 500;
  color: #6b7280;
  transition: all 0.3s ease;
}

.audio-tab:hover {
  color: #4f46e5;
}

.audio-tab.active {
  color: #4f46e5;
  border-bottom-color: #4f46e5;
}

.audio-player {
  margin-bottom: 30px;
}

.audio-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.play-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #4f46e5;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: all 0.3s ease;
}

.play-btn:hover {
  background: #4338ca;
  transform: scale(1.05);
}

.progress-container {
  flex: 1;
}

.progress-bar {
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress {
  height: 100%;
  background: #4f46e5;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.time-display {
  font-size: 0.9rem;
  color: #6b7280;
  text-align: center;
}

.repeat-btn {
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.3s ease;
}

.repeat-btn:hover {
  color: #4f46e5;
  transform: rotate(15deg);
}

.question-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.nav-btn {
  padding: 10px 15px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.prev-btn {
  background: #f1f5f9;
  color: #4b5563;
  border: 1px solid #e5e7eb;
}

.prev-btn:hover:not(:disabled) {
  background: #e5e7eb;
}

.next-btn {
  background: #4f46e5;
  color: white;
  border: none;
}

.next-btn:hover:not(:disabled) {
  background: #4338ca;
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.question-indicator {
  font-size: 18px;
  font-weight: 600;
  color: #4b5563;
}

.current-question {
  color: #4f46e5;
}

.question-container {
  margin-bottom: 30px;
}

.question-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 10px;
}

.question-text {
  font-size: 16px;
  margin-bottom: 20px;
  line-height: 1.5;
  color: #374151;
}

.options {
  display: grid;
  gap: 12px;
}

.options label {
  display: flex;
  align-items: center;
  padding: 15px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.options label:hover {
  border-color: #4f46e5;
  background: #f8fafc;
}

.options label.selected {
  border-color: #4f46e5;
  background: #eef2ff;
}

.options label.correct {
  border-color: #10b981;
  background: #ecfdf5;
}

.options label.incorrect {
  border-color: #ef4444;
  background: #fef2f2;
}

.options input {
  margin-right: 12px;
}

.exercise-controls {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
}

.feedback-container {
  margin-top: 30px;
}

.feedback-card {
  padding: 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.feedback-card.correct {
  background: #ecfdf5;
  border: 1px solid #10b981;
}

.feedback-card.incorrect {
  background: #fef2f2;
  border: 1px solid #ef4444;
}

.feedback-icon {
  font-size: 24px;
}

.feedback-card.correct .feedback-icon {
  color: #10b981;
}

.feedback-card.incorrect .feedback-icon {
  color: #ef4444;
}

.feedback-content h4 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 5px;
}

.tools-sidebar {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.tool-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.tool-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.vocabulary-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.vocabulary-list li {
  padding: 8px 0;
  border-bottom: 1px solid #f1f5f9;
  color: #374151;
}

.vocabulary-list li:last-child {
  border-bottom: none;
}

.learning-tips {
  color: #6b7280;
  line-height: 1.6;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.stat-item {
  text-align: center;
  padding: 15px;
  background: #f8fafc;
  border-radius: 8px;
}

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #4f46e5;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .content {
    grid-template-columns: 1fr;
    grid-template-areas:
      "sidebar"
      "main"
      "tools";
  }

  .sidebar {
    grid-area: sidebar;
  }

  .main-content {
    grid-area: main;
  }

  .tools-sidebar {
    grid-area: tools;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .tool-card {
    flex: 1;
    min-width: 250px;
  }
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 15px;
  }

  .exercise-meta {
    flex-direction: column;
    gap: 5px;
  }

  .audio-controls {
    flex-wrap: wrap;
  }

  .progress-container {
    order: 3;
    width: 100%;
  }

  .question-navigation {
    flex-direction: column;
    gap: 15px;
  }

  .exercise-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .tools-sidebar {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 2rem;
  }

  .nav-item {
    padding: 10px;
  }

  .audio-tabs {
    flex-wrap: wrap;
  }

  .audio-tab {
    flex: 1;
    min-width: 100px;
    text-align: center;
  }
}
</style>