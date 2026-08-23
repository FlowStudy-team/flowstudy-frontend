import { request } from './request'
import type { PageResult } from '../types/common'

export interface AdminDashboard { users: Record<string, number>; tutorials: Record<string, number>; blogs: Record<string, number>; problems: Record<string, number>; orders: Record<string, number>; pendingContent: Record<string, number> }
export interface AdminProductRequest { name: string; description?: string; priceCents: number; tokenAmount: number; stock: number; saleStartAt?: string; saleEndAt?: string; status?: string; sortOrder?: number }
export interface AdminCouponRequest { name: string; couponType: string; discountCents: number; minOrderCents: number; totalCount: number; startAt: string; endAt: string; status?: string }
export async function getAdminDashboard() { return request<AdminDashboard>('/admin/dashboard') }
export async function getAdminUsers(params: Record<string, string | number | undefined>) { return request<PageResult<Record<string, unknown>>>(`/admin/users?${new URLSearchParams(clean(params))}`) }
export async function updateAdminUserStatus(id: number, status: number) { return request<void>(`/admin/users/${id}/status?status=${status}`, { method: 'PUT' }) }
export async function getAdminContent(type: string, params: Record<string, string | number | undefined>) { return request<PageResult<Record<string, unknown>>>(`/admin/${type}?${new URLSearchParams(clean(params))}`) }
export async function updateAdminContentStatus(type: string, id: number, status: string) { return request<void>(`/admin/${type}/${id}/status?status=${status}`, { method: 'PUT' }) }
export async function getAdminProducts() { return request<Record<string, unknown>[]>('/admin/store/products') }
export async function createAdminProduct(body: AdminProductRequest) { return request<void>('/admin/store/products', { method: 'POST', body: JSON.stringify(body) }) }
export async function updateAdminProductStatus(id: number, status: string) { return request<void>(`/admin/store/products/${id}/status?status=${status}`, { method: 'PUT' }) }
export async function getAdminCoupons() { return request<Record<string, unknown>[]>('/admin/store/coupons') }
export async function createAdminCoupon(body: AdminCouponRequest) { return request<void>('/admin/store/coupons', { method: 'POST', body: JSON.stringify(body) }) }
export async function getAdminOrders(params: Record<string, string | number | undefined>) { return request<PageResult<Record<string, unknown>>>(`/admin/orders?${new URLSearchParams(clean(params))}`) }
export async function getAdminAuditLogs(params: Record<string, string | number | undefined>) { return request<PageResult<Record<string, unknown>>>(`/admin/audit-logs?${new URLSearchParams(clean(params))}`) }
function clean(params: Record<string, string | number | undefined>) { return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== '')) as Record<string, string> }
