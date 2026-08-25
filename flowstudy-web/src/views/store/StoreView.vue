<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  claimCoupon,
  createStoreOrder,
  fetchStoreCoupons,
  fetchStoreOrders,
  fetchStoreProducts,
  fetchTokenAccount,
  payStoreOrder,
} from '../../api/modules/store'
import type { StoreCoupon, StoreOrder, StoreProduct, TokenAccount } from '../../api/modules/store'

const products = ref<StoreProduct[]>([])
const coupons = ref<StoreCoupon[]>([])
const orders = ref<StoreOrder[]>([])
const account = ref<TokenAccount>({ totalTokens: 0, usedTokens: 0, availableTokens: 0 })
const selectedCoupon = ref<number>()
const loading = ref(true)
const submittingProduct = ref<number>()
const error = ref('')
const notice = ref('')

const availableCoupons = computed(() => coupons.value.filter((coupon) => coupon.status === 'AVAILABLE'))

function money(cents: number) {
  return `¥${(cents / 100).toFixed(2)}`
}

function saleDescription(product: StoreProduct) {
  if (product.stock <= 0) return '已售罄'
  if (product.saleEndAt) return `活动截止 ${product.saleEndAt.slice(0, 16)}`
  return '长期有效'
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [productData, couponData, accountData, orderData] = await Promise.all([
      fetchStoreProducts(),
      fetchStoreCoupons(),
      fetchTokenAccount(),
      fetchStoreOrders(),
    ])
    products.value = productData
    coupons.value = couponData
    account.value = accountData
    orders.value = orderData
  } catch (err) {
    error.value = err instanceof Error ? err.message : '商城加载失败'
  } finally {
    loading.value = false
  }
}

async function receiveCoupon(couponId: number) {
  try {
    await claimCoupon(couponId)
    notice.value = '优惠券领取成功'
    await load()
  } catch (err) {
    error.value = err instanceof Error ? err.message : '优惠券领取失败'
  }
}

async function buy(product: StoreProduct) {
  submittingProduct.value = product.id
  error.value = ''
  notice.value = ''
  try {
    const order = await createStoreOrder(product.id, selectedCoupon.value)
    let persistedOrder: StoreOrder | undefined
    for (let attempt = 0; attempt < 20; attempt += 1) {
      persistedOrder = (await fetchStoreOrders()).find((item) => item.orderNo === order.orderNo)
      if (persistedOrder?.id) break
      await new Promise((resolve) => setTimeout(resolve, 250))
    }
    if (!persistedOrder?.id) throw new Error('订单正在排队，请稍后在订单记录中支付')
    const paidOrder = await payStoreOrder(persistedOrder.id)
    notice.value = `购买成功，已到账 ${paidOrder.tokenAmount.toLocaleString()} Token`
    selectedCoupon.value = undefined
    await load()
  } catch (err) {
    error.value = err instanceof Error ? err.message : '购买失败'
  } finally {
    submittingProduct.value = undefined
  }
}

onMounted(load)
</script>

<template>
  <main class="store-page">
    <section class="store-hero card">
      <div>
        <p class="eyebrow">TOKEN STORE</p>
        <h1>会员 Token 商城</h1>
        <p>购买 AI 学习额度，限时活动按照后端配置的时间和库存自动开放。</p>
      </div>
      <div class="token-balance">
        <span>当前可用额度</span>
        <strong>{{ account.availableTokens.toLocaleString() }}</strong>
        <small>总额度 {{ account.totalTokens.toLocaleString() }} · 已使用 {{ account.usedTokens.toLocaleString() }}</small>
      </div>
    </section>

    <p v-if="notice" class="store-notice">{{ notice }}</p>
    <p v-if="error" class="store-error">{{ error }}</p>
    <section v-if="loading" class="card loading-card">正在加载商城...</section>

    <template v-else>
      <section class="card">
        <div class="section-heading">
          <div><p class="eyebrow">PACKAGES</p><h2>Token 套餐</h2></div>
          <span class="muted">当前支付为本地模拟支付</span>
        </div>
        <div class="product-grid">
          <article v-for="product in products" :key="product.id" class="product-card">
            <span class="sale-tag">{{ product.saleEndAt ? '限时活动' : '常规套餐' }}</span>
            <h3>{{ product.name }}</h3>
            <p class="product-description">{{ product.description }}</p>
            <strong class="price">{{ money(product.priceCents) }}</strong>
            <span class="token-count">{{ product.tokenAmount.toLocaleString() }} Token</span>
            <small class="muted">{{ saleDescription(product) }} · 已售 {{ product.soldCount }}</small>
            <button class="primary-btn" :disabled="submittingProduct === product.id || product.stock <= 0" @click="buy(product)">
              {{ submittingProduct === product.id ? '处理中...' : product.stock <= 0 ? '已售罄' : '立即购买' }}
            </button>
          </article>
        </div>
      </section>

      <section class="card">
        <div class="section-heading">
          <div><p class="eyebrow">COUPONS</p><h2>我的优惠券</h2></div>
          <span class="muted">下单前选择一张可用优惠券</span>
        </div>
        <div v-if="availableCoupons.length" class="coupon-list">
          <div v-for="coupon in availableCoupons" :key="coupon.id" class="coupon-item">
            <div><strong>{{ coupon.name }}</strong><p>立减 {{ money(coupon.discountCents) }}，满 {{ money(coupon.minOrderCents) }} 可用</p><small>有效期至 {{ coupon.validUntil.slice(0, 16) }}</small></div>
            <button class="secondary-btn" @click="selectedCoupon = coupon.id">{{ selectedCoupon === coupon.id ? '已选择' : '选择使用' }}</button>
          </div>
        </div>
        <p v-else class="muted">暂无可用优惠券。</p>
        <button v-if="!coupons.length" class="secondary-btn" @click="receiveCoupon(1)">领取新用户优惠券</button>
      </section>

      <section class="card">
        <div class="section-heading"><div><p class="eyebrow">ORDERS</p><h2>购买记录</h2></div></div>
        <div v-if="orders.length" class="order-list">
          <div v-for="order in orders" :key="order.id" class="order-item"><span>{{ order.productName }}</span><span>{{ money(order.payableAmountCents) }}</span><span>{{ order.status === 'PAID' ? `已到账 ${order.tokenAmount} Token` : '待支付' }}</span></div>
        </div>
        <p v-else class="muted">还没有购买记录。</p>
      </section>
    </template>
  </main>
</template>

<style scoped>
.store-page { max-width: 1180px; margin: 0 auto; padding: 28px; }
.store-hero { display: flex; justify-content: space-between; align-items: center; background: linear-gradient(120deg, #102f56, #1d78ba); color: white; }
.store-hero h1 { margin: 6px 0 10px; font-size: 32px; }.store-hero p { color: #dbeeff; }.eyebrow { letter-spacing: 2px; font-size: 12px; margin: 0 0 5px; color: #5b88b2; }.store-hero .eyebrow { color: #b9dcfa; }
.token-balance { min-width: 240px; padding: 18px 24px; border-radius: 12px; background: #ffffff1c; display: grid; gap: 5px; }.token-balance strong { font-size: 34px; }.token-balance small { color: #dbeeff; }
.section-heading { display: flex; justify-content: space-between; align-items: center; }.section-heading h2 { margin: 0 0 16px; }.product-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }.product-card { position: relative; border: 1px solid #d7e7f7; border-radius: 12px; padding: 20px; display: grid; gap: 10px; }.product-card h3 { margin: 4px 0; }.product-description { min-height: 42px; color: #7188a2; }.sale-tag { position: absolute; top: 14px; right: 14px; color: #e77826; font-size: 12px; }.price { font-size: 28px; color: #ed782e; }.token-count { color: #2376c8; font-weight: 700; }.product-card button { margin-top: 8px; }.coupon-list, .order-list { display: grid; gap: 10px; }.coupon-item, .order-item { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 12px 14px; border: 1px solid #e0ebf5; border-radius: 10px; }.coupon-item p { margin: 6px 0; color: #647c98; }.muted { color: #7188a2; font-size: 13px; }.store-notice, .store-error { padding: 12px 16px; border-radius: 8px; }.store-notice { background: #e8f8ed; color: #208344; }.store-error { background: #fff0f0; color: #bd3030; }.loading-card { text-align: center; }
@media (max-width: 700px) { .store-page { padding: 16px; }.store-hero { display: block; }.token-balance { margin-top: 18px; }.coupon-item, .order-item { align-items: flex-start; flex-direction: column; } }
</style>
