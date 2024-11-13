<template>
  <div class="account-container p-4 sm:p-6">
    <!-- 搜索栏 -->
    <div class="mb-6 bg-white p-4 rounded-lg shadow-sm flex justify-between">
      <el-form :inline="true" class="flex flex-wrap gap-4">
        <el-form-item class="mb-0 flex-1 min-w-[200px]">
          <el-input v-model="searchKeyword" placeholder="搜索账号名称或邮箱" clearable @keyup.enter="handleSearch">
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item class="mb-0">
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
          <el-button type="success" :loading="accountStore.loading" @click="handleSyncAll"> 同步所有 </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 表格 -->
    <div class="bg-white rounded-lg shadow-sm">
      <el-table v-loading="accountStore.loading" :data="accountStore.accounts" style="width: 100%" class="custom-table">
        <el-table-column prop="displayName" label="账号名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="loginEmail" label="邮箱" min-width="200" show-overflow-tooltip />
        <el-table-column prop="subscriptionStatus" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="row.subscriptionStatus === 'normal' ? 'success' : 'danger'">
              {{ row.subscriptionStatus === "normal" ? "正常" : "异常" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="vmCount" label="虚拟机数量" width="120" align="center" />
        <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="创建时间" min-width="180" show-overflow-tooltip />
        <el-table-column fixed="right" label="操作" width="120">
          <template #default="{ row }">
            <el-button link type="primary" :loading="accountStore.loading" @click="handleSync(row)"> 同步 </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="flex justify-end p-4">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="accountStore.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @size-change="refreshList"
          @current-change="refreshList"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.account-container {
  min-height: calc(100vh - 60px);
  background-color: #f0f2f5;
}

.custom-table :deep(.el-table__inner-wrapper) {
  border-radius: 8px 8px 0 0;
}

/* 响应式调整 */
@media (max-width: 640px) {
  .account-container {
    padding: 1rem;
  }

  .el-form-item {
    margin-right: 0;
  }
}

/* 表格在移动端的优化 */
@media (max-width: 768px) {
  .custom-table :deep(.el-table__body) {
    width: 100%;
  }

  .custom-table :deep(.el-table__header) {
    width: 100%;
  }
}
</style>

<script lang="ts" setup>
import { ref, onMounted, computed } from "vue"
import { useAccountStore } from "@/store/modules/account"
import { ElMessage, ElMessageBox } from "element-plus"
import type { Account } from "@/api/account/types/account"

const accountStore = useAccountStore()
const searchKeyword = ref("")
const currentPage = ref(1)
const pageSize = ref(10)

// 查询参数
const queryParams = computed(() => ({
  page: currentPage.value,
  pageSize: pageSize.value,
  search: searchKeyword.value
}))

// 刷新列表
const refreshList = async () => {
  await accountStore.fetchAccounts(queryParams.value)
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  refreshList()
}

// 重置搜索
const resetSearch = () => {
  searchKeyword.value = ""
  currentPage.value = 1
  refreshList()
}

// 同步单个账号
const handleSync = async (row: Account) => {
  try {
    await ElMessageBox.confirm("确定要同步该账号吗？", "提示", {
      type: "warning"
    })
    const response = await accountStore.syncAccounts([row.accountId])

    // 处理同步结果
    const { successAccounts, failedAccounts } = response.data

    if (successAccounts.length > 0) {
      const result = successAccounts[0]
      ElMessage.success(`同步成功：发现 ${result.subscriptionCount} 个订阅，${result.vmCount} 个虚拟机`)
    } else if (failedAccounts.length > 0) {
      const result = failedAccounts[0]
      ElMessage.error(`同步失败：${result.message}`)
    }

    refreshList()
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("同步失败")
    }
  }
}

// 同步所有账号
const handleSyncAll = async () => {
  try {
    await ElMessageBox.confirm("确定要同步所有账号吗？", "提示", {
      type: "warning"
    })
    const accountIds = accountStore.accounts.map((item) => item.accountId)
    const response = await accountStore.syncAccounts(accountIds)

    // 处理同步结果
    const { successAccounts, failedAccounts } = response.data

    // 构建详细的消息
    const successMsg =
      successAccounts.length > 0
        ? `成功同步 ${successAccounts.length} 个账号，共发现 ${successAccounts.reduce(
            (sum, acc) => sum + acc.subscriptionCount,
            0
          )} 个订阅，${successAccounts.reduce((sum, acc) => sum + acc.vmCount, 0)} 个虚拟机`
        : ""

    const failMsg = failedAccounts.length > 0 ? `${failedAccounts.length} 个账号同步失败` : ""

    if (successAccounts.length > 0) {
      ElMessage.success(successMsg)
    }

    if (failedAccounts.length > 0) {
      ElMessage.error(failMsg)
    }

    refreshList()
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("同步失败")
    }
  }
}

onMounted(() => {
  refreshList()
})
</script>
