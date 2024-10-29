<template>
  <div class="account-list-container">
    <!-- 顶部搜索区域 -->
    <div class="search-header">
      <div class="search-content">
        <div class="search-and-stats">
          <el-input
            v-model="searchQuery"
            placeholder="搜索账户名称或备注"
            class="search-input"
            size="default"
            clearable
          >
            <template #prefix>
              <el-icon class="search-icon"><Search /></el-icon>
            </template>
          </el-input>

          <!-- 账户统计信息 -->
          <div class="statistics">
            <div class="stat-item">
              <span class="label">总账户：</span>
              <span class="value">{{ accountStore.accountStats.total }}</span>
            </div>
            <div class="stat-item">
              <span class="label">正常：</span>
              <span class="value success">{{ accountStore.accountStats.normal }}</span>
            </div>
            <div class="stat-item">
              <span class="label">异常：</span>
              <span class="value danger">{{ accountStore.accountStats.error }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 表格 -->
    <div class="table-responsive">
      <el-table
        :data="filteredAccounts"
        style="width: 100%"
        :default-sort="{ prop: 'addTime', order: 'descending' }"
        size="default"
        class="custom-table"
        v-loading="accountStore.loading"
      >
        <el-table-column type="index" label="序号" width="80" align="center" />
        <el-table-column prop="account" label="账户" min-width="140" :show-overflow-tooltip="true">
          <template #default="{ row }">
            <span class="column-account">{{ row.account }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="140" :show-overflow-tooltip="true">
          <template #default="{ row }">
            <span class="column-remark">{{ row.remark }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" min-width="100" :show-overflow-tooltip="true" align="center">
          <template #default="{ row }">
            <span class="column-type">{{ row.type }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" min-width="80" align="center">
          <template #default="{ row }">
            <el-tag
              :type="row.status === 'normal' ? 'success' : 'danger'"
              effect="light"
              size="small"
              class="status-tag"
            >
              {{ row.status === "normal" ? "正常" : "异常" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="vmCount" label="虚拟机数" min-width="90" align="center">
          <template #default="{ row }">
            <span class="column-count">{{ row.vmCount }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="addTime"
          label="添加时间"
          min-width="160"
          align="center"
          sortable
          :show-overflow-tooltip="true"
        >
          <template #default="{ row }">
            <span class="column-time">{{ row.addTime }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="statusUpdateTime"
          label="状态更新时间"
          min-width="160"
          align="center"
          :show-overflow-tooltip="true"
        >
          <template #default="{ row }">
            <span class="column-time">{{ row.statusUpdateTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right" align="center">
          <template #default="{ row }">
            <div class="operation-buttons">
              <el-button type="primary" link @click="handleEdit(row)" size="small" class="operation-button">
                编辑
              </el-button>
              <el-button type="danger" link @click="handleDelete(row)" size="small" class="operation-button">
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页器 -->
    <div class="pagination-container">
      <div class="page-info">
        <span class="total-text">共 {{ accountStore.total }} 条记录</span>
        <el-select v-model="pageSize" class="page-size-select" size="small" popper-class="custom-select-dropdown">
          <el-option label="10 条/页" :value="10" />
          <el-option label="20 条/页" :value="20" />
          <el-option label="50 条/页" :value="50" />
        </el-select>
      </div>

      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="accountStore.total"
        :pager-count="5"
        layout="prev, pager, next"
        background
        class="custom-pagination"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue"
import { Search } from "@element-plus/icons-vue"
import { ElMessageBox, ElMessage } from "element-plus"
import { useAccountStore } from "@/store/modules/account"
import type { AzureAccount } from "@/store/modules/account"

// 初始化 store
const accountStore = useAccountStore()

// 响应式状态
const searchQuery = ref("")
const currentPage = ref(1)
const pageSize = ref(10)

// 计算属性：过滤后的账户列表
const filteredAccounts = computed(() => {
  const accounts = accountStore.accounts
  if (!searchQuery.value) return accounts

  const query = searchQuery.value.toLowerCase()
  return accounts.filter(
    (account) => account.account.toLowerCase().includes(query) || account.remark.toLowerCase().includes(query)
  )
})

// 监听分页变化
watch([currentPage, pageSize], () => {
  accountStore.setPageParams(currentPage.value, pageSize.value)
})

// 操作处理函数
const handleEdit = (row: AzureAccount) => {
  console.log("编辑账户:", row)
  // 这里添加编辑逻辑
}

const handleDelete = async (row: AzureAccount) => {
  try {
    await ElMessageBox.confirm("确认删除该账户吗？此操作不可逆", "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    })

    await accountStore.deleteAccount(row.id)
    ElMessage.success("删除成功")
  } catch (err) {
    // 只有当错误不是用户取消操作时才显示错误消息
    if (err !== "cancel") {
      const errorMessage = err instanceof Error ? err.message : "删除失败"
      ElMessage.error(errorMessage)
    }
  }
}
// 生命周期钩子
onMounted(async () => {
  try {
    await accountStore.fetchAccounts()
  } catch {
    ElMessage.error("获取账户列表失败")
  }
})
</script>
<style lang="scss" scoped>
.account-list-container {
  padding: 16px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);

  @media (min-width: 768px) {
    padding: 24px;
  }

  .search-header {
    background-color: #f8f9fa;
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 16px;

    @media (min-width: 768px) {
      padding: 16px;
      margin-bottom: 24px;
    }

    .search-content {
      .search-and-stats {
        display: flex;
        flex-direction: column;
        gap: 12px;

        @media (min-width: 768px) {
          flex-direction: row;
          align-items: center;
        }
      }
    }

    .search-input {
      width: 100%;
      max-width: 260px;

      :deep(.el-input__wrapper) {
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        border-radius: 6px;

        &:hover {
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1);
        }

        &.is-focus {
          box-shadow: 0 0 0 2px rgba(var(--el-color-primary-rgb), 0.2);
        }
      }

      .search-icon {
        color: #909399;
      }
    }

    .statistics {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;

      @media (min-width: 768px) {
        margin-left: 24px;
        gap: 24px;
      }

      .stat-item {
        display: flex;
        align-items: center;
        font-size: 13px;

        @media (min-width: 768px) {
          font-size: 14px;
        }

        .label {
          color: #606266;
        }

        .value {
          margin-left: 4px;
          font-weight: 500;
          color: #303133;

          &.success {
            color: #67c23a;
          }

          &.danger {
            color: #f56c6c;
          }
        }
      }
    }
  }

  .table-responsive {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    margin-bottom: 16px;

    &::-webkit-scrollbar {
      height: 8px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: #dcdfe6;
      border-radius: 4px;
    }

    &::-webkit-scrollbar-track {
      background-color: #f4f4f5;
      border-radius: 4px;
    }
  }

  .custom-table {
    :deep(.el-table__header) {
      th {
        background-color: #f8fafc;
        font-weight: 600;
        color: #475569;
        height: 44px;
        padding: 8px;

        &.is-sortable {
          &:hover {
            background-color: #f1f5f9;
          }
        }
      }
    }

    :deep(.el-table__row) {
      td {
        padding: 8px;
        transition: background-color 0.2s;
      }

      &:hover > td {
        background-color: #f8fafc;
      }
    }

    .column-account {
      font-weight: 500;
      color: #303133;
    }

    .column-remark,
    .column-type,
    .column-time {
      color: #606266;
    }

    .column-count {
      font-weight: 500;
    }

    .status-tag {
      &.el-tag--success {
        background-color: #f0f9eb;
        border-color: #e1f3d8;
        color: #67c23a;
      }

      &.el-tag--danger {
        background-color: #fef0f0;
        border-color: #fde2e2;
        color: #f56c6c;
      }
    }

    .operation-buttons {
      display: flex;
      justify-content: center;
      gap: 8px;

      .operation-button {
        font-size: 13px;
        padding: 4px 8px;
        border-radius: 4px;
        transition: all 0.2s;

        &:hover {
          background-color: #f4f4f5;
        }
      }
    }
  }

  .pagination-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 16px;
    padding: 0 4px;

    @media (min-width: 768px) {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      margin-top: 24px;
      padding: 0 8px;
    }

    .page-info {
      display: flex;
      align-items: center;
      gap: 12px;

      @media (min-width: 768px) {
        gap: 16px;
      }

      .total-text {
        font-size: 13px;
        color: #606266;
      }

      .page-size-select {
        width: 100px;
      }
    }

    :deep(.custom-pagination) {
      margin: 0;
      display: flex;
      justify-content: center;

      @media (min-width: 768px) {
        justify-content: flex-end;
      }

      .el-pagination__total {
        font-size: 13px;
      }

      .btn-prev,
      .btn-next {
        background-color: #fff;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        margin: 0 4px;

        &:hover:not(:disabled) {
          background-color: #f4f4f5;
          border-color: #c0c4cc;
        }

        &:disabled {
          background-color: #f4f4f5;
          border-color: #e4e7ed;
        }
      }

      .el-pager li {
        background-color: #fff;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        margin: 0 2px;
        font-weight: 500;
        min-width: 32px;

        &:hover:not(.is-active) {
          background-color: #f4f4f5;
          border-color: #c0c4cc;
        }

        &.is-active {
          background-color: var(--el-color-primary);
          border-color: var(--el-color-primary);
          font-weight: 600;
        }
      }
    }
  }
}
</style>
