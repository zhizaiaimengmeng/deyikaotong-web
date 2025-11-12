<template>
  <div class="listening-exercise">
    <!-- 顶部导航 -->
    <div class="exercise-header">
      <button class="back-btn" @click="goBackToList">
        <i class="fas fa-arrow-left"></i>
      </button>
      <h2 class="exercise-title">{{ currentExercise.title }}</h2>
      <div class="exercise-progress">
        <span
          >{{ currentQuestionIndex + 1 }}/{{
            currentExercise.questions.length
          }}</span
        >
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
              class="progress-fill"
              :style="{ width: audioProgress + '%' }"
            ></div>
          </div>
          <div class="time-display">
            {{ formatTime(currentTime) }} /
            {{ formatTime(currentExercise.audioDuration) }}
          </div>
        </div>
        <button class="repeat-btn" @click="restartAudio">
          <i class="fas fa-redo"></i>
        </button>
      </div>
    </div>

    <!-- 题目区域 -->
    <div class="questions-container">
      <div
        v-for="(question, index) in currentExercise.questions"
        :key="index"
        class="question-block"
        v-show="currentQuestionIndex === index"
      >
        <h3 class="question-title">问题 {{ index + 1 }}</h3>
        <p class="question-text">{{ question.text }}</p>

        <div class="options">
          <label
            v-for="(option, optIndex) in question.options"
            :key="optIndex"
            :class="{
              selected: selectedAnswers[index] === optIndex,
              correct: showFeedback && option.correct,
              incorrect:
                showFeedback &&
                !option.correct &&
                selectedAnswers[index] === optIndex,
            }"
            @click="selectAnswer(index, optIndex)"
          >
            <input
              type="radio"
              :name="'q' + index"
              :value="optIndex"
              v-model="selectedAnswers[index]"
              :disabled="showFeedback"
            />
            <span class="option-text">{{ option.text }}</span>
          </label>
        </div>
      </div>
    </div>

    <!-- 导航控制 -->
    <div class="navigation-controls">
      <button
        class="nav-btn prev-btn"
        @click="prevQuestion"
        :disabled="currentQuestionIndex === 0"
      >
        <i class="fas fa-chevron-left"></i> 上一题
      </button>

      <button
        class="check-btn"
        @click="checkAnswers"
        v-if="!showFeedback"
        :disabled="!isAnswerSelected"
      >
        检查答案
      </button>

      <button
        class="nav-btn next-btn"
        @click="nextQuestion"
        v-if="showFeedback"
        :disabled="
          currentQuestionIndex === currentExercise.questions.length - 1
        "
      >
        下一题 <i class="fas fa-chevron-right"></i>
      </button>

      <button
        class="finish-btn"
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
        :class="{ correct: isAnswerCorrect, incorrect: !isAnswerCorrect }"
      >
        <div class="feedback-icon">
          <i :class="isAnswerCorrect ? 'fas fa-check' : 'fas fa-times'"></i>
        </div>
        <div class="feedback-content">
          <h4>{{ isAnswerCorrect ? "回答正确！" : "回答不正确" }}</h4>
          <p>{{ currentQuestion.explanation }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ListeningExercise",
  props: {
    exerciseId: {
      type: [String, Number],
      required: true,
    },
    level: {
      type: String,
      default: "A1",
    },
  },
  data() {
    return {
      currentExercise: {},
      currentQuestionIndex: 0,
      selectedAnswers: [],
      isPlaying: false,
      currentTime: 0,
      audioProgress: 0,
      audioInterval: null,
      showFeedback: false,
      isAnswerCorrect: false,
      exercises: [
        {
          id: 1,
          title: "日常对话理解",
          difficulty: "简单",
          duration: "10分钟",
          audioDuration: 90,
          questions: [
            {
              text: "对话中提到了什么时间见面？",
              options: [
                { text: "10:00", correct: false },
                { text: "14:30", correct: true },
                { text: "16:45", correct: false },
                { text: "19:00", correct: false },
              ],
              explanation: "对话中明确提到：'我们下午两点半见面'",
            },
            {
              text: "他们在哪里见面？",
              options: [
                { text: "咖啡馆", correct: false },
                { text: "图书馆", correct: true },
                { text: "公园", correct: false },
                { text: "火车站", correct: false },
              ],
              explanation: "对话中明确提到：'在市中心图书馆门口见面'",
            },
          ],
        },
        {
          id: 2,
          title: "购物场景对话",
          difficulty: "中等",
          duration: "15分钟",
          audioDuration: 120,
          questions: [
            {
              text: "女士点了什么食物？",
              options: [
                { text: "意大利面", correct: false },
                { text: "沙拉", correct: true },
                { text: "牛排", correct: false },
                { text: "鱼", correct: false },
              ],
              explanation: "对话中明确提到：'我想要一份沙拉'",
            },
            {
              text: "他们点了什么饮料？",
              options: [
                { text: "咖啡", correct: false },
                { text: "茶", correct: false },
                { text: "水", correct: true },
                { text: "果汁", correct: false },
              ],
              explanation: "对话中明确提到：'请给我们两杯水'",
            },
            {
              text: "他们的账单是多少钱？",
              options: [
                { text: "15欧元", correct: false },
                { text: "22欧元", correct: false },
                { text: "28欧元", correct: true },
                { text: "35欧元", correct: false },
              ],
              explanation: "对话中明确提到：'总共是28欧元'",
            },
          ],
        },
        {
          id: 3,
          title: "餐厅点餐对话",
          difficulty: "中等",
          duration: "15分钟",
          audioDuration: 150,
          questions: [
            {
              text: "男士点了什么主菜？",
              options: [
                { text: "牛排", correct: true },
                { text: "鱼", correct: false },
                { text: "沙拉", correct: false },
                { text: "意大利面", correct: false },
              ],
              explanation: "对话中明确提到：'我要一份牛排'",
            },
            {
              text: "他们点了什么饮料？",
              options: [
                { text: "水", correct: true },
                { text: "红酒", correct: false },
                { text: "啤酒", correct: false },
                { text: "果汁", correct: false },
              ],
              explanation: "对话中明确提到：'请给我们两杯水'",
            },
          ],
        },
        {
          id: 4,
          title: "问路与指示",
          difficulty: "较难",
          duration: "20分钟",
          audioDuration: 180,
          questions: [
            {
              text: "如何到达火车站？",
              options: [
                { text: "坐公交车", correct: false },
                { text: "坐地铁", correct: true },
                { text: "步行", correct: false },
                { text: "坐出租车", correct: false },
              ],
              explanation: "对话中明确提到：'您可以坐地铁去火车站'",
            },
            {
              text: "需要多长时间？",
              options: [
                { text: "5分钟", correct: false },
                { text: "10分钟", correct: false },
                { text: "15分钟", correct: true },
                { text: "20分钟", correct: false },
              ],
              explanation: "对话中明确提到：'大约需要15分钟'",
            },
          ],
        },
      ],
    };
  },
  computed: {
    currentQuestion() {
      return this.currentExercise.questions
        ? this.currentExercise.questions[this.currentQuestionIndex]
        : {};
    },
    isAnswerSelected() {
      return (
        this.selectedAnswers[this.currentQuestionIndex] !== null &&
        this.selectedAnswers[this.currentQuestionIndex] !== undefined
      );
    },
    isLastQuestion() {
      return (
        this.currentQuestionIndex === this.currentExercise.questions.length - 1
      );
    },
  },
  created() {
    this.loadExercise();
  },
  methods: {
    loadExercise() {
      const exerciseId = parseInt(this.exerciseId);
      this.currentExercise =
        this.exercises.find((ex) => ex.id === exerciseId) || this.exercises[0];
      this.selectedAnswers = new Array(
        this.currentExercise.questions.length
      ).fill(null);
    },
    goBackToList() {
      this.$router.push({
        name: "ListeningList",
        params: { level: this.level },
      });
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
        if (this.currentTime < this.currentExercise.audioDuration) {
          this.currentTime++;
          this.audioProgress =
            (this.currentTime / this.currentExercise.audioDuration) * 100;
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
    selectAnswer(questionIndex, answerIndex) {
      if (!this.showFeedback) {
        this.$set(this.selectedAnswers, questionIndex, answerIndex);
      }
    },
    checkAnswers() {
      const selectedOption =
        this.currentQuestion.options[
          this.selectedAnswers[this.currentQuestionIndex]
        ];
      this.isAnswerCorrect = selectedOption.correct;
      this.showFeedback = true;
    },
    nextQuestion() {
      if (
        this.currentQuestionIndex <
        this.currentExercise.questions.length - 1
      ) {
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
      alert("练习完成！");
      this.goBackToList();
    },
  },
  beforeUnmount() {
    clearInterval(this.audioInterval);
  },
};
</script>

<style scoped>
.listening-exercise {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  min-height: 100vh;
}

/* 顶部导航 */
.exercise-header {
  display: flex;
  align-items: center;
  padding: 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.back-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
  margin-right: 1rem;
  transition: all 0.3s;
}

.back-btn:hover {
  background: #e2e8f0;
}

.exercise-title {
  flex: 1;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
}

.exercise-progress {
  background: #e0f2fe;
  color: #0ea5e9;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 500;
  font-size: 0.875rem;
}

/* 音频播放器 */
.audio-player {
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.audio-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.play-btn {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #0ea5e9;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  transition: all 0.3s;
}

.play-btn:hover {
  background: #0284c7;
  transform: scale(1.05);
}

.progress-container {
  flex: 1;
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
  background: #0ea5e9;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.time-display {
  font-size: 0.875rem;
  color: #64748b;
  text-align: center;
}

.repeat-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  transition: all 0.3s;
}

.repeat-btn:hover {
  color: #0ea5e9;
  transform: rotate(15deg);
}

/* 题目区域 */
.questions-container {
  padding: 20px;
}

.question-block {
  margin-bottom: 2rem;
}

.question-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1rem;
}

.question-text {
  font-size: 1.125rem;
  color: #334155;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.options {
  display: grid;
  gap: 0.75rem;
}

.options label {
  display: flex;
  align-items: center;
  padding: 1rem 1.25rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.options label:hover {
  border-color: #0ea5e9;
  background: #f8fafc;
}

.options label.selected {
  border-color: #0ea5e9;
  background: #e0f2fe;
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
  margin-right: 0.75rem;
}

/* 导航控制 */
.navigation-controls {
  display: flex;
  justify-content: space-between;
  padding: 20px;
  border-top: 1px solid #e2e8f0;
}

.nav-btn {
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s;
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.prev-btn {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.prev-btn:hover:not(:disabled) {
  background: #e2e8f0;
}

.next-btn {
  background: #0ea5e9;
  color: white;
  border: none;
}

.next-btn:hover:not(:disabled) {
  background: #0284c7;
}

.check-btn {
  padding: 0.75rem 1.5rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
}

.check-btn:hover:not(:disabled) {
  background: #059669;
}

.check-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.finish-btn {
  padding: 0.75rem 1.5rem;
  background: #8b5cf6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
}

.finish-btn:hover {
  background: #7c3aed;
}

/* 反馈区域 */
.feedback-container {
  padding: 0 20px 20px;
}

.feedback-card {
  padding: 1.5rem;
  border-radius: 12px;
  display: flex;
  gap: 1rem;
  align-items: center;
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
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.feedback-card.correct .feedback-icon {
  background: #10b981;
  color: white;
}

.feedback-card.incorrect .feedback-icon {
  background: #ef4444;
  color: white;
}

.feedback-content h4 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.feedback-card.correct h4 {
  color: #047857;
}

.feedback-card.incorrect h4 {
  color: #b91c1c;
}

.feedback-content p {
  color: #475569;
  line-height: 1.5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .exercise-header {
    padding: 1rem;
  }

  .exercise-title {
    font-size: 1.25rem;
  }

  .audio-player {
    padding: 1rem;
  }

  .audio-controls {
    flex-wrap: wrap;
  }

  .play-btn {
    width: 50px;
    height: 50px;
  }

  .progress-container {
    order: 3;
    width: 100%;
    margin-top: 1rem;
  }

  .questions-container {
    padding: 1rem;
  }

  .navigation-controls {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .nav-btn,
  .check-btn,
  .finish-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .exercise-title {
    font-size: 1.125rem;
  }

  .question-title {
    font-size: 1.125rem;
  }

  .question-text {
    font-size: 1rem;
  }

  .options label {
    padding: 0.75rem 1rem;
  }
}
</style>