<template>
  <div class="speaking-exercise">
    <!-- 顶部导航 -->
    <div class="exercise-header">
      <button class="back-btn" @click="goBack">
        <i class="fas fa-arrow-left"></i>
        <span>返回列表</span>
      </button>
      <div class="header-info">
        <div class="speaking-title">{{ speaking.title }}</div>
        <div class="speaking-meta">
          <span class="meta-item">
            <i class="fas fa-clock"></i>
            准备时间: {{ speaking.preparationTime }}秒
          </span>
          <span class="meta-item">
            <i class="fas fa-microphone"></i>
            答题时间: {{ speaking.speakingTime }}秒
          </span>
          <span class="difficulty-tag" :class="speaking.difficulty">
            {{ getDifficultyText(speaking.difficulty) }}
          </span>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="exercise-content">
      <div class="content-container">
        <!-- 左侧题目要求区域 -->
        <div class="requirements-section">
          <h3 class="section-title">
            <i class="fas fa-clipboard-list"></i>
            题目要求
          </h3>
          <div class="requirements-content">
            <p class="description-text">{{ speaking.description }}</p>

            <!-- 音频提示 -->
            <div v-if="speaking.audio_prompt" class="audio-prompt">
              <h4>音频提示</h4>
              <div class="audio-player">
                <audio controls :src="speaking.audio_prompt">
                  您的浏览器不支持音频播放
                </audio>
                <button class="play-sample-btn" @click="playSampleAudio">
                  <i class="fas fa-volume-up"></i>
                  播放示例
                </button>
              </div>
            </div>

            <!-- 图片提示 -->
            <div v-if="speaking.image_prompt" class="imagePrompt">
              <h4>图片提示</h4>
              <div class="image-container">
                <img
                  :src="speaking.imagePrompt"
                  alt="题目图片"
                  class="prompt-image"
                  @click="zoomImage"
                />
                <div
                  class="image-zoom-overlay"
                  v-if="isImageZoomed"
                  @click="closeZoom"
                >
                  <img
                    :src="speaking.imagePrompt"
                    alt="放大图片"
                    class="zoomed-image"
                  />
                </div>
              </div>
            </div>

            <!-- 口语提示 -->
            <div
              v-if="speaking.tips && speaking.tips.length > 0"
              class="speaking-tips"
            >
              <h4>口语提示:</h4>
              <ul>
                <li v-for="(tip, index) in speaking.tips" :key="index">
                  <i class="fas fa-lightbulb"></i>
                  {{ tip }}
                </li>
              </ul>
            </div>

            <!-- 参考答案 -->
            <div v-if="showSampleAnswer" class="sample-answer">
              <h4 @click="toggleSampleAnswer" class="toggle-answer">
                <i
                  class="fas"
                  :class="
                    sampleAnswerVisible ? 'fa-chevron-down' : 'fa-chevron-right'
                  "
                ></i>
                参考答案
              </h4>
              <div v-if="sampleAnswerVisible" class="answer-content">
                <p>{{ speaking.sample_answer }}</p>
                <button class="copy-answer-btn" @click="copyAnswer">
                  <i class="fas fa-copy"></i>
                  复制答案
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧录音区域 -->
        <div class="right-column">
          <!-- 准备阶段 -->
          <div
            v-if="currentStage === 'preparation'"
            class="preparation-stage stage-card"
          >
            <div class="stage-header">
              <h3>
                <i class="fas fa-brain"></i>
                准备阶段
              </h3>
              <div class="timer preparation-timer">
                <i class="fas fa-hourglass-half"></i>
                剩余时间: {{ formatTime(preparationTimeLeft) }}
              </div>
            </div>
            <div class="preparation-content">
              <p class="stage-description">请利用准备时间构思您的回答</p>
              <div class="preparation-tips">
                <h4>准备建议:</h4>
                <ul>
                  <li><i class="fas fa-check"></i> 理清回答思路</li>
                  <li><i class="fas fa-check"></i> 准备关键词和表达</li>
                  <li><i class="fas fa-check"></i> 注意发音和语调</li>
                  <li><i class="fas fa-check"></i> 控制语速和节奏</li>
                </ul>
              </div>
            </div>
            <div class="stage-actions">
              <button class="start-speaking-btn" @click="startSpeaking">
                <i class="fas fa-microphone"></i>
                开始录音
              </button>
              <button class="skip-prep-btn" @click="skipPreparation">
                <i class="fas fa-forward"></i>
                跳过准备
              </button>
            </div>
          </div>

          <!-- 录音阶段 -->
          <div
            v-else-if="currentStage === 'recording'"
            class="recording-stage stage-card"
          >
            <div class="stage-header">
              <h3>
                <i class="fas fa-microphone"></i>
                录音阶段
              </h3>
              <div class="timer recording-timer">
                <i class="fas fa-hourglass-end"></i>
                剩余时间: {{ formatTime(recordingTimeLeft) }}
              </div>
            </div>

            <!-- 录音可视化 -->
            <div class="recording-visualization">
              <div class="visualizer-container">
                <canvas ref="visualizer" class="visualizer-canvas"></canvas>
                <div
                  class="recording-indicator"
                  :class="{ active: isRecording }"
                >
                  <div class="pulsing-dot"></div>
                  <span>录音中...</span>
                </div>
                <div class="volume-level">
                  <span>音量: {{ volumeLevel }}%</span>
                  <div class="volume-bar">
                    <div
                      class="volume-fill"
                      :style="{ width: volumeLevel + '%' }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 录音控制 -->
            <div class="recording-controls">
              <button
                v-if="!isRecording"
                class="record-btn primary-btn"
                @click="startRecording"
              >
                <i class="fas fa-microphone"></i>
                开始录音
              </button>
              <button v-else class="stop-btn danger-btn" @click="stopRecording">
                <i class="fas fa-stop"></i>
                停止录音
              </button>
              <button
                v-if="hasRecording"
                class="play-btn secondary-btn"
                @click="playRecording"
              >
                <i class="fas fa-play"></i>
                播放录音
              </button>
              <button
                class="reset-btn"
                @click="resetRecording"
                v-if="hasRecording"
              >
                <i class="fas fa-trash"></i>
                清除
              </button>
            </div>

            <!-- 录音列表 -->
            <div v-if="recordings.length > 0" class="recordings-list">
              <h4>录音记录</h4>
              <div class="recordings-container">
                <div
                  v-for="(recording, index) in recordings"
                  :key="index"
                  class="recording-item"
                  :class="{ active: currentRecordingIndex === index }"
                  @click="selectRecording(index)"
                >
                  <div class="recording-info">
                    <span class="recording-name">录音 {{ index + 1 }}</span>
                    <span class="recording-duration">{{
                      formatDuration(recording.duration)
                    }}</span>
                  </div>
                  <div class="recording-actions">
                    <button
                      class="play-item-btn"
                      @click.stop="playRecording(index)"
                    >
                      <i class="fas fa-play"></i>
                    </button>
                    <button
                      class="delete-item-btn"
                      @click.stop="deleteRecording(index)"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 完成阶段 -->
          <div
            v-else-if="currentStage === 'completed'"
            class="completed-stage stage-card"
          >
            <div class="stage-header">
              <h3>
                <i class="fas fa-check-circle"></i>
                完成录音
              </h3>
              <div class="score-display" v-if="submission.score">
                <div class="score-circle">
                  <span class="score-value">{{ submission.score }}</span>
                  <span class="score-total">/100</span>
                </div>
              </div>
            </div>

            <div class="completion-content">
              <div v-if="submission.transcription" class="transcription">
                <h4>
                  <i class="fas fa-keyboard"></i>
                  语音转文字:
                </h4>
                <div class="transcription-text">
                  <p>{{ submission.transcription }}</p>
                  <button
                    class="copy-transcription-btn"
                    @click="copyTranscription"
                  >
                    <i class="fas fa-copy"></i>
                  </button>
                </div>
              </div>

              <div v-if="submission.feedback" class="feedback">
                <h4>
                  <i class="fas fa-robot"></i>
                  AI评语:
                </h4>
                <div class="feedback-content">
                  <p>{{ submission.feedback }}</p>
                  <div class="feedback-details" v-if="submission.details">
                    <div class="detail-item">
                      <span>流利度: {{ submission.details.fluency }}/10</span>
                      <div class="detail-bar">
                        <div
                          class="detail-fill"
                          :style="{
                            width: submission.details.fluency * 10 + '%',
                          }"
                        ></div>
                      </div>
                    </div>
                    <div class="detail-item">
                      <span
                        >发音: {{ submission.details.pronunciation }}/10</span
                      >
                      <div class="detail-bar">
                        <div
                          class="detail-fill"
                          :style="{
                            width: submission.details.pronunciation * 10 + '%',
                          }"
                        ></div>
                      </div>
                    </div>
                    <div class="detail-item">
                      <span>词汇: {{ submission.details.vocabulary }}/10</span>
                      <div class="detail-bar">
                        <div
                          class="detail-fill"
                          :style="{
                            width: submission.details.vocabulary * 10 + '%',
                          }"
                        ></div>
                      </div>
                    </div>
                    <div class="detail-item">
                      <span>语法: {{ submission.details.grammar }}/10</span>
                      <div class="detail-bar">
                        <div
                          class="detail-fill"
                          :style="{
                            width: submission.details.grammar * 10 + '%',
                          }"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="completion-actions">
                <button
                  class="re-record-btn secondary-btn"
                  @click="redoRecording"
                >
                  <i class="fas fa-redo"></i>
                  重新录音
                </button>
                <button class="submit-btn primary-btn" @click="submitRecording">
                  <i class="fas fa-paper-plane"></i>
                  提交作业
                </button>
                <button class="save-draft-btn" @click="saveDraft">
                  <i class="fas fa-save"></i>
                  保存草稿
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-content">
        <div class="spinner"></div>
        <span>加载中...</span>
      </div>
    </div>

    <!-- 通知消息 -->
    <div
      v-if="notification.show"
      class="notification"
      :class="notification.type"
    >
      <i class="fas" :class="notification.icon"></i>
      <span>{{ notification.message }}</span>
    </div>
  </div>
</template>

<script>
import { submitSpeaking } from "@/api/question/speaking/exercise";
import { AudioRecorder } from "@/utils/audioRecorder";

export default {
  name: "SpeakingExercise",
  props: {
    level: {
      type: String,
      default: "A1",
    },
    speakId: {
      type: String,
      default: null,
    },
    currentSpeaking: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      speaking: {
        // id: null,
        // title: "",
        // description: "",
        // preparation_time: 30,
        // speaking_time: 60,
        // tips: [],
        // sample_answer: "",
      },
      currentStage: "preparation", // preparation, recording, completed
      preparationTimeLeft: 0,
      recordingTimeLeft: 0,
      isRecording: false,
      hasRecording: false,
      recordings: [],
      currentRecordingIndex: -1,
      audioRecorder: null,
      submission: {
        audioFile: null,
        duration: 0,
        transcription: "",
        score: 0,
        feedback: "",
        details: {
          fluency: 0,
          pronunciation: 0,
          vocabulary: 0,
          grammar: 0,
        },
      },
      sampleAnswerVisible: false,
      showSampleAnswer: false,
      loading: false,
      preparationTimer: null,
      recordingTimer: null,
      volumeLevel: 0,
      isImageZoomed: false,
      notification: {
        show: false,
        type: "success",
        message: "",
        icon: "fa-check",
      },
    };
  },
  async created() {
    await this.loadSpeakingExercise();
    this.startPreparation();
  },
  beforeDestroy() {
    this.cleanup();
  },
  methods: {
    async loadSpeakingExercise() {
      this.loading = true;

      try {
        this.speaking = this.currentSpeaking;
        this.preparationTimeLeft = this.speaking.preparationTime;
        this.recordingTimeLeft = this.speaking.speakingTime;
        this.showSampleAnswer = !!this.speaking.sampleAnswer;

        // 初始化录音器
        this.audioRecorder = new AudioRecorder({
          onStart: this.onRecordingStart,
          onStop: this.onRecordingStop,
          onDataAvailable: this.onDataAvailable,
          onVolumeChange: this.onVolumeChange,
        });
      } catch (error) {
        console.error("加载口语练习失败:", error);
        this.loadMockData();
      } finally {
        this.loading = false;
      }
    },

    loadMockData() {
      this.speaking = {
        id: this.$route.params.speakingId,
        title: "自我介绍",
        description:
          "用英语进行一段简短的自我介绍，包括姓名、年龄、职业和兴趣爱好。要求发音清晰，语速适中，表达自然流畅。",
        preparation_time: 30,
        speaking_time: 60,
        tips: ["注意发音清晰", "控制语速", "使用简单句", "表达自然"],
        sample_answer:
          "My name is John. I am 25 years old. I work as a software engineer. In my free time, I enjoy reading and hiking. I also like to travel and explore new places.",
        image_prompt: "/images/sample-speaking.jpg",
      };
      this.preparationTimeLeft = this.speaking.preparation_time;
      this.recordingTimeLeft = this.speaking.speaking_time;
      this.showSampleAnswer = true;
    },

    startPreparation() {
      this.preparationTimer = setInterval(() => {
        this.preparationTimeLeft--;
        if (this.preparationTimeLeft <= 0) {
          clearInterval(this.preparationTimer);
          this.startSpeaking();
        }
      }, 1000);
    },

    skipPreparation() {
      clearInterval(this.preparationTimer);
      this.startSpeaking();
    },

    startSpeaking() {
      this.currentStage = "recording";
      clearInterval(this.preparationTimer);
    },

    async startRecording() {
      try {
        await this.audioRecorder.start();
        this.isRecording = true;

        this.recordingTimer = setInterval(() => {
          this.recordingTimeLeft--;
          if (this.recordingTimeLeft <= 0) {
            this.stopRecording();
          }
        }, 1000);
      } catch (error) {
        console.error("开始录音失败:", error);
        this.showNotification("录音设备不可用", "error");
      }
    },

    async stopRecording() {
      try {
        await this.audioRecorder.stop();
        this.isRecording = false;
        clearInterval(this.recordingTimer);
      } catch (error) {
        console.error("停止录音失败:", error);
      }
    },

    onRecordingStart() {
      console.log("录音开始");
      this.showNotification("录音已开始", "info");
    },

    onRecordingStop(audioBlob, duration) {
      const recording = {
        blob: audioBlob,
        duration: duration,
        url: URL.createObjectURL(audioBlob),
      };

      this.recordings.push(recording);
      this.currentRecordingIndex = this.recordings.length - 1;
      this.hasRecording = true;

      // 模拟语音识别和评分
      this.simulateEvaluation(recording);
      this.showNotification("录音已完成", "success");
    },

    onVolumeChange(volume) {
      this.volumeLevel = Math.min(100, Math.max(0, Math.round(volume * 100)));
    },

    onDataAvailable() {
      // 处理音频数据，可用于可视化
      this.updateVisualization();
    },

    playRecording(index = this.currentRecordingIndex) {
      if (index >= 0 && this.recordings[index]) {
        const audio = new Audio(this.recordings[index].url);
        audio.play();
        this.showNotification("播放录音中", "info");
      }
    },

    selectRecording(index) {
      this.currentRecordingIndex = index;
    },

    deleteRecording(index) {
      this.recordings.splice(index, 1);
      if (this.currentRecordingIndex === index) {
        this.currentRecordingIndex = -1;
      } else if (this.currentRecordingIndex > index) {
        this.currentRecordingIndex--;
      }
      this.showNotification("录音已删除", "success");
    },

    resetRecording() {
      this.recordings = [];
      this.currentRecordingIndex = -1;
      this.hasRecording = false;
      this.showNotification("录音已重置", "info");
    },

    simulateEvaluation(recording) {
      // 模拟AI评估过程
      setTimeout(() => {
        this.submission = {
          audioFile: recording.blob,
          duration: recording.duration,
          transcription:
            "This is a simulated transcription of the recording. My name is John and I am a software engineer.",
          score: Math.floor(Math.random() * 20) + 75, // 模拟得分 75-95
          feedback:
            "发音清晰，语调自然。建议注意连读和重音。词汇使用恰当，语法基本正确。",
          details: {
            fluency: Math.floor(Math.random() * 3) + 7, // 7-9
            pronunciation: Math.floor(Math.random() * 3) + 6, // 6-8
            vocabulary: Math.floor(Math.random() * 3) + 7, // 7-9
            grammar: Math.floor(Math.random() * 3) + 6, // 6-8
          },
        };
        this.currentStage = "completed";
      }, 2000);
    },

    redoRecording() {
      this.currentStage = "recording";
      this.recordingTimeLeft = this.speaking.speaking_time;
      this.submission = {
        audioFile: null,
        duration: 0,
        transcription: "",
        score: 0,
        feedback: "",
        details: {
          fluency: 0,
          pronunciation: 0,
          vocabulary: 0,
          grammar: 0,
        },
      };
    },

    async submitRecording() {
      try {
        const formData = new FormData();
        formData.append("speaking_id", this.speaking.id);
        formData.append("audio", this.submission.audioFile);
        formData.append("duration", this.submission.duration);

        await submitSpeaking(formData);
        this.showNotification("口语作业提交成功！", "success");
        setTimeout(() => {
          this.$router.push({
            name: "SpeakingList",
            params: { level: this.level },
          });
        }, 1500);
      } catch (error) {
        console.error("提交失败:", error);
        this.showNotification("提交失败，请重试", "error");
      }
    },

    saveDraft() {
      // 保存草稿逻辑
      this.showNotification("草稿已保存", "success");
    },

    updateVisualization() {
      // 实现音频可视化
      const canvas = this.$refs.visualizer;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // 简单的波形绘制
      ctx.fillStyle = "#3b82f6";
      for (let i = 0; i < width; i += 3) {
        const barHeight = Math.random() * height;
        ctx.fillRect(i, height - barHeight, 2, barHeight);
      }
    },

    toggleSampleAnswer() {
      this.sampleAnswerVisible = !this.sampleAnswerVisible;
    },

    playSampleAudio() {
      // 播放示例音频逻辑
      this.showNotification("播放示例音频", "info");
    },

    zoomImage() {
      this.isImageZoomed = true;
    },

    closeZoom() {
      this.isImageZoomed = false;
    },

    copyAnswer() {
      navigator.clipboard.writeText(this.speaking.sample_answer);
      this.showNotification("答案已复制到剪贴板", "success");
    },

    copyTranscription() {
      navigator.clipboard.writeText(this.submission.transcription);
      this.showNotification("转录文本已复制", "success");
    },

    formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    },

    formatDuration(seconds) {
      return this.formatTime(seconds);
    },

    getDifficultyText(difficulty) {
      const difficultyMap = {
        easy: "简单",
        medium: "中等",
        hard: "困难",
      };
      return difficultyMap[difficulty] || difficulty;
    },

    showNotification(message, type = "success") {
      this.notification = {
        show: true,
        type,
        message,
        icon:
          type === "success"
            ? "fa-check"
            : type === "error"
            ? "fa-exclamation-triangle"
            : "fa-info",
      };

      setTimeout(() => {
        this.notification.show = false;
      }, 3000);
    },

    goBack() {
      if (confirm("确定要返回吗？未保存的进度将会丢失。")) {
        this.$router.push({
          name: "SpeakingList",
          params: { level: this.level },
        });
      }
    },

    cleanup() {
      if (this.preparationTimer) clearInterval(this.preparationTimer);
      if (this.recordingTimer) clearInterval(this.recordingTimer);
      if (this.audioRecorder) {
        this.audioRecorder.cleanup();
      }
    },
  },
};
</script>

<style scoped>
.speaking-exercise {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

/* 顶部导航 */
.exercise-header {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #475569;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-right: 20px;
}

.back-btn:hover {
  background: #f1f5f9;
  transform: translateX(-2px);
}

.header-info {
  flex: 1;
}

.speaking-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}

.speaking-meta {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #64748b;
  font-size: 14px;
}

.difficulty-tag {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
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

/* 主要内容区域 */
.exercise-content {
  max-width: 1200px;
  margin: 0 auto;
}

.content-container {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 24px;
}

/* 左侧题目要求区域 */
.requirements-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  height: fit-content;
  position: sticky;
  top: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
}

.section-title i {
  color: #3b82f6;
}

.description-text {
  line-height: 1.6;
  color: #475569;
  margin-bottom: 20px;
}

.audio-prompt,
.image-prompt,
.speaking-tips,
.sample-answer {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f1f5f9;
}

.audio-prompt h4,
.image-prompt h4,
.speaking-tips h4,
.sample-answer h4 {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
}

.audio-player {
  display: flex;
  gap: 12px;
  align-items: center;
}

.audio-player audio {
  flex: 1;
}

.play-sample-btn {
  padding: 8px 12px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background 0.3s;
}

.play-sample-btn:hover {
  background: #2563eb;
}

.image-container {
  position: relative;
}

.prompt-image {
  width: 100%;
  max-height: 300px;
  object-fit: contain;
  border-radius: 8px;
  cursor: zoom-in;
  transition: transform 0.3s;
}

.prompt-image:hover {
  transform: scale(1.02);
}

.image-zoom-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  cursor: zoom-out;
}

.zoomed-image {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
}

.speaking-tips ul {
  list-style: none;
  padding: 0;
}

.speaking-tips li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  color: #475569;
}

.speaking-tips li i {
  color: #f59e0b;
}

.toggle-answer {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #3b82f6;
  margin: 0;
  transition: color 0.3s;
}

.toggle-answer:hover {
  color: #2563eb;
}

.answer-content {
  margin-top: 12px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
}

.answer-content p {
  margin-bottom: 12px;
  line-height: 1.5;
}

.copy-answer-btn {
  padding: 6px 12px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.3s;
}

.copy-answer-btn:hover {
  background: #f1f5f9;
}

/* 右侧阶段卡片 */
.stage-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
}

.stage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
}

.stage-header h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.timer {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 20px;
}

.preparation-timer {
  background: #fef7ed;
  color: #d97706;
}

.recording-timer {
  background: #fef2f2;
  color: #dc2626;
}

.stage-description {
  text-align: center;
  color: #64748b;
  margin-bottom: 20px;
}

.preparation-tips h4 {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
}

.preparation-tips ul {
  list-style: none;
  padding: 0;
}

.preparation-tips li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  color: #475569;
}

.preparation-tips li i {
  color: #10b981;
}

.stage-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 20px;
}

.start-speaking-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
  box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);
}

.start-speaking-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(59, 130, 246, 0.4);
}

.skip-prep-btn {
  padding: 12px 16px;
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s;
}

.skip-prep-btn:hover {
  background: #f1f5f9;
}

/* 录音可视化 */
.recording-visualization {
  margin-bottom: 20px;
}

.visualizer-container {
  background: #1e293b;
  border-radius: 8px;
  padding: 20px;
  position: relative;
}

.visualizer-canvas {
  width: 100%;
  height: 120px;
  background: #0f172a;
  border-radius: 4px;
  margin-bottom: 16px;
}

.recording-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #94a3b8;
  margin-bottom: 12px;
  justify-content: center;
}

.recording-indicator.active {
  color: #ef4444;
}

.pulsing-dot {
  width: 12px;
  height: 12px;
  background: #ef4444;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.1);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.volume-level {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #cbd5e1;
  font-size: 14px;
}

.volume-bar {
  flex: 1;
  height: 6px;
  background: #374151;
  border-radius: 3px;
  overflow: hidden;
}

.volume-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #34d399);
  border-radius: 3px;
  transition: width 0.3s;
}

/* 录音控制 */
.recording-controls {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.primary-btn,
.secondary-btn,
.danger-btn,
.reset-btn {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s;
}

.primary-btn {
  background: #3b82f6;
  color: white;
}

.primary-btn:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.secondary-btn {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.secondary-btn:hover {
  background: #e2e8f0;
}

.danger-btn {
  background: #ef4444;
  color: white;
}

.danger-btn:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

.reset-btn {
  background: #64748b;
  color: white;
  font-size: 12px;
  padding: 8px 12px;
}

.reset-btn:hover {
  background: #475569;
}

/* 录音列表 */
.recordings-list h4 {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
}

.recordings-container {
  max-height: 200px;
  overflow-y: auto;
}

.recording-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.recording-item:hover,
.recording-item.active {
  background: #f8fafc;
  border-color: #3b82f6;
}

.recording-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.recording-name {
  font-weight: 600;
  color: #374151;
}

.recording-duration {
  font-size: 12px;
  color: #64748b;
}

.recording-actions {
  display: flex;
  gap: 6px;
}

.play-item-btn,
.delete-item-btn {
  padding: 6px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.play-item-btn {
  background: #10b981;
  color: white;
}

.play-item-btn:hover {
  background: #059669;
}

.delete-item-btn {
  background: #ef4444;
  color: white;
}

.delete-item-btn:hover {
  background: #dc2626;
}

/* 完成阶段 */
.score-display {
  display: flex;
  align-items: center;
}

.score-circle {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border-radius: 50%;
  width: 80px;
  height: 80px;
  justify-content: center;
  box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
}

.score-value {
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
}

.score-total {
  font-size: 12px;
  opacity: 0.9;
}

.transcription,
.feedback {
  margin-bottom: 20px;
}

.transcription h4,
.feedback h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
}

.transcription-text {
  position: relative;
  background: #f8fafc;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
}

.copy-transcription-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 6px 8px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  color: #64748b;
  transition: all 0.2s;
}

.copy-transcription-btn:hover {
  background: #f1f5f9;
  color: #374151;
}

.feedback-content {
  background: #f0f9ff;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #0ea5e9;
}

.feedback-details {
  margin-top: 16px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.detail-item span {
  min-width: 100px;
  font-size: 14px;
  color: #475569;
}

.detail-bar {
  flex: 1;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.detail-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  border-radius: 3px;
  transition: width 0.5s ease;
}

.completion-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 24px;
  flex-wrap: wrap;
}

.save-draft-btn {
  padding: 10px 16px;
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s;
}

.save-draft-btn:hover {
  background: #f1f5f9;
}

/* 加载状态 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-content {
  background: white;
  padding: 30px 40px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f1f5f9;
  border-left: 4px solid #3b82f6;
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

/* 通知消息 */
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 8px;
  color: white;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 1001;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease;
}

.notification.success {
  background: #10b981;
}

.notification.error {
  background: #ef4444;
}

.notification.info {
  background: #3b82f6;
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

/* 响应式设计 */
@media (max-width: 1024px) {
  .content-container {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .requirements-section {
    position: static;
  }
}

@media (max-width: 768px) {
  .speaking-exercise {
    padding: 16px;
  }

  .exercise-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .back-btn {
    margin-right: 0;
  }

  .speaking-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .stage-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .recording-controls,
  .completion-actions,
  .stage-actions {
    flex-direction: column;
  }

  .audio-player {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .requirements-section,
  .stage-card {
    padding: 16px;
  }

  .speaking-title {
    font-size: 20px;
  }
}
</style>