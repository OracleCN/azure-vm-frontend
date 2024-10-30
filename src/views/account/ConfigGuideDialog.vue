<template>
  <el-dialog
    v-model="visible"
    title="如何获取 Azure 配置"
    :width="isMobile ? '90%' : '700px'"
    class="config-guide-dialog"
    destroy-on-close
  >
    <div class="guide-steps">
      <!-- 步骤 1 -->
      <div class="guide-step">
        <div class="step-header">
          <div class="step-number">1</div>
          <h3>打开 Azure Portal 的 Cloud Shell</h3>
        </div>
        <div class="step-content">
          <div class="code-wrapper">
            <div class="code-header">
              <span>在 Cloud Shell 中运行以下命令：</span>
              <el-tooltip content="复制命令" placement="top" :show-after="500">
                <el-button type="primary" link @click="copyCommand">
                  <el-icon class="mr-1"><CopyDocument /></el-icon>
                  复制命令
                </el-button>
              </el-tooltip>
            </div>
            <pre class="code-block"><span class="command-line">az ad sp create-for-rbac --role contributor --years 99 \
  --scopes /subscriptions/$(az account list --query [].id -o tsv)</span></pre>
          </div>
        </div>
      </div>

      <!-- 步骤 2 -->
      <div class="guide-step">
        <div class="step-header">
          <div class="step-number">2</div>
          <h3>复制生成的 JSON 配置</h3>
        </div>
        <div class="step-content">
          <p>命令执行后会生成如下格式的 JSON 配置：</p>
          <pre class="code-block json"><span class="json-content">{
  "appId": "xxxxx-xxxx-xxxx-xxxx-xxxxxxxxxx",
  "password": "xxxxxxxxxxxxxxxxxx",
  "tenant": "xxxxx-xxxx-xxxx-xxxx-xxxxxxxxxx",
  "subscriptionId": "xxxxx-xxxx-xxxx-xxxx-xxxxxxxxxx"
}</span></pre>
        </div>
      </div>

      <!-- 步骤 3 -->
      <div class="guide-step">
        <div class="step-header">
          <div class="step-number">3</div>
          <h3>填写配置信息</h3>
        </div>
        <div class="step-content">
          <div class="tips-wrapper">
            <el-alert
              title="将生成的 JSON 配置复制到快速配置框中，系统将自动填写表单"
              type="info"
              :closable="false"
              show-icon
            />
            <div class="mapping-info">
              <p>配置项对应关系：</p>
              <ul>
                <li><code>appId</code> → App ID</li>
                <li><code>password</code> → App Password</li>
                <li><code>tenant</code> → Tenant ID</li>
                <li><code>subscriptionId</code> → Subscription ID</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { CopyDocument } from "@element-plus/icons-vue"
import { ElMessage } from "element-plus"

const visible = ref(false)
const isMobile = ref(window.innerWidth <= 768)

window.addEventListener("resize", () => {
  isMobile.value = window.innerWidth <= 768
})

const copyCommand = async () => {
  const command =
    "az ad sp create-for-rbac --role contributor --years 99 --scopes /subscriptions/$(az account list --query [].id -o tsv)"
  try {
    await navigator.clipboard.writeText(command)
    ElMessage.success("命令已复制到剪贴板")
  } catch (error) {
    console.error("复制失败:", error)
    ElMessage.error("复制失败，请手动复制")
  }
}

defineExpose({
  open: () => (visible.value = true),
  close: () => (visible.value = false)
})
</script>

<style lang="scss" scoped>
.config-guide-dialog {
  :deep(.el-dialog__body) {
    padding: 0;
    max-height: 70vh;
    overflow-y: auto;
  }

  .guide-steps {
    .guide-step {
      padding: 24px;
      border-bottom: 1px solid var(--el-border-color-lighter);

      &:last-child {
        border-bottom: none;
      }

      .step-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;

        .step-number {
          width: 24px;
          height: 24px;
          border-radius: 12px;
          background-color: var(--el-color-primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 500;
        }

        h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 500;
          color: var(--el-text-color-primary);
        }
      }

      .step-content {
        padding-left: 36px;

        p {
          margin: 0 0 12px;
          color: var(--el-text-color-regular);
          font-size: 14px;
          line-height: 1.6;
        }

        .code-wrapper {
          .code-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;

            span {
              font-size: 14px;
              color: var(--el-text-color-regular);
            }
          }
        }

        .code-block {
          background: var(--el-fill-color-light);
          border-radius: 4px;
          padding: 16px;
          margin: 0;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 13px;
          line-height: 1.6;
          color: var(--el-text-color-regular);
          border: 1px solid var(--el-border-color-lighter);
          overflow-x: auto;
          white-space: pre;

          // 命令行样式
          .command-line {
            color: #476582;
          }

          // JSON样式
          &.json {
            .json-content {
              color: #476582;

              // 可以添加更详细的JSON语法高亮
              .key {
                color: #c92c2c;
              }
              .string {
                color: #2f9c0a;
              }
              .number {
                color: #0b7fc7;
              }
              .boolean {
                color: #c92c2c;
              }
            }
          }
        }

        .tips-wrapper {
          .mapping-info {
            margin-top: 16px;

            p {
              margin-bottom: 8px;
              font-weight: 500;
            }

            ul {
              margin: 0;
              padding-left: 20px;

              li {
                margin-bottom: 6px;
                color: var(--el-text-color-regular);
                font-size: 14px;

                code {
                  background: var(--el-fill-color-light);
                  padding: 2px 6px;
                  border-radius: 4px;
                  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
                }

                &:last-child {
                  margin-bottom: 0;
                }
              }
            }
          }
        }
      }
    }
  }
}

// 移动端适配
@media screen and (max-width: 768px) {
  .config-guide-dialog {
    .guide-steps {
      .guide-step {
        padding: 16px;

        .step-header {
          gap: 8px;
          margin-bottom: 12px;

          .step-number {
            width: 20px;
            height: 20px;
            font-size: 12px;
          }

          h3 {
            font-size: 15px;
          }
        }

        .step-content {
          padding-left: 28px;

          p {
            font-size: 13px;
            margin-bottom: 8px;
          }

          .code-block {
            padding: 12px;
            font-size: 12px;
            line-height: 1.5;
          }

          .tips-wrapper {
            .mapping-info {
              margin-top: 12px;

              ul li {
                font-size: 13px;
                margin-bottom: 4px;
              }
            }
          }
        }
      }
    }
  }
}
</style>
