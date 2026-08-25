import { request } from '../request'

export interface StoreProduct {
  id: number
  name: string
  description?: string
  priceCents: number
  tokenAmount: number
  stock: number
  soldCount: number
  saleStartAt?: string
  saleEndAt?: string
  status: string
}

export interface StoreCoupon {
  id: number
  couponId: number
  name: string
  couponType: string
  discountCents: number
  minOrderCents: number
  status: string
  validUntil: string
}

export interface StoreOrder {
  id?: number
  orderNo: string
  productId: number
  productName: string
  originalAmountCents: number
  discountAmountCents: number
  payableAmountCents: number
  tokenAmount: number
  status: string
  createdAt: string
  paidAt?: string
}

export interface TokenAccount {
  totalTokens: number
  usedTokens: number
  availableTokens: number
}

export const fetchStoreProducts = () => request<StoreProduct[]>('/store/products')
export const fetchStoreCoupons = () => request<StoreCoupon[]>('/store/coupons')
export const fetchTokenAccount = () => request<TokenAccount>('/store/account')
export const fetchStoreOrders = () => request<StoreOrder[]>('/store/orders')

export const claimCoupon = (couponId: number) => request<void>(`/store/coupons/${couponId}/claim`, { method: 'POST' })

export const createStoreOrder = (productId: number, userCouponId?: number) => request<StoreOrder>('/store/orders', {
  method: 'POST',
  body: JSON.stringify({ productId, userCouponId }),
})

export const payStoreOrder = (orderId: number) => request<StoreOrder>(`/store/orders/${orderId}/pay`, { method: 'POST' })
