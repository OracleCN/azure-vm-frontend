<template>
  <div class="p-4 md:p-6 bg-white rounded-lg shadow-sm">
    <!-- 顶部搜索区域 -->
    <div class="bg-gray-50 p-3 md:p-4 rounded-lg mb-4 md:mb-6">
      <div class="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
        <el-input
          v-model="searchQuery"
          placeholder="搜索邮箱或备注"
          class="w-full max-w-[260px]"
          size="default"
          clearable
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon class="text-gray-400"><Search /></el-icon>
          </template>
        </el-input>

        <!-- 账户统计信息 -->
        <div class="flex flex-wrap gap-3 md:gap-6">
          <div class="flex items-center text-sm md:text-base">
            <span class="text-gray-600">总账户：</span>
            <span class="ml-1 font-medium text-gray-900">{{ accountStore.accountStats.total }}</span>
          </div>
          <div class="flex items-center text-sm md:text-base">
            <span class="text-gray-600">正常：</span>
            <span class="ml-1 font-medium text-green-500">{{ accountStore.accountStats.normal }}</span>
          </div>
          <div class="flex items-center text-sm md:text-base">
            <span class="text-gray-600">异常：</span>
            <span class="ml-1 font-medium text-red-500">{{ accountStore.accountStats.error }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 表格 -->
    <div class="w-full overflow-x-auto mb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
      <el-table
        :data="filteredAccounts"
        style="width: 100%"
        :default-sort="{ prop: 'CreatedAt', order: 'descending' }"
        size="default"
        v-loading="accountStore.loading"
        class="[&_.el-table__header_th]:bg-gray-50 [&_.el-table__header_th]:text-gray-700 [&_.el-table__header_th]:font-semibold [&_.el-table__header_th]:h-11 [&_.el-table__header_th]:p-2"
      >
        <el-table-column type="index" label="序号" width="80" align="center" />
        <el-table-column prop="loginEmail" label="登录邮箱" min-width="160" :show-overflow-tooltip="true">
          <template #default="{ row }">
            <span class="font-medium text-gray-900">{{ row.loginEmail }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="displayName" label="显示名称" min-width="160" :show-overflow-tooltip="true">
          <template #default="{ row }">
            <span class="text-gray-600">{{ row.displayName }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="140" :show-overflow-tooltip="true">
          <template #default="{ row }">
            <span class="text-gray-600">{{ row.remark }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="subscription_status" label="状态" min-width="80" align="center">
          <template #default="{ row }">
            <el-tag
              :type="row.subscription_status === 'normal' ? 'success' : 'danger'"
              effect="light"
              size="small"
              class="[&.el-tag--success]:bg-green-50 [&.el-tag--success]:border-green-200 [&.el-tag--success]:text-green-600 [&.el-tag--danger]:bg-red-50 [&.el-tag--danger]:border-red-200 [&.el-tag--danger]:text-red-600"
            >
              {{ row.subscription_status === "normal" ? "正常" : "异常" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="vmCount" label="虚拟机数" min-width="90" align="center">
          <template #default="{ row }">
            <span class="font-medium">{{ row.vmCount }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="CreatedAt"
          label="创建时间"
          min-width="160"
          align="center"
          sortable
          :show-overflow-tooltip="true"
        >
          <template #default="{ row }">
            <span class="text-gray-600">{{ formatDate(row.CreatedAt) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="UpdatedAt" label="更新时间" min-width="160" align="center" :show-overflow-tooltip="true">
          <template #default="{ row }">
            <span class="text-gray-600">{{ formatDate(row.UpdatedAt) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right" align="center">
          <template #default="{ row }">
            <div class="flex justify-center gap-2">
              <el-button
                type="primary"
                link
                @click="handleEdit(row)"
                size="small"
                class="text-sm px-2 py-1 rounded hover:bg-gray-100"
              >
                编辑
              </el-button>
              <el-button
                type="danger"
                link
                @click="handleDelete(row)"
                size="small"
                class="text-sm px-2 py-1 rounded hover:bg-gray-100"
              >
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页器 -->
    <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mt-4 md:mt-6 px-1 md:px-2">
      <div class="flex items-center gap-3 md:gap-4">
        <span class="text-sm text-gray-600">共 {{ accountStore.total }} 条记录</span>
        <el-select v-model="pageSize" class="w-[100px]" size="small" @change="handlePageSizeChange">
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
        @current-change="handleCurrentChange"
        class="flex justify-center md:justify-end m-0 [&_.el-pagination__total]:text-sm [&_.btn-prev]:bg-white [&_.btn-prev]:border [&_.btn-prev]:border-gray-300 [&_.btn-prev]:rounded [&_.btn-prev]:mx-1 [&_.btn-prev:hover]:bg-gray-100 [&_.btn-prev:hover]:border-gray-400 [&_.btn-prev:disabled]:bg-gray-100 [&_.btn-prev:disabled]:border-gray-300 [&_.btn-next]:bg-white [&_.btn-next]:border [&_.btn-next]:border-gray-300 [&_.btn-next]:rounded [&_.btn-next]:mx-1 [&_.btn-next:hover]:bg-gray-100 [&_.btn-next:hover]:border-gray-400 [&_.btn-next:disabled]:bg-gray-100 [&_.btn-next:disabled]:border-gray-300 [&_.el-pager_li]:bg-white [&_.el-pager_li]:border [&_.el-pager_li]:border-gray-300 [&_.el-pager_li]:rounded [&_.el-pager_li]:mx-0.5 [&_.el-pager_li]:font-medium [&_.el-pager_li]:min-w-[32px] [&_.el-pager_li:hover]:bg-gray-100 [&_.el-pager_li:hover]:border-gray-400 [&_.el-pager_li.is-active]:bg-blue-500 [&_.el-pager_li.is-active]:border-blue-500 [&_.el-pager_li.is-active]:font-semibold"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue"
import { Search } from "@element-plus/icons-vue"
import { ElMessageBox, ElMessage } from "element-plus"
import { useAccountStore } from "@/store/modules/account"

// 初始化 store
const accountStore = useAccountStore()

// 响应式状态
const searchQuery = ref("")
const currentPage = ref(1)
const pageSize = ref(10)

// 日期格式化函数
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  })
}

// 计算属性：过滤后的账户列表
const filteredAccounts = computed(() => {
  if (!searchQuery.value) return accountStore.paginatedAccounts

  const query = searchQuery.value.toLowerCase()
  return accountStore.accounts.filter(
    (account) =>
      account.loginEmail.toLowerCase().includes(query) ||
      account.displayName.toLowerCase().includes(query) ||
      (account.remark?.toLowerCase().includes(query) ?? false)
  )
})

// 处理搜索
const handleSearch = () => {
  refreshData()
}

// 处理分页变化
const handleCurrentChange = (page: number) => {
  currentPage.value = page
  refreshData()
}

const handlePageSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  refreshData()
}

// 刷新数据
const refreshData = async () => {
  try {
    await accountStore.fetchAccounts({
      page: currentPage.value,
      pageSize: pageSize.value,
      search: searchQuery.value
    })
  } catch (err) {
    console.error("获取账户列表失败:", err)
    ElMessage.error("获取账户列表失败")
  }
}

// 操作处理函数
const handleEdit = (row: any) => {
  console.log("编辑账户:", row)
  // TODO: 实现编辑逻辑
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm("确认删除该账户吗？此操作不可逆", "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    })
    // id 转为 string 数组
    const ids = [row.accountId.toString()]
    await accountStore.deleteAccount(ids)
    refreshData()
  } catch (err) {
    if (err === "cancel") return
  }
}

// 监听分页和搜索变化
watch([currentPage, pageSize, searchQuery], () => {
  accountStore.setPageParams(currentPage.value, pageSize.value)
})

// 生命周期钩子
onMounted(async () => {
  refreshData()
})
</script>
