<script setup lang="ts">
import { computed, ref } from 'vue'
import { CalendarHeatmap } from 'vue3-calendar-heatmap'
import 'vue3-calendar-heatmap/dist/style.css'

interface YearData {
  year: number
  values: number[]
}

interface Props {
  title: string
  subtitle?: string
  color: 'blue' | 'green'
  datasets: YearData[]
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: '',
})

const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const selectedYear = ref(props.datasets[0]?.year ?? new Date().getFullYear())

const sortedYears = computed(() => props.datasets.map((item) => item.year).sort((a, b) => b - a))

const selectedDataset = computed(
  () => props.datasets.find((item) => item.year === selectedYear.value) ?? props.datasets[0],
)

const colorRange = computed(() =>
  props.color === 'blue'
    ? ['#ebedf0', '#c6e6ff', '#7ec8ff', '#3fa7ff', '#1e6ed8']
    : ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
)

const heatmapValues = computed(() => {
  const targetYear = selectedDataset.value?.year ?? selectedYear.value
  const values = selectedDataset.value?.values ?? []
  const list: Array<{ date: string; count: number }> = []
  const start = new Date(targetYear, 0, 1)
  const end = new Date(targetYear, 11, 31)
  let day = new Date(start)
  let idx = 0
  while (day <= end) {
    const yyyy = day.getFullYear()
    const mm = String(day.getMonth() + 1).padStart(2, '0')
    const dd = String(day.getDate()).padStart(2, '0')
    list.push({ date: `${yyyy}-${mm}-${dd}`, count: values[idx] ?? 0 })
    day.setDate(day.getDate() + 1)
    idx += 1
  }
  return list
})
</script>

<template>
  <section class="contrib-card">
    <header class="contrib-head">
      <h3>{{ title }}</h3>
      <p v-if="subtitle">{{ subtitle }}</p>
    </header>

    <div class="contrib-wrap">
      <div class="contrib-main">
        <div class="contrib-months">
          <span v-for="m in monthLabels" :key="m">{{ m }}</span>
        </div>
        <div class="contrib-heatmap">
          <CalendarHeatmap
            :values="heatmapValues"
            :range-color="colorRange"
            :end-date="new Date(selectedYear, 11, 31)"
            :tooltip-unit="'次'"
          />
        </div>
      </div>
      <aside class="contrib-years">
        <button
          v-for="year in sortedYears"
          :key="year"
          type="button"
          class="contrib-year-btn"
          :class="{ active: year === selectedYear }"
          @click="selectedYear = year"
        >
          {{ year }}
        </button>
      </aside>
    </div>
  </section>
</template>
