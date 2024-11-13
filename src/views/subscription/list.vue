<script lang="ts" setup>
import { ref, onMounted, computed } from "vue"
import { useSubscriptionStore } from "@/store/modules/subscription"

const subscriptionStore = useSubscriptionStore()
const searchKeyword = ref("")
const currentPage = ref(1)
const pageSize = ref(10)
const tableRef = ref()

// 查询参数
const queryParams = computed(() => ({
  page: currentPage.value,
  pageSize: pageSize.value,
  search: searchKeyword.value
}))

// 刷新列表
const refreshList = async () => {
  await subscriptionStore.fetchSubscriptions(queryParams.value)
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

onMounted(() => {
  refreshList()
})
</script>

<template>
  <div class="subscription-container p-4 sm:p-6">
    <!-- 搜索栏 -->
    <div class="mb-6 bg-white p-4 rounded-lg shadow-sm">
      <el-form :inline="true" class="flex flex-wrap gap-4">
        <el-form-item class="mb-0 w-[300px]">
          <el-input v-model="searchKeyword" placeholder="搜索订阅名称" clearable @keyup.enter="handleSearch">
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item class="mb-0">
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 表格 -->
    <div class="bg-white rounded-lg shadow-sm">
      <el-table
        ref="tableRef"
        v-loading="subscriptionStore.loading"
        :data="subscriptionStore.subscriptions"
        style="width: 100%"
        class="custom-table"
      >
        <el-table-column prop="DisplayName" label="订阅名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="SubscriptionID" label="订阅ID" min-width="200" show-overflow-tooltip />
        <el-table-column prop="State" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="row.State === 'Enabled' ? 'success' : 'danger'">
              {{ row.State }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="SubscriptionType" label="订阅类型" min-width="150" />
        <el-table-column prop="StartDate" label="开始日期" min-width="180" show-overflow-tooltip />
        <el-table-column prop="EndDate" label="结束日期" min-width="180" show-overflow-tooltip />
      </el-table>

      <!-- 分页 -->
      <div class="flex justify-end p-4">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="subscriptionStore.total"
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
.subscription-container {
  min-height: calc(100vh - 60px);
  background-color: #f0f2f5;
}

.custom-table :deep(.el-table__inner-wrapper) {
  border-radius: 8px 8px 0 0;
}

/* 响应式调整 */
@media (max-width: 640px) {
  .subscription-container {
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
