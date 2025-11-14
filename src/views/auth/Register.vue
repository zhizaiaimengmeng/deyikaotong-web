<template>
  <div class="register-container">
    <div class="register-content">
      <!-- 注册表单区域 -->
      <div class="register-card">
        <div class="register-header">
          <h1>创建账户</h1>
          <p>加入德易考通，开启德语学习之旅</p>
        </div>

        <el-form
          ref="registerForm"
          :model="registerForm"
          :rules="registerRules"
          class="register-form"
          @submit.native.prevent="handleRegister"
        >
          <!-- 用户名 -->
          <el-form-item prop="username">
            <el-input
              v-model="registerForm.username"
              placeholder="请输入用户名"
              prefix-icon="el-icon-user"
              size="large"
              @blur="validateField('username')"
            ></el-input>
          </el-form-item>

          <!-- 邮箱 -->
          <!-- <el-form-item prop="email">
            <el-input
              v-model="registerForm.email"
              placeholder="请输入邮箱地址"
              prefix-icon="el-icon-message"
              size="large"
              @blur="validateField('email')"
            ></el-input>
          </el-form-item> -->

          <!-- 密码 -->
          <el-form-item prop="password">
            <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="请输入密码（至少6位）"
              prefix-icon="el-icon-lock"
              size="large"
              show-password
              @blur="validateField('password')"
            ></el-input>
          </el-form-item>

          <!-- 确认密码 -->
          <el-form-item prop="confirmPassword">
            <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              prefix-icon="el-icon-lock"
              size="large"
              show-password
              @blur="validateField('confirmPassword')"
            ></el-input>
          </el-form-item>

          <!-- 学习目标 -->
          <el-form-item prop="goal">
            <el-select
              v-model="registerForm.goal"
              placeholder="请选择您的学习目标"
              size="large"
              style="width: 100%"
              @change="validateField('goal')"
            >
              <el-option label="通过A1级别考试" value="A1"></el-option>
              <el-option label="通过A2级别考试" value="A2"></el-option>
              <el-option label="通过B1级别考试" value="B1"></el-option>
              <el-option label="通过B2级别考试" value="B2"></el-option>
              <el-option label="日常交流提升" value="daily"></el-option>
              <el-option label="商务德语应用" value="business"></el-option>
            </el-select>
          </el-form-item>

          <!-- 协议同意 -->
          <el-form-item prop="agreed">
            <el-checkbox
              v-model="registerForm.agreed"
              @change="validateField('agreed')"
            >
              我已阅读并同意
              <el-link type="primary" @click="showAgreement = true">
                《用户协议》
              </el-link>
              和
              <el-link type="primary" @click="showPrivacy = true">
                《隐私政策》
              </el-link>
            </el-checkbox>
          </el-form-item>

          <!-- 注册按钮 -->
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              :loading="loading"
              :disabled="isSubmitting"
              @click="handleRegister"
              class="register-btn"
            >
              {{ loading ? "注册中..." : "立即注册" }}
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 底部链接 -->
        <div class="register-footer">
          <span>已有账户？</span>
          <el-link type="primary" @click="$router.push('/login')">
            立即登录
          </el-link>
        </div>
      </div>

      <!-- 平台介绍 -->
      <div class="platform-intro">
        <div class="intro-content">
          <h2>为什么选择德易考通？</h2>
          <div class="benefits">
            <div class="benefit-item">
              <i class="el-icon-star-on"></i>
              <div class="benefit-text">
                <h3>专业课程体系</h3>
                <p>A1-B2全级别覆盖，科学分级学习</p>
              </div>
            </div>
            <div class="benefit-item">
              <i class="el-icon-headset"></i>
              <div class="benefit-text">
                <h3>沉浸式听力训练</h3>
                <p>真实场景对话，提升听力理解能力</p>
              </div>
            </div>
            <div class="benefit-item">
              <i class="el-icon-chat-dot-round"></i>
              <div class="benefit-text">
                <h3>智能口语评测</h3>
                <p>AI智能评分，实时纠正发音</p>
              </div>
            </div>
            <div class="benefit-item">
              <i class="el-icon-data-analysis"></i>
              <div class="benefit-text">
                <h3>个性化学习路径</h3>
                <p>根据您的水平定制专属学习计划</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 用户协议对话框 -->
    <el-dialog title="用户协议" :visible.sync="showAgreement" width="50%">
      <div class="agreement-content">
        <h3>德易考通用户协议</h3>
        <p>欢迎使用德易考通德语学习平台！请仔细阅读以下协议内容...</p>
        <!-- 协议内容 -->
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showAgreement = false">关闭</el-button>
      </span>
    </el-dialog>

    <!-- 隐私政策对话框 -->
    <el-dialog title="隐私政策" :visible.sync="showPrivacy" width="50%">
      <div class="privacy-content">
        <h3>隐私政策</h3>
        <p>我们高度重视您的隐私保护...</p>
        <!-- 隐私政策内容 -->
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showPrivacy = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { register } from "@/api/user";

export default {
  name: "Register",
  data() {
    // 确认密码验证规则
    const validateConfirmPassword = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请再次输入密码"));
      } else if (value !== this.registerForm.password) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    };

    return {
      loading: false,
      isSubmitting: false, // 防重复提交标志
      showAgreement: false,
      showPrivacy: false,
      registerForm: {
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        goal: "",
        agreed: false,
      },
      registerRules: {
        username: [
          {
            required: true,
            message: "请输入用户名",
            trigger: ["blur", "change"],
          },
          {
            min: 3,
            max: 20,
            message: "用户名长度在 3 到 20 个字符",
            trigger: ["blur", "change"],
          },
        ],
        // email: [
        //   {
        //     required: true,
        //     message: "请输入邮箱地址",
        //     trigger: ["blur", "change"],
        //   },
        //   {
        //     type: "email",
        //     message: "请输入有效的邮箱地址",
        //     trigger: ["blur", "change"],
        //   },
        // ],
        password: [
          {
            required: true,
            message: "请输入密码",
            trigger: ["blur", "change"],
          },
          {
            min: 6,
            message: "密码长度至少为6位",
            trigger: ["blur", "change"],
          },
        ],
        confirmPassword: [
          {
            required: true,
            message: "请确认密码",
            trigger: ["blur", "change"],
          },
          {
            validator: validateConfirmPassword,
            trigger: ["blur", "change"],
          },
        ],
        goal: [
          {
            required: true,
            message: "请选择学习目标",
            trigger: "change",
          },
        ],
        agreed: [
          {
            validator: (rule, value, callback) => {
              if (!value) {
                callback(new Error("请同意用户协议"));
              } else {
                callback();
              }
            },
            trigger: "change",
          },
        ],
      },
    };
  },
  methods: {
    // 处理注册
    async handleRegister() {
      // 防重复提交检查
      if (this.isSubmitting) {
        return;
      }

      this.isSubmitting = true;
      this.loading = true;

      try {
        console.log("开始表单验证...");

        // 第一步：前端表单验证
        const isValid = await this.validateForm();
        if (!isValid) {
          console.log("表单验证失败，停止执行");
          return; // 验证失败立即返回，不继续执行
        }

        console.log("表单验证通过，开始注册流程");

        // 第二步：调用注册API
        const response = await register({
          username: this.registerForm.username,
          email: this.registerForm.email,
          password: this.registerForm.password,
          goal: this.registerForm.goal,
        });

        // 注册成功处理
        this.$message({
          message: "注册成功！欢迎加入德易考通！",
          type: "success",
          duration: 3000,
        });

        // 跳转到登录页
        setTimeout(() => {
          this.$router.push("/login");
        }, 1500);
      } catch (error) {
        console.error("注册过程出错:", error);

        // 区分验证错误和服务器错误
        if (!this.isValidationError(error)) {
          this.$message.error(error.message || "注册失败，请稍后重试");
        }
      } finally {
        this.loading = false;
        this.isSubmitting = false;
      }
    },

    // 单独的表单验证方法
    async validateForm() {
      try {
        // 使用Element UI的validate方法进行验证
        await this.$refs.registerForm.validate();
        console.log("前端表单验证通过");
        return true;
      } catch (error) {
        console.log("前端表单验证失败:", error);

        // 提取验证错误信息
        const errorFields = error.fields || {};
        let errorMessages = [];

        Object.keys(errorFields).forEach((field) => {
          if (errorFields[field] && errorFields[field].length > 0) {
            errorMessages.push(errorFields[field][0].message);
          }
        });

        // 显示具体的验证错误
        if (errorMessages.length > 0) {
          this.$message.warning(`请完善以下信息：${errorMessages.join("；")}`);
        } else {
          this.$message.warning("请完善表单信息");
        }

        return false;
      }
    },

    // 实时字段验证
    validateField(fieldName) {
      this.$refs.registerForm.validateField(fieldName);
    },

    // 判断是否为验证错误
    isValidationError(error) {
      return error && error.fields && Object.keys(error.fields).length > 0;
    },
  },
};
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.register-content {
  display: flex;
  max-width: 1000px;
  width: 100%;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.register-card {
  flex: 1;
  padding: 3rem;
  max-width: 450px;
}

.register-header {
  text-align: center;
  margin-bottom: 2rem;
}

.register-header h1 {
  font-size: 2rem;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.register-header p {
  color: #64748b;
}

.register-form {
  margin-bottom: 1.5rem;
}

.register-btn {
  width: 100%;
  height: 48px;
  font-size: 1.1rem;
  font-weight: 600;
}

.register-footer {
  text-align: center;
  color: #6b7280;
  font-size: 0.875rem;
}

.register-footer .el-link {
  margin-left: 0.5rem;
}

/* 平台介绍区域 */
.platform-intro {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 3rem;
  display: flex;
  align-items: center;
}

.intro-content h2 {
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
}

.benefits {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.benefit-item i {
  font-size: 2rem;
  color: rgba(255, 255, 255, 0.9);
}

.benefit-text h3 {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.benefit-text p {
  opacity: 0.9;
  line-height: 1.5;
  margin: 0;
}

.agreement-content,
.privacy-content {
  max-height: 400px;
  overflow-y: auto;
  line-height: 1.6;
}

.agreement-content h3,
.privacy-content h3 {
  color: #1e293b;
  margin-bottom: 1rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .register-container {
    padding: 1rem;
  }

  .register-content {
    flex-direction: column;
  }

  .register-card {
    max-width: 100%;
    padding: 2rem;
  }

  .platform-intro {
    padding: 2rem;
    text-align: center;
  }

  .benefit-item {
    flex-direction: column;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .register-card {
    padding: 1.5rem;
  }

  .register-header h1 {
    font-size: 1.75rem;
  }
}

/* 自定义Element UI样式 */
:deep(.el-input__inner) {
  height: 48px;
}

:deep(.el-form-item) {
  margin-bottom: 1.5rem;
}

:deep(.el-checkbox__label) {
  font-size: 0.875rem;
}
</style>
