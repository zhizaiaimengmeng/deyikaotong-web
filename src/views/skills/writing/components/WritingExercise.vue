<template>
  <div class="writing-exercise">
    <!-- 顶部导航 -->
    <div class="exercise-header">
      <button class="back-btn" @click="goBack">
        <i class="fa fa-arrow-left"></i>
        <span>返回列表</span>
      </button>
      <div class="header-info">
        <div class="writing-title">{{ writing.title }}</div>
        <div class="writing-meta">
          <span class="meta-item">
            <i class="fa fa-clock"></i>
            建议时间: {{ writing.suggested_time }}分钟
          </span>
          <span class="meta-item">
            <i class="fa fa-file-alt"></i>
            建议字数: {{ writing.suggested_word_count }}+
          </span>
          <span class="difficulty-tag" :class="writing.difficulty">
            {{ getDifficultyText(writing.difficulty) }}
          </span>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="exercise-content">
      <div class="content-container">
        <!-- 写作要求区域 -->
        <div class="requirements-section">
          <h3 class="section-title">
            <i class="fa fa-clipboard-list"></i>
            写作要求
          </h3>
          <div class="requirements-content">
            <p>{{ writing.description }}</p>

            <div
              class="writing-tips"
              v-if="writing.tips && writing.tips.length > 0"
            >
              <h4>写作提示:</h4>
              <ul>
                <li v-for="(tip, index) in writing.tips" :key="index">
                  {{ tip }}
                </li>
              </ul>
            </div>

            <div
              class="evaluation-criteria"
              v-if="writing.criteria && writing.criteria.length > 0"
            >
              <h4>评分标准:</h4>
              <ul>
                <li v-for="(criterion, index) in writing.criteria" :key="index">
                  <span class="criterion-name">{{ criterion.name }}</span>
                  <span class="criterion-weight"
                    >(权重: {{ criterion.weight }}%)</span
                  >
                  <p class="criterion-desc">{{ criterion.description }}</p>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 右侧内容区域 -->
        <div class="right-column">
          <!-- 写作编辑器区域 -->
          <div class="editor-section">
            <div class="editor-header">
              <h3 class="section-title">
                <i class="fa fa-edit"></i>
                写作区域
              </h3>
              <div class="editor-stats">
                <span class="word-count" :class="{ warning: wordCount < 50 }">
                  字数: {{ wordCount }}
                  <span v-if="wordCount < 50" class="min-words-hint"
                    >(至少50字)</span
                  >
                </span>
                <span class="time-elapsed">用时: {{ formattedTime }}</span>
              </div>
            </div>

            <div class="editor-container">
              <textarea
                ref="editor"
                v-model="content"
                placeholder="开始写作..."
                class="writing-editor"
                @input="onContentChange"
                @keydown="handleKeyDown"
                @click="saveSelection"
                @keyup="saveSelection"
              ></textarea>

              <!-- 简化后的工具栏 - 只保留字数统计和清空按钮 -->
              <div class="editor-toolbar">
                <div class="toolbar-spacer"></div>

                <div class="action-buttons">
                  <button class="word-count-btn" title="字数统计">
                    <i class="fa fa-calculator"></i>
                    {{ wordCount }}
                  </button>
                  <button
                    class="clear-btn"
                    @click="clearContent"
                    title="清空内容"
                  >
                    <i class="fa fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 工具栏和提交区域 -->
          <div class="action-section">
            <div class="auto-save-status">
              <i class="fa" :class="saveStatus.icon"></i>
              <span>{{ saveStatus.text }}</span>
              <span class="last-saved" v-if="lastSaved">
                最后保存: {{ formatTime(lastSaved) }}
              </span>
            </div>

            <div class="submit-buttons">
              <button class="save-btn" @click="manualSave" :disabled="saving">
                <i
                  class="fa"
                  :class="saving ? 'fa-spinner fa-spin' : 'fa-save'"
                ></i>
                {{ saving ? "保存中..." : "保存草稿" }}
              </button>

              <button
                class="submit-btn"
                @click="submitWriting"
                :disabled="!canSubmit || submitting"
                :class="{ disabled: !canSubmit }"
              >
                <i
                  class="fa"
                  :class="submitting ? 'fa-spinner fa-spin' : 'fa-paper-plane'"
                ></i>
                {{ submitting ? "提交中..." : "提交作文" }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 提交确认模态框 -->
    <div
      v-if="showSubmitModal"
      class="modal-overlay"
      @click.self="showSubmitModal = false"
    >
      <div class="submit-modal">
        <h3>提交作文</h3>
        <p>确定要提交作文吗？提交后将无法修改。</p>

        <div class="submission-info">
          <p><strong>字数统计:</strong> {{ wordCount }} 字</p>
          <p><strong>用时:</strong> {{ formattedTime }}</p>
        </div>

        <div class="modal-actions">
          <button class="cancel-btn" @click="showSubmitModal = false">
            取消
          </button>
          <button class="confirm-btn" @click="confirmSubmit">确认提交</button>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-content">
        <i class="fa fa-spinner fa-spin"></i>
        <span>加载中...</span>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getWritingExercise,
  saveWritingDraft,
  submitWriting,
} from "@/api/question/writing/exercise";

export default {
  name: "WritingExercise",
  props: {
    level: {
      type: String,
      default: "A1",
    },
  },
  data() {
    return {
      writing: {
        id: null,
        title: "",
        description: "",
        suggested_time: 0,
        suggested_word_count: 0,
        difficulty: "medium",
        tips: [],
        criteria: [],
      },
      content: "",
      wordCount: 0,
      timeElapsed: 0,
      timer: null,
      lastSaved: null,
      saving: false,
      submitting: false,
      showSubmitModal: false,
      loading: false,
      autoSaveInterval: null,
      // 移除了格式按钮相关数据
      selectionStart: 0,
      selectionEnd: 0,
    };
  },
  computed: {
    formattedTime() {
      const minutes = Math.floor(this.timeElapsed / 60);
      const seconds = this.timeElapsed % 60;
      return `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    },
    canSubmit() {
      return this.wordCount >= 50;
    },
    saveStatus() {
      if (this.saving) {
        return { icon: "fa-sync-alt fa-spin", text: "保存中..." };
      }
      if (this.lastSaved) {
        return { icon: "fa-check-circle", text: "已保存" };
      }
      return { icon: "fa-circle", text: "未保存" };
    },
  },
  async created() {
    await this.loadWritingExercise();
    this.startTimer();
    this.setupAutoSave();
  },
  beforeDestroy() {
    this.stopTimer();
    this.clearAutoSave();
    if (this.content.trim().length > 0) {
      this.autoSave();
    }
  },
  methods: {
    async loadWritingExercise() {
      this.loading = true;
      const writingId = this.$route.params.id;

      try {
        const response = await getWritingExercise(writingId);
        this.writing = response.data;

        const draft = localStorage.getItem(`writing_draft_${writingId}`);
        if (draft) {
          const draftData = JSON.parse(draft);
          this.content = draftData.content;
          this.timeElapsed = draftData.timeElapsed || 0;
          this.lastSaved = draftData.lastSaved;
          this.onContentChange();
        }
      } catch (error) {
        console.error("加载写作练习失败:", error);
        this.$message.error("加载失败，请稍后重试");
        this.loadMockData();
      } finally {
        this.loading = false;
      }
    },

    loadMockData() {
      this.writing = {
        id: this.$route.params.id,
        title: "给朋友的一封信",
        description:
          "给你的朋友写一封信，分享你最近的生活和感受。要求内容真实、情感真挚，字数不少于200字。",
        suggested_time: 30,
        suggested_word_count: 200,
        difficulty: "easy",
        tips: [
          "开头可以问候朋友近况",
          "中间部分分享具体的生活经历",
          "结尾表达对朋友的思念和祝福",
          "注意书信的格式和语气",
        ],
        criteria: [
          {
            name: "内容完整性",
            weight: 40,
            description: "内容充实，表达完整，符合书信格式",
          },
          {
            name: "语言表达",
            weight: 30,
            description: "语言流畅，用词准确，语法正确",
          },
          {
            name: "逻辑结构",
            weight: 20,
            description: "结构清晰，层次分明，过渡自然",
          },
          {
            name: "创意与情感",
            weight: 10,
            description: "情感真挚，有个人特色和创意",
          },
        ],
      };
    },

    onContentChange() {
      this.saveSelection();
      const text = this.content.replace(/\s/g, "");
      this.wordCount = text.length;
    },

    saveSelection() {
      if (this.$refs.editor) {
        this.selectionStart = this.$refs.editor.selectionStart;
        this.selectionEnd = this.$refs.editor.selectionEnd;
      }
    },

    restoreSelection() {
      if (this.$refs.editor) {
        this.$refs.editor.focus();
        this.$refs.editor.setSelectionRange(
          this.selectionStart,
          this.selectionEnd
        );
      }
    },

    handleKeyDown(e) {
      this.saveSelection();
      if (e.key === "Tab") {
        e.preventDefault();
        this.insertTextAtCursor("    ");
      }
    },

    insertTextAtCursor(text) {
      const start = this.selectionStart;
      const end = this.selectionEnd;

      this.content =
        this.content.substring(0, start) + text + this.content.substring(end);

      this.selectionStart = start + text.length;
      this.selectionEnd = this.selectionStart;

      this.$nextTick(() => {
        this.restoreSelection();
        this.onContentChange();
      });
    },

    startTimer() {
      this.timer = setInterval(() => {
        this.timeElapsed++;
      }, 1000);
    },

    stopTimer() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    },

    setupAutoSave() {
      this.autoSaveInterval = setInterval(() => {
        if (this.content.trim().length > 0) {
          this.autoSave();
        }
      }, 30000);
    },

    clearAutoSave() {
      if (this.autoSaveInterval) {
        clearInterval(this.autoSaveInterval);
        this.autoSaveInterval = null;
      }
    },

    async autoSave() {
      if (this.saving) return;
      this.saving = true;
      try {
        const draftData = {
          content: this.content,
          timeElapsed: this.timeElapsed,
          lastSaved: new Date().toISOString(),
        };
        localStorage.setItem(
          `writing_draft_${this.writing.id}`,
          JSON.stringify(draftData)
        );
        this.lastSaved = new Date();
      } catch (error) {
        console.error("自动保存失败:", error);
      } finally {
        this.saving = false;
      }
    },

    async manualSave() {
      await this.autoSave();
      this.$message.success("草稿已保存");
    },

    submitWriting() {
      this.showSubmitModal = true;
    },

    async confirmSubmit() {
      this.showSubmitModal = false;
      this.submitting = true;

      try {
        const submission = {
          writing_id: this.writing.id,
          content: this.content,
          time_spent: this.timeElapsed,
          word_count: this.wordCount,
        };

        await submitWriting(submission);
        localStorage.removeItem(`writing_draft_${this.writing.id}`);
        this.$message.success("作文提交成功！");
        this.$router.push("/writing/list");
      } catch (error) {
        console.error("提交失败:", error);
        this.$message.error("提交失败，请稍后重试");
      } finally {
        this.submitting = false;
      }
    },

    clearContent() {
      if (confirm("确定要清空所有内容吗？此操作不可撤销。")) {
        this.content = "";
        this.onContentChange();
        this.$message.info("内容已清空");
      }
    },

    getDifficultyText(difficulty) {
      const difficultyMap = {
        easy: "简单",
        medium: "中等",
        hard: "困难",
      };
      return difficultyMap[difficulty] || difficulty;
    },

    formatTime(date) {
      if (!date) return "";
      return new Date(date).toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    },

    goBack() {
      if (this.content.trim().length > 0 && !this.lastSaved) {
        level;
        if (confirm("您有未保存的内容，确定要离开吗？")) {
          this.$router.push({
            name: "WritingList",
            params: {
              level: this.level,
            },
          });
        }
      } else {
        this.$router.push({
          name: "WritingList",
          params: {
            level: this.level,
          },
        });
      }
    },
  },
};
</script>

<style scoped>
.writing-exercise {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  font-family: "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
}

.exercise-header {
  background: white;
  padding: 20px 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #9f7aea 0%, #805ad5 100%);
  border: none;
  color: white;
  padding: 10px 18px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
  box-shadow: 0 2px 5px rgba(159, 122, 234, 0.3);
}

.back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(159, 122, 234, 0.4);
}

.header-info {
  text-align: right;
  flex: 1;
  margin-left: 20px;
}

.writing-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 8px;
  line-height: 1.3;
}

.writing-meta {
  display: flex;
  gap: 20px;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #718096;
  font-size: 0.95rem;
}

.meta-item i {
  width: 16px;
  text-align: center;
}

.difficulty-tag {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.difficulty-tag.easy {
  background: #f0fff4;
  color: #22543d;
  border: 1px solid #c6f6d5;
}

.difficulty-tag.medium {
  background: #fffaf0;
  color: #744210;
  border: 1px solid #fed7d7;
}

.difficulty-tag.hard {
  background: #fff5f5;
  color: #742a2a;
  border: 1px solid #fed7d7;
}

.exercise-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px 20px;
}

.content-container {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 30px;
  align-items: start;
  min-height: calc(100vh - 180px);
}

/* 左侧写作要求区域 */
.requirements-section {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
  height: fit-content;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  position: sticky;
  top: 30px;
  z-index: 10;
}

/* 右侧内容区域 */
.right-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: fit-content;
  min-height: calc(100vh - 200px);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.3rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f1f5f9;
}

.section-title i {
  color: #9f7aea;
  font-size: 1.1em;
}

.requirements-content p {
  line-height: 1.7;
  color: #4a5568;
  margin-bottom: 20px;
  font-size: 1.05rem;
}

.writing-tips,
.evaluation-criteria {
  margin-top: 25px;
  padding-top: 15px;
  border-top: 1px solid #f1f5f9;
}

.writing-tips h4,
.evaluation-criteria h4 {
  color: #2d3748;
  margin-bottom: 12px;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.writing-tips h4:before,
.evaluation-criteria h4:before {
  content: "";
  width: 4px;
  height: 16px;
  background: #9f7aea;
  border-radius: 2px;
}

.writing-tips ul,
.evaluation-criteria ul {
  padding-left: 20px;
}

.writing-tips li,
.evaluation-criteria li {
  margin-bottom: 10px;
  color: #4a5568;
  line-height: 1.6;
  position: relative;
}

.writing-tips li:before {
  content: "💡";
  position: absolute;
  left: -20px;
}

.criterion-name {
  font-weight: 600;
  color: #2d3748;
  display: block;
  margin-bottom: 4px;
}

.criterion-weight {
  color: #9f7aea;
  font-size: 0.9rem;
  font-weight: 500;
}

.criterion-desc {
  color: #718096;
  font-size: 0.95rem;
  margin: 5px 0 0 0;
  line-height: 1.5;
}

/* 写作编辑器区域 */
.editor-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  height: 60vh;
  min-height: 400px;
  flex: 1;
}

.editor-header {
  padding: 20px 25px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.editor-stats {
  display: flex;
  gap: 20px;
  font-size: 0.95rem;
  color: #718096;
  flex-wrap: wrap;
}

.word-count {
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 500;
}

.word-count.warning {
  color: #e53e3e;
}

.min-words-hint {
  font-size: 0.85rem;
  opacity: 0.8;
}

.time-elapsed {
  display: flex;
  align-items: center;
  gap: 5px;
}

.editor-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.writing-editor {
  flex: 1;
  border: none;
  padding: 25px;
  font-family: "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
  font-size: 1.05rem;
  line-height: 1.7;
  resize: none;
  outline: none;
  background: #fafbfc;
  border-radius: 0 0 12px 12px;
  transition: all 0.3s;
}

.writing-editor:focus {
  background: white;
  box-shadow: inset 0 0 0 2px rgba(159, 122, 234, 0.125);
}

.writing-editor::placeholder {
  color: #a0aec0;
}

/* 简化后的编辑器工具栏 - 移除了格式按钮 */
.editor-toolbar {
  padding: 15px 25px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fafbfc;
  border-radius: 0 0 12px 12px;
}

.toolbar-spacer {
  flex: 1;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.word-count-btn {
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  color: #4a5568;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: default;
}

.clear-btn {
  background: #fff5f5;
  border: 1px solid #fed7d7;
  color: #e53e3e;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
}

.clear-btn:hover {
  background: #fed7d7;
}

/* 工具栏和提交区域 */
.action-section {
  background: white;
  border-radius: 12px;
  padding: 20px 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 0;
  z-index: 5;
  position: relative;
}

.auto-save-status {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #718096;
  font-size: 0.95rem;
}

.auto-save-status i {
  width: 16px;
  text-align: center;
}

.last-saved {
  font-size: 0.85rem;
  margin-left: 15px;
  opacity: 0.8;
}

.submit-buttons {
  display: flex;
  gap: 15px;
}

.save-btn,
.submit-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.save-btn {
  background: #f7fafc;
  color: #4a5568;
  border: 1px solid #e2e8f0;
}

.save-btn:hover:not(:disabled) {
  background: #edf2f7;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.submit-btn {
  background: linear-gradient(135deg, #9f7aea 0%, #805ad5 100%);
  color: white;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(159, 122, 234, 0.4);
}

.submit-btn:disabled,
.submit-btn.disabled {
  background: #a0aec0;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  opacity: 0.7;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.submit-modal {
  background: white;
  border-radius: 12px;
  padding: 30px;
  max-width: 450px;
  width: 100%;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  animation: modal-appear 0.3s ease;
}

@keyframes modal-appear {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.submit-modal h3 {
  margin-bottom: 10px;
  color: #2d3748;
  font-size: 1.4rem;
}

.submit-modal p {
  margin-bottom: 20px;
  color: #718096;
  line-height: 1.5;
}

.submission-info {
  background: #f7fafc;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.submission-info p {
  margin: 8px 0;
  color: #4a5568;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn,
.confirm-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.cancel-btn {
  background: #f7fafc;
  color: #4a5568;
  border: 1px solid #e2e8f0;
}

.cancel-btn:hover {
  background: #edf2f7;
}

.confirm-btn {
  background: #9f7aea;
  color: white;
}

.confirm-btn:hover {
  background: #805ad5;
  transform: translateY(-1px);
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  color: #718096;
  font-size: 1.1rem;
}

.loading-content i {
  font-size: 2.5rem;
  color: #9f7aea;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .content-container {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .requirements-section {
    position: static;
    max-height: none;
  }

  .editor-section {
    height: 50vh;
  }

  .right-column {
    min-height: auto;
  }
}

@media (max-width: 768px) {
  .exercise-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
    padding: 15px 20px;
  }

  .header-info {
    text-align: left;
    margin-left: 0;
    width: 100%;
  }

  .writing-meta {
    justify-content: flex-start;
  }

  .exercise-content {
    padding: 15px 10px;
  }

  .editor-header {
    padding: 15px 20px;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .editor-stats {
    width: 100%;
    justify-content: space-between;
  }

  .action-section {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .submit-buttons {
    width: 100%;
  }

  .save-btn,
  .submit-btn {
    flex: 1;
    justify-content: center;
  }

  .writing-editor {
    padding: 20px;
  }

  .editor-toolbar {
    padding: 12px 20px;
    flex-wrap: wrap;
  }

  .toolbar-spacer {
    display: none;
  }

  .action-buttons {
    width: 100%;
    justify-content: space-between;
    margin-top: 10px;
  }
}

@media (max-width: 480px) {
  .writing-title {
    font-size: 1.4rem;
  }

  .meta-item {
    font-size: 0.9rem;
  }

  .section-title {
    font-size: 1.2rem;
  }

  .requirements-content p {
    font-size: 1rem;
  }

  .save-btn,
  .submit-btn {
    padding: 10px 15px;
    font-size: 0.95rem;
  }

  .modal-actions {
    flex-direction: column;
  }

  .cancel-btn,
  .confirm-btn {
    width: 100%;
  }
}
</style>