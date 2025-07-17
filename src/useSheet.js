import { ref, computed } from 'vue'


function normalizeSize(str) {
  if (!str) return ""
  const m = str.match(/^(\d{3,4})x(\d{3,4})/)
  return m ? m[0] : str
}


// 从 .env.local 读取
const sheetId = import.meta.env.VITE_SHEET_ID
const apiKey = import.meta.env.VITE_GOOGLE_API_KEY




export function useSheet({ area, range, edge, size, grid, priceLevel, seismic }) {
  // 所有数据
  const tilesData = ref([])
  const gridsData = ref([])
  const loading = ref(false)
  const error = ref(null)




  // 全局尺寸表头
  let sizeList = []




  // ===== 拉数据 =====
  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      // Tiles 数据
      const tilesUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent('Tiles!B3:AF300')}?key=${apiKey}`
      // Grids 主体数据
      const gridsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent('Grids!A3:AD300')}?key=${apiKey}`
      // Grids I1:X1 作为尺寸表头
      const gridsHeaderUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent('Grids!I1:X1')}?key=${apiKey}`




      const [tilesRes, gridsRes, gridsHeaderRes] = await Promise.all([
        fetch(tilesUrl).then(r => r.json()),
        fetch(gridsUrl).then(r => r.json()),
        fetch(gridsHeaderUrl).then(r => r.json())
      ])




      // 解析 Tiles
tilesData.value = (tilesRes.values || []).map(row => ({
  range: row[0] || "",
  code: row[1] || "",
  nrc: row[2] || "",
  cac: row[3] || "",
  edge: row[4] || "",
  size: row[5] || "",
  desc: row[6] || "",
  leadTime: row[7] || "",
  grids: row[8] || "",
  m2pertile: row[9] || "",
  pcsAccrivia: row[10] || "",
  pcsBox: row[11] || "",
  price1: row[12] || "",
  price2: row[13] || "",
  price3: row[14] || "",
  price4: row[15] || "",
  price5: row[16] || "",
  price6: row[17] || "",
  priceIncGST: row[18] || "",
  architectProductive: row[19] || "",
  builderProductive: row[20] || "",
  contractorProductive: row[21] || "",
  retailerProductive: row[22] || "",
  distributorProductive: row[23] || "",
  _ignore1: row[24] || "",
  _ignore2: row[25] || "",
  _ignore3: row[26] || "",
  _ignore4: row[27] || "",
  _ignore5: row[28] || "",
  _ignore6: row[29] || "",
  _ignore7: row[30] || "",
}))

// 打印所有 tiles 的 code、size、m2/unit
console.log(
  tilesData.value.map(t => ({
    code: t.code,
    size: t.size,
    m2pertile: t.m2pertile
  }))
)



      // 解析 Grids
gridsData.value = (gridsRes.values || []).map(row => ({
  seismic: row[0] || "",
  grid: row[1] || "",
  code: row[2] || "",
  name: row[3] || "",
  required: row[4] || "",
  perUnit: row[5] || "",  // 👈 新增
  packOnAccrivia: row[6] || "",
  packActual: row[7] || "",
  qtyPer100Arr: row.slice(8, 24).map(x => x || "0"), // I~X
  priceArr: row.slice(24, 30).map(x => x || ""),     // Y~AD
}))






      // Grids size 表头
      sizeList = (gridsHeaderRes.values && gridsHeaderRes.values[0]) ? gridsHeaderRes.values[0] : []
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }




  fetchAll()




  // ========== 下拉选项 ==========




  const tileRanges = computed(() => {
    return [...new Set(tilesData.value.map(t => t.range).filter(Boolean))]
  })




  const edgeOptions = computed(() => {
    if (!range.value) return []
    return [...new Set(tilesData.value.filter(t => t.range === range.value).map(t => t.edge).filter(Boolean))]
  })




  const sizeOptions = computed(() => {
    // 情况1：range为空，用户单独选Grid System
    if (!range.value && grid.value) {
      const gridRows = gridsData.value.filter(g => g.grid === grid.value)
      const sizeIdxSet = new Set()
      gridRows.forEach(g => {
        (g.qtyPer100Arr || []).forEach((v, idx) => {
          if (v !== '' && v !== undefined && v !== null && v !== '0') {
            sizeIdxSet.add(idx)
          }
        })
      })
      let sizeArr = Array.from(sizeIdxSet)
        .sort((a, b) => a - b)
        .map(idx => sizeList[idx])
        .filter(Boolean)
      return sizeArr
    }
    // 情况2：原有tiles菜单逻辑
    if (!range.value) {
      return [...new Set(tilesData.value.map(t => t.size).filter(Boolean))]
    }
    if (range.value && edge.value) {
      return [...new Set(tilesData.value.filter(
        t => t.range === range.value && t.edge === edge.value
      ).map(t => t.size).filter(Boolean))]
    }
    return [...new Set(tilesData.value.filter(
      t => t.range === range.value
    ).map(t => t.size).filter(Boolean))]
  })




  const gridOptions = computed(() => {
    if (!range.value) {
      return [...new Set(gridsData.value.map(g => g.grid).filter(Boolean))]
    }
    const filtered = tilesData.value.filter(
      t => t.range === range.value && (!edge.value || t.edge === edge.value) && (!size.value || t.size === size.value)
    )
    return [...new Set(filtered.map(t => t.grids).filter(Boolean))]
  })




  const priceLevels = ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Level 6']
  const seismicOptions = ['No', 'Yes']




  // ========== 计算结果 ==========




  const tilesResult = ref([])
  const gridsResult = ref([])
  const totalPrice = ref("0.00")




  // 解析size字符串
  function parseSize(str) {
    if (!str) return [0, 0, 0]
    const arr = str.split('x').map(Number)
    return arr.length >= 2 ? arr : [0, 0, 0]
  }




  function formatCurrency(val) {
    if (!val || isNaN(val)) return ''
    return '$' + Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }




  function calculate() {
    // ---- Tiles ----
    let tileRows = []
    if (range.value && edge.value && size.value) {
      tileRows = tilesData.value.filter(
        t => t.range === range.value && t.edge === edge.value && t.size === size.value
      )
    }
    let tileItem = {}
    if (tileRows.length > 0) {
      const t = tileRows[0]
      const priceIdx = priceLevels.findIndex(lv => lv === priceLevel.value)
      const pcsPerBox = Number(t.pcsBox || 0)
      const pricePerM2 = priceIdx !== -1 ? Number(t["price" + (priceIdx + 1)]) : 0
      const sizeParts = parseSize(size.value)
      const m2PerTile = sizeParts[0] * sizeParts[1] / 1e6
      const areaVal = Number(area.value) || 0
      const totalPieces = m2PerTile ? Math.ceil(areaVal / m2PerTile) : ""
      const pcsAccrivia = Number(t.pcsAccrivia || 0)
      let qtyAccrivia = ""
      if (pcsPerBox && pcsAccrivia && totalPieces) {
        if (pcsPerBox === pcsAccrivia) {
          qtyAccrivia = Math.round(totalPieces / pcsPerBox)
        } else {
          let n = Math.ceil(totalPieces / pcsAccrivia)
          qtyAccrivia = n * pcsAccrivia
        }
      }
      let subtotal = ""
      if (pcsPerBox && qtyAccrivia && pricePerM2 && m2PerTile) {
        subtotal = (Number(pcsPerBox) * Number(qtyAccrivia) * Number(pricePerM2) * m2PerTile).toFixed(2)
      }
      // 查找成本价
      const tileCostRow = tilesData.value.find(row => row.code === t.code)
      const costPerM2 = tileCostRow ? Number(tileCostRow.price6) : 0
      tileItem = {
        code: t.code,
        name: t.desc,
        qtyAccrivia,
        pcsPerBox,
        totalPieces,
        pricePerM2,
        leadTime: t.leadTime,
        subtotal: subtotal ? '$' + subtotal : '',
        setPrice: '',         // 用户输入
        costPerM2,            // 用于 margin
      }
      tilesResult.value = [tileItem]
    } else {
      tilesResult.value = []
    }




    // ---- Grids ----
 // ------- Grids -------
// ------- Grids -------
  const normalizedSize = normalizeSize(size.value)
  const sizeIdx = sizeList.findIndex(sz => sz === normalizedSize)
  if (sizeIdx === -1) {
    gridsResult.value = []
    totalPrice.value = "0.00"
    return
  }


  const gridRows = gridsData.value.filter(g =>
    g.grid === grid.value &&
    ((seismic.value === "Yes" && (g.seismic === "Yes" || !g.seismic)) ||
     (seismic.value !== "Yes" && (!g.seismic || g.seismic === "No")))
  )


  const priceIdx = priceLevels.findIndex(lv => lv === priceLevel.value)
  const areaVal = Number(area.value) || 0


  const gridTable = gridRows.map(g => {
    const qtyPer100 = Number(g.qtyPer100Arr[sizeIdx]) || 0
    const totalPieces = qtyPer100 ? Math.ceil(areaVal * qtyPer100 / 100) : 0
    const packOnAccrivia = Number(g.packOnAccrivia || 0)
    const packActual = Number(g.packActual || 0)
    let qtyAccrivia = ""
    if (packOnAccrivia && packActual && totalPieces) {
      if (packOnAccrivia === packActual) {
        qtyAccrivia = Math.ceil(totalPieces / packOnAccrivia)
      } else {
        let raw = totalPieces / packActual
        let rounded = Math.ceil(raw)
        qtyAccrivia = rounded * packActual
      }
    }
    const perUnit = Number(g.perUnit || 1)
    const price = g.priceArr[priceIdx] ? Number(g.priceArr[priceIdx]) : 0
    let subtotal = ""
    if (price && qtyAccrivia && packOnAccrivia && perUnit) {
      subtotal = (price * Number(qtyAccrivia) * packOnAccrivia * perUnit).toFixed(2)
    }
    const costPerUnit = g.priceArr[5] ? Number(g.priceArr[5]) : 0 // Level 6 成本
    return {
      code: g.code,                
      name: g.name,                
      qtyAccrivia,                  
      pcsPerBox: g.packOnAccrivia || "",
      totalPieces,                  
      price,                        
      qtyPer100,                    
      subtotal: subtotal ? '$' + subtotal : '',
      setPrice: '',                
      costPerUnit,                  
      required: g.required,        
    }
  }).filter(row => Number(row.qtyPer100) > 0)


  gridsResult.value = gridTable
  totalPrice.value = gridTable.reduce((sum, row) => sum + Number((row.subtotal || '0').replace('$','')), 0).toFixed(2)
}




  function refreshForm() {
    area.value = ''
    range.value = ''
    edge.value = ''
    size.value = ''
    grid.value = ''
    priceLevel.value = ''
    seismic.value = ''
    tilesResult.value = []
    gridsResult.value = []
    totalPrice.value = "0.00"
  }




  return {
    loading,
    error,
    tileRanges,
    edgeOptions,
    sizeOptions,
    gridOptions,
    priceLevels,
    seismicOptions,
    tilesResult,
    gridsResult,
    totalPrice,
    calculate,
    refreshForm,
  }
}















