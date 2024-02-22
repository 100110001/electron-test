<template>
  <div>
    <a-space>
      <a-button @click="chooseFile">选择文件</a-button>
      <a-button :disabled="state.filePaths.length == 0" @click="recognizeImage">识别图片</a-button>
      <a-button :disabled="state.easyocrData.length == 0" @click="organizeData">数据整理</a-button>
      <a-button :disabled="state.images.length == 0" @click="previewImage"> 预览图片 </a-button>
      <a-button @click="exportData"> 导出数据 </a-button>
    </a-space>

    <a-image-preview-group
      v-model:visible="state.visible"
      v-model:current="state.current"
      infinite
      :src-list="state.images"
    />

    <a-table
      :columns="state.columns"
      :data="state.dataSource"
      :pagination="false"
      :scroll="{ y: 800 }"
      size="small"
      style="margin-top: 10px"
    >
      <template #editable="{ rowIndex, column }">
        <a-input
          v-if="state.editable"
          v-model="state.dataSource[rowIndex][column.dataIndex]"
          size="small"
        />
        <span v-else>{{ state.dataSource[rowIndex][column.dataIndex] }}</span>
      </template>

      <template #operation="{ record }">
        <span>
          <a @click="edit(record.key)">编辑</a>
          &nbsp;
          <a @click="deleteItem(record.key)">删除</a>
        </span>
      </template>
    </a-table>
  </div>
</template>

<script setup>
import { onMounted, reactive, toRaw } from 'vue'
import axios from 'axios'
import { Metadata } from './testdata'

const state = reactive({
  visible: false,

  current: 0,
  images: [],
  filePaths: [],
  easyocrData: Metadata,

  dataSource: [],
  columns: [
    {
      title: '玩家姓名',
      dataIndex: 'playerName',
      key: 'playerName',
      width: 120,
      slotName: 'editable'
    },
    { title: '等级', dataIndex: 'level', key: 'level', width: 80 },
    {
      title: '帮会',
      dataIndex: 'guild',
      key: 'guild',
      filters: [
        {
          text: 'A',
          value: 'A'
        },
        {
          text: 'B',
          value: 'B'
        }
      ],
      width: 80,
      onFilter: (value, record) => record.guild == value
    },
    {
      title: '击败',
      dataIndex: 'defeat',
      key: 'defeat',
      sorter: (a, b) => convertToNumber(a['defeat']) - convertToNumber(b['defeat']),
      slotName: 'editable'
    },
    {
      title: '助攻',
      dataIndex: 'assist',
      key: 'assist',
      sorter: (a, b) => convertToNumber(a['assist']) - convertToNumber(b['assist']),
      slotName: 'editable'
    },
    {
      title: '资源',
      dataIndex: 'resources',
      key: 'resources',
      sorter: (a, b) => convertToNumber(a['resources']) - convertToNumber(b['resources']),
      slotName: 'editable'
    },
    {
      title: '对玩家伤害',
      dataIndex: 'damageToPlayers',
      key: 'damageToPlayers',
      sorter: (a, b) =>
        convertToNumber(a['damageToPlayers']) - convertToNumber(b['damageToPlayers']),
      slotName: 'editable'
    },
    {
      title: '对建筑伤害',
      dataIndex: 'damageToBuildings',
      key: 'damageToBuildings',
      sorter: (a, b) =>
        convertToNumber(a['damageToBuildings']) - convertToNumber(b['damageToBuildings']),
      slotName: 'editable'
    },
    {
      title: '治疗量',
      dataIndex: 'healingAmount',
      key: 'healingAmount',
      sorter: (a, b) => convertToNumber(a['healingAmount']) - convertToNumber(b['healingAmount']),
      slotName: 'editable'
    },
    {
      title: '承受伤害',
      dataIndex: 'damageTaken',
      key: 'damageTaken',
      sorter: (a, b) => convertToNumber(a['damageTaken']) - convertToNumber(b['damageTaken']),
      slotName: 'editable'
    },
    {
      title: '重伤',
      dataIndex: 'severeInjury',
      key: 'severeInjury',
      sorter: (a, b) => convertToNumber(a['severeInjury']) - convertToNumber(b['severeInjury']),
      slotName: 'editable'
    },
    {
      title: '化羽',
      dataIndex: 'transformsFeathers',
      key: 'transformsFeathers',
      sorter: (a, b) =>
        convertToNumber(a['transformsFeathers']) - convertToNumber(b['transformsFeathers']),
      slotName: 'editable'
    },
    {
      title: '操作',
      dataIndex: 'operation',
      slotName: 'operation',
      width: 120
    }
  ],
  editable: false
})
onMounted(() => {})

const edit = () => (state.editable = !state.editable)

const deleteItem = (key) => {
  state.dataSource = state.dataSource.filter((item) => key !== item.key)
}

const chooseFile = async () => {
  const filePaths = await window.electronAPI.openFile()
  state.filePaths = filePaths
  window.electronAPI.getFileData(filePaths, (value) => {
    state.images = value
  })
}

const previewImage = () => (state.visible = true)
const exportData = async () => {
  await window.electronAPI.saveFile(
    [state.columns.map((item) => item.title)],
    toRaw(state.dataSource)
  )
}

const recognizeImage = () => {
  axios
    .post('/api/data', { data: state.filePaths })
    .then((response) => {
      state.easyocrData = response.data.data
    })
    .catch((error) => {
      console.error('Error fetching data:', error)
    })
}

function convertToNumber(value) {
  if (!value) return 0
  if (value && value.includes('万')) {
    return parseFloat(value) * 10000
  }
  return parseFloat(value)
}

function filterAndKeepLarger(arr, sli) {
  let result = []
  let value = 0

  arr = arr.sort((a, b) => b - a)

  arr = [...new Set(arr)]

  arr.forEach((item) => {
    if (result.length == 0) {
      result.push(item)
      value = item
    } else if (Math.abs(item - value) > sli) {
      result.push(item)
      value = item
    }
  })

  result = result.sort((a, b) => a - b)

  return result
}

const organizeData = () => {
  let result = {}

  state.easyocrData.forEach((easyItem) => {
    let { data, image } = easyItem
    let IndexArr = []
    let IndexBrr = []

    let startIndex = 0
    let endIndex = 0
    let KEY = 0

    let rawData = data
      .sort((a, b) => {
        if (Math.abs(a[1] - b[1]) < 20) {
          return a[0] - b[0]
        }
        return a[1] - b[1]
      })
      .map((item, index) => {
        if (item[4].includes('资源') || !startIndex) {
          startIndex = index
          KEY = 1
        }
        if (item[4].includes('承受') || !startIndex) {
          startIndex = index
          KEY = 2
        }
        if (item[4].includes('建筑') || !startIndex) {
          startIndex = index
          KEY = 3
        }
        if (item[4].includes('化羽') || !startIndex) {
          startIndex = index
          KEY = 4
        }
        if (item[4].includes('分享战绩') || !endIndex) {
          endIndex = index
        }
        return item
      })
      .slice(startIndex + 1, endIndex - 1)
      .filter((item) => {
        if (item[0] / image.width < 0.9) return true
        else return false
      })
      .sort((a, b) => {
        if (Math.abs(a[1] - b[1]) < 20) {
          return a[0] - b[0]
        }
        return a[1] - b[1]
      })
    // console.log(data)
    rawData.forEach((item) => {
      IndexArr.push(item[2])
      IndexBrr.push(item[3])
    })
    // console.log(rawData)

    IndexArr = filterAndKeepLarger(IndexArr, 80)
    IndexBrr = filterAndKeepLarger(IndexArr, 50)

    // console.log(IndexArr, IndexBrr)
    rawData.forEach((item, i) => {
      if (item[4] == '69') {
        let key = rawData[i - 1][4].replace(/[^\u4e00-\u9fa5]/g, '')
        if (!(key in result)) {
          result[key] = {
            playerName: key,
            level: item[4],
            guild: item[0] / 1794 < 0.6 ? 'A' : 'B'
          }
        }

        // const sss = [265, 448, 555, 686, 792, 1071, 1228, 1340, 1469, 1598]
        // const ccc = [319, 390, 464, 531, 594, 665, 726, 793, 855]
        // console.log(KEY)
        if (KEY === 1) {
          result[key]['defeat'] = rawData[i + 1] ? rawData[i + 1][4] : '0'
          result[key]['assist'] = rawData[i + 2] ? rawData[i + 2][4] : '0'
          result[key]['resources'] = rawData[i + 3] ? rawData[i + 3][4] : '0'
        }

        if (KEY === 2) {
          result[key]['healingAmount'] = rawData[i + 1] ? rawData[i + 1][4] : '0'
          result[key]['damageTaken'] = rawData[i + 2] ? rawData[i + 2][4] : '0'
        }

        if (KEY === 3) {
          result[key]['damageToPlayers'] = rawData[i + 1] ? rawData[i + 1][4] : '0'
          result[key]['damageToBuildings'] = rawData[i + 2] ? rawData[i + 2][4] : '0'
        }

        if (KEY === 4) {
          result[key]['severeInjury'] = rawData[i + 1] ? rawData[i + 1][4] : '0'
          result[key]['transformsFeathers'] = rawData[i + 2] ? rawData[i + 2][4] : '0'
        }
      }
    })
    // console.log(result)
  })

  let maKey = 1
  const arrayFromNestedObject = Object.entries(result).map(([key, value]) => {
    return { key: maKey++, ...value }
  })
  state.dataSource = arrayFromNestedObject

  console.log(state.dataSource)
}
</script>

<style scoped lang="less"></style>
