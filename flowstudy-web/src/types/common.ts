export interface ApiResponse<T> {
  code: number
  message: string
  data: T
  traceId: string
  timestamp: number
}

export interface PageQuery {
  page: number
  pageSize: number
  keyword?: string
}

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}
