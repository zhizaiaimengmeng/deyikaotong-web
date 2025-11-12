<template>
  <footer class="app-footer">
    <div class="footer-container">
      <div class="footer-content">
        <div class="footer-section">
          <div class="footer-logo">
            <span class="logo-icon">🇩🇪</span>
            <span class="logo-text">德易考通</span>
          </div>
          <p class="footer-description">
            专业的德语考试准备平台，帮助您顺利通过A1-B2级别考试。
          </p>
        </div>

        <div class="footer-section">
          <h4>学习资源</h4>
          <ul class="footer-links">
            <li><router-link to="/levels">课程级别</router-link></li>
            <li><router-link to="/skills">技能训练</router-link></li>
            <li><router-link to="/exams">模拟考试</router-link></li>
            <li><router-link to="/resources">学习资料</router-link></li>
          </ul>
        </div>

        <div class="footer-section">
          <h4>支持帮助</h4>
          <ul class="footer-links">
            <li><router-link to="/help">使用指南</router-link></li>
            <li><router-link to="/faq">常见问题</router-link></li>
            <li><router-link to="/contact">联系我们</router-link></li>
          </ul>
        </div>

        <div class="footer-section">
          <h4>订阅更新</h4>
          <p>获取最新学习资源和考试信息</p>
          <div class="subscribe-form">
            <input
              type="email"
              placeholder="请输入您的邮箱"
              class="email-input"
            />
            <button class="subscribe-btn">订阅</button>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; 2023 德易考通. 保留所有权利.</p>
        <div class="legal-links">
          <router-link to="/privacy">隐私政策</router-link>
          <router-link to="/terms">服务条款</router-link>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: "AppFooter",
};
</script>

<style scoped>
.app-footer {
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  padding: 3rem 0 1.5rem;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.footer-content {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-section h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.logo-icon {
  font-size: 1.5rem;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 600;
  color: #4f46e5;
}

.footer-description {
  color: #6b7280;
  line-height: 1.6;
  max-width: 300px;
}

.footer-links {
  list-style: none;
}

.footer-links li {
  margin-bottom: 0.5rem;
}

.footer-links a {
  color: #6b7280;
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-links a:hover {
  color: #4f46e5;
}

.subscribe-form {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.email-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
}

.subscribe-btn {
  padding: 8px 16px;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
  color: #6b7280;
  font-size: 0.875rem;
}

.legal-links {
  display: flex;
  gap: 1.5rem;
}

.legal-links a {
  color: #6b7280;
  text-decoration: none;
}

.legal-links a:hover {
  color: #4f46e5;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .footer-content {
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }
}

@media (max-width: 640px) {
  .footer-content {
    grid-template-columns: 1fr;
  }

  .footer-bottom {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .footer-container {
    padding: 0 1rem;
  }
}
</style>