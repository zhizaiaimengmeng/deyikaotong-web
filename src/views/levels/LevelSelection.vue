<template>
  <div class="level-selection">
    <!-- 主要内容区域 -->
    <div class="main-content">
      <div class="selection-container">
        <h1 class="page-title">选择您的德语级别</h1>
        <p class="page-subtitle">根据您的当前水平选择合适的起点</p>

        <!-- 级别选择圆形按钮 -->
        <div class="levels-grid">
          <div
            v-for="level in levels"
            :key="level.id"
            class="level-circle"
            :class="level.colorClass"
            @click="selectLevel(level)"
          >
            <div class="level-code">{{ level.code }}</div>
            <div class="level-name">{{ level.name }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部信息 -->
    <div class="footer">
      <p>德易考通·专业的德语考试准备平台</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "LevelSelection",
  data() {
    return {
      levels: [
        {
          id: 1,
          code: "A1",
          name: "入门级",
          colorClass: "level-a1",
          route: "/levels/a1",
        },
        {
          id: 2,
          code: "A2",
          name: "基础级",
          colorClass: "level-a2",
          route: "/levels/a2",
        },
        {
          id: 3,
          code: "B1",
          name: "进阶级",
          colorClass: "level-b1",
          route: "/levels/b1",
        },
        {
          id: 4,
          code: "B2",
          name: "高级",
          colorClass: "level-b2",
          route: "/levels/b2",
        },
      ],
    };
  },
  methods: {
    selectLevel(level) {
      // 直接跳转到对应级别的页面
      this.$router.push(level.route);
    },
  },
};
</script>

<style scoped>
.level-selection {
  min-height: 100vh;
  background: white;
  display: flex;
  flex-direction: column;
}

/* 主要内容区域 */
.main-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px 20px;
}

.selection-container {
  max-width: 800px;
  width: 100%;
  text-align: center;
}

.page-title {
  font-size: 2.2rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 10px;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #7f8c8d;
  margin-bottom: 40px;
}

/* 级别选择圆形按钮 */
.levels-grid {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.level-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.level-circle:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.level-code {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 5px;
}

.level-name {
  font-size: 1rem;
  font-weight: 500;
}

/* 级别颜色 */
.level-a1 {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  color: white;
}

.level-a2 {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
}

.level-b1 {
  background: linear-gradient(135deg, #f39c12, #e67e22);
  color: white;
}

.level-b2 {
  background: linear-gradient(135deg, #9b59b6, #8e44ad);
  color: white;
}

/* 底部信息 */
.footer {
  text-align: center;
  padding: 20px;
  color: #7f8c8d;
  font-size: 0.9rem;
  border-top: 1px solid #ecf0f1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .levels-grid {
    gap: 20px;
  }

  .level-circle {
    width: 100px;
    height: 100px;
  }

  .level-code {
    font-size: 1.8rem;
  }

  .level-name {
    font-size: 0.9rem;
  }

  .page-title {
    font-size: 1.8rem;
  }
}

@media (max-width: 480px) {
  .levels-grid {
    gap: 15px;
  }

  .level-circle {
    width: 90px;
    height: 90px;
  }

  .level-code {
    font-size: 1.6rem;
  }

  .level-name {
    font-size: 0.8rem;
  }
}
</style>