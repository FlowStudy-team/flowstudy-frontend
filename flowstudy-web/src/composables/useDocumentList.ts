import { reactive, ref } from 'vue'
import { getDocumentList } from '../api/document'
import type { DocumentItem, DocumentQuery, DocumentStatus } from '../types/document'

export function useDocumentList() {
  const loading = ref(false)
  const error = ref('')
  const list = ref<DocumentItem[]>([])
  const total = ref(0)

  const query = reactive<DocumentQuery>({
    keyword: '',
    status: undefined,
    categoryId: undefined,
    tag: '',
    page: 1,
    pageSize: 9,
  })

  async function fetchList() {
    loading.value = true
    error.value = ''
    try {
      const result = await getDocumentList({ ...query })
      list.value = result.list
      total.value = result.total
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载失败'
    } finally {
      loading.value = false
    }
  }

  function resetQuery() {
    query.keyword = ''
    query.status = undefined
    query.categoryId = undefined
    query.tag = ''
    query.page = 1
  }

  function setStatus(status?: DocumentStatus) {
    query.status = status
    query.page = 1
  }

  function changePage(page: number) {
    query.page = page
  }

  return { loading, error, list, total, query, fetchList, resetQuery, setStatus, changePage }
}
