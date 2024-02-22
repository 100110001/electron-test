<template>
  <div>
    <div style="height: 200px">
      {{ state.selectedKey }}
      {{ state.actionKey }}
      {{ state.rule }}
      {{ state.model }}
    </div>

    <div>
      <span v-for="option in state.ruleOptions" :key="option.id">
        <input :id="option.id" v-model="state.rule" type="radio" :value="option.value" />
        <label :for="option.id">{{ option.label }}</label>
      </span>
    </div>

    <div>
      <span v-for="option in state.modelOptions" :key="option.id">
        <input :id="option.id" v-model="state.model" type="radio" :value="option.value" />
        <label :for="option.id">{{ option.label }}</label>
      </span>
    </div>

    <div ref="boxRef" class="boxRef">
      <div
        v-for="item in 50"
        :key="item"
        class="basisBox"
        :data-key="item"
        :class="state.selectedKey.includes(String(item)) ? 'selectedBox' : ''"
      ></div>
    </div>
  </div>
</template>

<script setup>
// https://juejin.cn/post/7326979670485123110?searchId=20240220101756489636F83D8E96550573
import { onMounted, reactive, ref } from 'vue'
import { throttle } from 'lodash'

const boxRef = ref(null)
const state = reactive({
  boxPos: { bottom: 0, height: 0, left: 0, right: 0, top: 0, width: 0, x: 0, y: 0 },
  startPos: { x: 0, y: 0, computedX: 0, computedY: 0 },
  endPos: { x: 0, y: 0, computedX: 0, computedY: 0 },
  pos: [],
  div: null,

  selectedKey: [],
  actionKey: [],
  rule: 'collision',
  ruleOptions: [
    { id: 1, value: 'collision', label: 'collision' },
    { id: 2, value: 'inclusion', label: 'inclusion' }
  ],
  model: 'reverse', // add remove reverse
  modelOptions: [
    { id: 1, value: 'add', label: 'add' },
    { id: 2, value: 'remove', label: 'remove' },
    { id: 3, value: 'reverse', label: 'reverse' }
  ]
})

onMounted(() => {
  boxRef.value.addEventListener('mousedown', mousedown)
})

function mousedown(event) {
  state.div = document.createElement('div')
  state.boxPos = boxRef.value.getBoundingClientRect()
  state.startPos = {
    x: event.x,
    y: event.y,
    computedX: event.x - state.boxPos.x,
    computedY: event.y - state.boxPos.y
  }

  boxRef.value.appendChild(state.div)
  boxRef.value.addEventListener('mousemove', mousemove)
  boxRef.value.addEventListener('mouseup', mouseup, { once: true })
}

function mousemove(event) {
  state.endPos = {
    x: event.x,
    y: event.y,
    computedX: event.x - state.boxPos.x,
    computedY: event.y - state.boxPos.y
  }

  state.pos = [
    Math.min(state.startPos.computedX, state.endPos.computedX),
    Math.min(state.startPos.computedY, state.endPos.computedY),
    Math.max(state.startPos.computedX, state.endPos.computedX),
    Math.max(state.startPos.computedY, state.endPos.computedY),
    Math.abs(state.startPos.computedX - state.endPos.computedX),
    Math.abs(state.startPos.computedY - state.endPos.computedY)
  ]

  state.div.style.cssText = `position: absolute;left: ${state.pos[0]}px; top: ${state.pos[1]}px; width: ${state.pos[4]}px; height: ${state.pos[5]}px;background-color: #1677ff4d;`

  selectBox(boxRef.value.children, state.pos)
}

function mouseup() {
  boxRef.value.removeEventListener('mousemove', mousemove)
  boxRef.value.removeChild(state.div)

  if (state.model == 'add') {
    state.selectedKey = Array.from(new Set([...state.selectedKey, ...state.actionKey]))
  } else if (state.model == 'remove') {
    state.selectedKey = state.selectedKey.filter((item) => !state.actionKey.includes(item))
  } else if (state.model == 'reverse') {
    const mergedArray = Array.from(new Set([...state.selectedKey, ...state.actionKey]))
    const repeatArray = state.selectedKey.filter((item) => state.actionKey.includes(item))
    state.selectedKey = mergedArray.filter((item) => !repeatArray.includes(item))
  }
  Array.from(boxRef.value.children).forEach((item) => {
    item.style.border = ''
  })
}

const selectBox = throttle((children, pos) => {
  const arr = []
  Array.from(children)
    .filter((item) => item.className.includes('basisBox'))
    .forEach((element) => {
      //计算每个checkbox的位置信息
      const left = element.offsetLeft
      const top = element.offsetTop
      const right = element.offsetLeft + element.offsetWidth
      const bottom = element.offsetTop + element.offsetHeight
      const inRange =
        state.rule == 'collision'
          ? rectanglesOverlap(pos[0], pos[1], pos[2], pos[3], left, top, right, bottom)
          : isRectangleContains(pos[0], pos[1], pos[2], pos[3], left, top, right, bottom)

      if (inRange) {
        arr.push(element.dataset.key)
        element.style.borderColor = '#1677ff'
      }
    })

  state.actionKey = Array.from(new Set(arr))
}, 100)

function isRectangleContains(x1, y1, x2, y2, x3, y3, x4, y4) {
  if (
    x3 >= x1 && // rect2的左边界大于等于rect1的左边界
    x4 <= x2 && // rect2的右边界小于等于rect1的右边界
    y3 >= y1 && // rect2的上边界大于等于rect1的上边界
    y4 <= y2 // rect2的下边界小于等于rect1的下边界
  ) {
    return true // rect2完全包含在rect1内部
  } else {
    return false // rect2不完全包含在rect1内部
  }
}

function rectanglesOverlap(x1, y1, x2, y2, x3, y3, x4, y4) {
  // A 矩形的右边在 B 矩形的左边以及 A 矩形的左边在 B 矩形的右边时重叠
  var horizontalOverlap = x1 < x4 && x2 > x3
  // A 矩形的底边在 B 矩形的顶边以及 A 矩形的顶边在 B 矩形的底边时重叠
  var verticalOverlap = y1 < y4 && y2 > y3
  // 检查水平和垂直重叠
  if (horizontalOverlap && verticalOverlap) {
    return true // 矩形重叠
  } else {
    return false // 矩形不重叠
  }
}
</script>

<style scoped>
.boxRef {
  width: 100%;
  height: 400px;
  background: #fff;
  position: relative;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-content: flex-start;
}
.selectedScope {
  position: absolute;
  z-index: 9999;
  top: 0px;
  left: 0px;
  /* transform: translate(456px, 454px); */
  width: 0px;
  height: 0px;
  background-color: #1677ff4d;
}

.basisBox {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  background: #ccc;
  border: 1px solid #ccc;
  margin: 8px;
  user-select: none;
}
.selectedBox {
  background: #1677ff;
  border: 1px solid #1677ff;
}
</style>
