<template>
  <div
    ref="containerRef"
    class="waterfall-container"
    :style="{ padding: props.gap + 'px' }"
    @scroll="handleScroll"
  >
    <div ref="listRef" class="waterfall-list">
      <div
        v-for="(item, index) in state.showData"
        :key="item.id"
        class="waterfall-item"
        :style="{
          width: `${item.cardWidth}px`,
          transform: `translate3d(${item.x}px, ${item.y}px, 0)`
        }"
      >
        <slot name="item" :item="item" :index="index">
          <WaterfallsFlowItem :detail="item" />
          <!-- <div class="waterfall-item-box" :style="{ background: item.bgColor }">
            <img :src="item.url" />
          </div> -->
        </slot>
      </div>
      <div
        v-if="state.loading"
        class="waterfall-loading"
        :style="{ transform: `translate3d(0px, ${findMaxValue(state.columnHeight)}px, 0px)` }"
      >
        Loading...
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, onUnmounted, nextTick } from 'vue'
import { listData, rafThrottle, debounce } from './tool'
import WaterfallsFlowItem from './Item.vue'

const colorArr = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399']
const props = defineProps({
  gap: {
    type: Number,
    default: 10
  },
  bottom: {
    type: Number,
    default: 20
  },
  pageSize: {
    type: Number,
    default: 20
  },
  request: {
    type: Function,
    default: (page, pageSize) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(listData.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize))
        }, 1000)
      })
    }
  }
})

const containerRef = ref(null) // 绑定 template 上的 container，需要容器宽度
const listRef = ref(null)
const state = reactive({
  sourceData: [],
  showData: [],
  column: 4,
  columnHeight: new Array(4).fill(0),

  isFinish: false,
  cardWidth: 0,
  page: 1,
  loading: false,
  preLen: 0
})

const resizeObserver = new ResizeObserver(() => {
  handleResize()
})

onMounted(() => {
  init()
  containerRef.value && resizeObserver.observe(containerRef.value)
})

onUnmounted(() => {
  containerRef.value && resizeObserver.unobserve(containerRef.value)
})

const init = () => {
  if (containerRef.value) {
    const containerWidth = containerRef.value.clientWidth
    const column = changeColumn(containerWidth)

    state.cardWidth = (containerWidth - props.gap * (column + 1)) / column
    state.columnHeight = new Array(column).fill(0)
    state.column = column
    state.showData = []
    state.preLen = 0

    getSourceData(state.page, props.pageSize)
  }
}

const getSourceData = async (page, pageSize) => {
  if (state.isFinish) return
  state.loading = true
  const list = await props.request(page, pageSize)
  state.page++
  if (!list.length) {
    state.isFinish = true
    return
  }
  state.sourceData = [...state.sourceData, ...list]
  computedCardPos(list)
  state.loading = false
}

const computedCardPos = async (list) => {
  computedImageHeight(list)
  await nextTick()
  computedRealDomPos(list)
}

const computedImageHeight = (list) => {
  list.forEach((item, index) => {
    const imageHeight = Math.floor((item.height * state.cardWidth) / item.width)
    state.showData.push({
      ...item,
      cardWidth: state.cardWidth,
      cardHeight: 0,
      imageHeight: imageHeight,
      x: 0,
      y: 0,
      bgColor: colorArr[index % (colorArr.length - 1)]
    })
  })
}

const computedRealDomPos = (list) => {
  const children = listRef.value.children
  list.forEach((_, index) => {
    const nextIndex = state.preLen + index
    const cardHeight = children[nextIndex].getBoundingClientRect().height
    if (index < state.column && state.sourceData.length <= props.pageSize) {
      state.showData[nextIndex] = {
        ...state.showData[nextIndex],
        cardHeight: cardHeight,
        x: nextIndex % state.column !== 0 ? nextIndex * (state.cardWidth + props.gap) : 0,
        y: 0
      }
      state.columnHeight[nextIndex] = cardHeight + props.gap
    } else {
      const { minIndex, minHeight } = minColumn.value
      state.showData[nextIndex] = {
        ...state.showData[nextIndex],
        cardHeight: cardHeight,
        x: minIndex % state.column !== 0 ? minIndex * (state.cardWidth + props.gap) : 0,
        y: minHeight
      }
      state.columnHeight[minIndex] += cardHeight + props.gap
    }
  })
  state.preLen = state.showData.length
}

const minColumn = computed(() => {
  let minIndex = -1,
    minHeight = Infinity

  state.columnHeight.forEach((item, index) => {
    if (item < minHeight) {
      minHeight = item
      minIndex = index
    }
  })

  return {
    minIndex,
    minHeight
  }
})

const handleScroll = rafThrottle(() => {
  const { scrollTop, clientHeight, scrollHeight } = containerRef.value
  const bottom = scrollHeight - clientHeight - scrollTop
  if (bottom <= props.bottom) {
    !state.loading && getSourceData(state.page, props.pageSize)
  }
})

const handleResize = debounce(() => {
  if (containerRef.value) {
    const containerWidth = containerRef.value.clientWidth
    const column = changeColumn(containerWidth)

    state.cardWidth = (containerWidth - props.gap * (column + 1)) / column
    state.columnHeight = new Array(column).fill(0)
    state.column = column
    state.showData = []
    state.preLen = 0

    computedCardPos(state.sourceData)
  }
})

const changeColumn = (width) => {
  let column = 0
  if (width > 960) {
    column = 5
  } else if (width >= 690 && width < 960) {
    column = 4
  } else if (width >= 500 && width < 690) {
    column = 3
  } else {
    column = 2
  }
  return column
}

const findMaxValue = (arr) => {
  let maxValue = arr[0]
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > maxValue) {
      maxValue = arr[i]
    }
  }
  return maxValue
}
</script>

<style scoped lang="less">
.waterfall {
  &-container {
    width: 100%;
    // height: 100%;
    height: 600px;
    overflow-y: scroll; // 注意需要提前设置展示滚动条，如果等数据展示再出现滚动造成计算偏差
    overflow-x: hidden;
    border: 1px solid red;
  }

  &-list {
    width: 100%;
    position: relative;
  }
  &-item {
    position: absolute;
    left: 0;
    top: 0;
    box-sizing: border-box;
    &-box {
      position: relative;
      width: 100%;
      height: 100%;
      border-radius: 10px;
    }
  }

  &-loading {
    background: #ccc;
    border-radius: 10px;
    box-sizing: border-box;
    height: 50px;
    left: 0;
    line-height: 50px;
    position: absolute;
    text-align: center;
    top: 0;
    width: 100%;
  }
}
</style>
