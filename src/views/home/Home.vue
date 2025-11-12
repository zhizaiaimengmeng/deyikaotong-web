<template>
  <div class="home-page">
    <!-- 简约英雄区域 -->
    <section class="hero-section">
      <div class="hero-container">
        <div class="hero-content">
          <div class="logo-mark">
            <span class="logo-icon">🇩🇪</span>
          </div>
          <h1 class="hero-title">掌握德语，轻松应试</h1>
          <p class="hero-subtitle">专业的A1-B2级别德语考试在线学习平台</p>
          <p class="hero-description">
            德易考通为您提供全面的德语考试准备资源，从入门到精通，
            帮助您顺利通过各级别德语考试。
          </p>
          <div class="hero-actions">
            <button class="btn-primary" @click="startLearning">开始学习</button>
            <button class="btn-outline" @click="exploreLevels">探索级别</button>
          </div>
        </div>
        <div class="hero-visual">
          <div class="abstract-graphic">
            <div class="graphic-circle circle-1"></div>
            <div class="graphic-circle circle-2"></div>
            <div class="graphic-circle circle-3"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- 核心价值 -->
    <section class="values-section">
      <div class="section-container">
        <div class="section-header">
          <h2>德易考通的核心价值</h2>
          <p>我们致力于提供最专业的德语考试准备体验</p>
        </div>
        <div class="values-grid">
          <div class="value-card">
            <div class="value-icon">🎯</div>
            <h3>精准定位</h3>
            <p>根据CEFR标准精确划分级别，针对性强化训练</p>
          </div>
          <div class="value-card">
            <div class="value-icon">📊</div>
            <h3>智能分析</h3>
            <p>实时追踪学习进度，个性化推荐学习内容</p>
          </div>
          <div class="value-card">
            <div class="value-icon">🌟</div>
            <h3>专业内容</h3>
            <p>由德语专家团队打造，贴合最新考试要求</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 级别预览 -->
    <section class="levels-section">
      <div class="section-container">
        <div class="section-header">
          <h2>选择适合您的级别</h2>
          <p>根据您的当前水平选择合适的起点</p>
        </div>
        <div class="levels-grid">
          <div
            v-for="level in levels"
            :key="level.name"
            class="level-card"
            :class="level.color"
            @click="selectLevel(level)"
          >
            <div class="level-content">
              <div class="level-badge">{{ level.name }}</div>
              <h3>{{ level.title }}</h3>
              <p>{{ level.description }}</p>
            </div>
            <div class="level-action">
              <span class="action-text">开始学习</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 底部CTA -->
    <section class="cta-section">
      <div class="cta-container">
        <h2>准备好开始您的德语学习之旅了吗？</h2>
        <p>加入数千名成功通过德语考试的学习者行列</p>
        <button class="btn-primary large" @click="startLearning">
          立即开始
        </button>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: "Home",
  data() {
    return {
      levels: [
        {
          name: "A1",
          title: "入门级",
          description: "零基础起步，掌握基本交流",
          color: "blue",
          route: "/levels/a1",
        },
        {
          name: "A2",
          title: "基础级",
          description: "日常交流，简单对话能力",
          color: "green",
          route: "/levels/a2",
        },
        {
          name: "B1",
          title: "进阶级",
          description: "能够进行日常话题讨论",
          color: "orange",
          route: "/levels/b1",
        },
        {
          name: "B2",
          title: "高级",
          description: "流利交流，处理复杂情境",
          color: "purple",
          route: "/levels/b2",
        },
      ],
    };
  },
  methods: {
    startLearning() {
      this.$router.push("/levels");
    },
    exploreLevels() {
      this.$router.push("/levels");
    },
    selectLevel(level) {
      this.$router.push(level.route);
    },
  },
};
</script>

<style scoped>
.home-page {
  width: 100%;
  background: #ffffff;
}

/* 英雄区域 */
.hero-section {
  padding: 100px 0;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  position: relative;
  overflow: hidden;
}

.hero-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  align-items: center;
  position: relative;
  z-index: 2;
}

.hero-content {
  max-width: 500px;
}

.logo-mark {
  margin-bottom: 1.5rem;
}

.logo-icon {
  font-size: 3rem;
  display: inline-block;
}

.hero-title {
  font-size: 2.8rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 1rem;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.hero-subtitle {
  font-size: 1.3rem;
  color: #4f46e5;
  font-weight: 500;
  margin-bottom: 1.5rem;
}

.hero-description {
  font-size: 1.1rem;
  color: #718096;
  line-height: 1.6;
  margin-bottom: 2.5rem;
}

.hero-actions {
  display: flex;
  gap: 1rem;
}

.hero-visual {
  display: flex;
  justify-content: center;
  align-items: center;
}

.abstract-graphic {
  position: relative;
  width: 400px;
  height: 400px;
}

.graphic-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.8;
}

.circle-1 {
  width: 250px;
  height: 250px;
  background: linear-gradient(
    135deg,
    rgba(79, 70, 229, 0.1),
    rgba(124, 58, 237, 0.05)
  );
  top: 0;
  left: 0;
}

.circle-2 {
  width: 180px;
  height: 180px;
  background: linear-gradient(
    135deg,
    rgba(79, 70, 229, 0.15),
    rgba(124, 58, 237, 0.1)
  );
  top: 120px;
  right: 0;
}

.circle-3 {
  width: 120px;
  height: 120px;
  background: linear-gradient(
    135deg,
    rgba(79, 70, 229, 0.2),
    rgba(124, 58, 237, 0.15)
  );
  bottom: 0;
  left: 100px;
}

/* 按钮样式 */
.btn-primary,
.btn-outline {
  padding: 12px 28px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 1rem;
}

.btn-primary {
  background: #4f46e5;
  color: white;
  border: none;
  box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2);
}

.btn-primary:hover {
  background: #4338ca;
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(79, 70, 229, 0.3);
}

.btn-outline {
  background: transparent;
  color: #4f46e5;
  border: 1px solid #e5e7eb;
}

.btn-outline:hover {
  background: #f9fafb;
  border-color: #4f46e5;
}

.btn-primary.large {
  padding: 16px 32px;
  font-size: 1.1rem;
}

/* 区域通用样式 */
.section-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-header h2 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 1rem;
}

.section-header p {
  font-size: 1.2rem;
  color: #718096;
}

/* 核心价值区域 */
.values-section {
  padding: 100px 0;
  background: #ffffff;
}

.values-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.value-card {
  text-align: center;
  padding: 2.5rem 2rem;
  border-radius: 16px;
  background: #f8fafc;
  transition: all 0.3s ease;
}

.value-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
}

.value-icon {
  font-size: 3rem;
  margin-bottom: 1.5rem;
}

.value-card h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 1rem;
}

.value-card p {
  color: #718096;
  line-height: 1.6;
}

/* 级别区域 */
.levels-section {
  padding: 100px 0;
  background: #f8fafc;
}

.levels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.level-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  cursor: pointer;
}

.level-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.level-content {
  padding: 2rem;
}

.level-badge {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 700;
  margin-bottom: 1rem;
  color: white;
}

.level-card.blue .level-badge {
  background: #3b82f6;
}

.level-card.green .level-badge {
  background: #10b981;
}

.level-card.orange .level-badge {
  background: #f59e0b;
}

.level-card.purple .level-badge {
  background: #8b5cf6;
}

.level-card h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 0.5rem;
}

.level-card p {
  color: #718096;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.level-action {
  border-top: 1px solid #e5e7eb;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.action-text {
  color: #4f46e5;
  font-weight: 500;
}

.level-card:hover .action-text {
  color: #4338ca;
}

/* CTA区域 */
.cta-section {
  padding: 100px 0;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white;
  text-align: center;
}

.cta-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
}

.cta-section h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.cta-section p {
  font-size: 1.2rem;
  margin-bottom: 2.5rem;
  opacity: 0.9;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .hero-container {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 3rem;
  }

  .hero-content {
    max-width: none;
    margin: 0 auto;
  }

  .hero-actions {
    justify-content: center;
  }

  .abstract-graphic {
    width: 300px;
    height: 300px;
  }
}

@media (max-width: 768px) {
  .hero-section,
  .values-section,
  .levels-section,
  .cta-section {
    padding: 60px 0;
  }

  .hero-title {
    font-size: 2.2rem;
  }

  .hero-subtitle {
    font-size: 1.1rem;
  }

  .section-header h2 {
    font-size: 2rem;
  }

  .values-grid,
  .levels-grid {
    grid-template-columns: 1fr;
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
  }

  .btn-primary,
  .btn-outline {
    width: 100%;
    max-width: 250px;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 1.8rem;
  }

  .section-header h2 {
    font-size: 1.8rem;
  }

  .cta-section h2 {
    font-size: 2rem;
  }

  .abstract-graphic {
    width: 250px;
    height: 250px;
  }
}
</style>