import { ref, computed } from 'vue'

function normalizeSize(str) {
  if (!str) return ""
  const m = str.match(/(\d{3,4}x\d{3,4})/)
  return m ? m[1] : str
}

// 从 .env.local 读取
const sheetId = import.meta.env.VITE_SHEET_ID
const apiKey = import.meta.env.VITE_GOOGLE_API_KEY

// 新增：价格解析函数，现在确保 display 属性总是有 '$' 且格式正确
function parsePrice(priceStr) {
  let value = 0;
  let display = '$0.00';
  let isManual = false;

  // 如果是数字，直接格式化
  if (typeof priceStr === 'number') {
    value = priceStr;
    display = `$${priceStr.toFixed(2)}`;
  }
  // 如果是字符串，尝试匹配包含文本的格式
  else if (typeof priceStr === 'string') {
    // 匹配 "$数字 (任意文本)" 或 "数字 (任意文本)"
    const matchWithText = priceStr.match(/(\$?\d+\.?\d*)\s*(\(.*\))/); // 捕获括号内的文本
    if (matchWithText) {
      value = parseFloat(matchWithText[1].replace('$', ''));
      display = `$${value.toFixed(2)} ${matchWithText[2]}`; // 加上 $ 和原始的括号内文本
      isManual = true;
    }
    // 尝试匹配纯数字字符串（可能带$）
    else {
      const num = parseFloat(priceStr.replace('$', ''));
      if (!isNaN(num)) {
        value = num;
        display = `$${num.toFixed(2)}`; // 确保纯数字也加上 $
      }
    }
  }

  // 确保 value 是有效数字
  if (isNaN(value)) {
    value = 0;
    display = '$0.00';
  }

  return { value, display, isManual };
}


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
      pcsAccrivia: Number(row[12]) || 0,
        pcsBox: row[11] || "", // Actual pieces per box
        // 使用 parsePrice 函数处理所有价格
        price1: parsePrice(row[13]),
        price2: parsePrice(row[14]),
        price3: parsePrice(row[15]),
        price4: parsePrice(row[16]),
        price5: parsePrice(row[17]),
        price6: parsePrice(row[18]),
        priceIncGST: parsePrice(row[18]), // 假设这里也需要解析
        architectProductive: row[19] || "",
        builderProductive: row[20] || "",
        contractorProductive: row[21] || "",
        retailerProductive: row[22] || "",
        distributorProductive: row[23] || "",
        datasheet: row[24] || "",
        _ignore2: row[25] || "",
        _ignore3: row[26] || "",
        _ignore4: row[27] || "",
        _ignore5: row[28] || "",
        _ignore6: row[29] || "",
        _ignore7: row[30] || "",
      }))

      // 解析 Grids
      gridsData.value = (gridsRes.values || []).map(row => ({
        seismic: row[0] || "",
        grid: row[1] || "",
        code: row[2] || "",
        name: row[3] || "",
        required: row[4] || "",
        perUnit: row[5] || "",
        packOnAccrivia: row[6] || "",
        packActual: row[7] || "",
        qtyPer100Arr: row.slice(8, 24).map(x => x || "0"), // I~X
        // 使用 parsePrice 函数处理所有价格
        priceArr: row.slice(24, 30).map(x => parsePrice(x || "")), // Y~AD
        isSelected: false // 初始化 isSelected 状态
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

  function calculateTileQuantities(tile, totalPiecesInput) {
    const pcsPerBox = Number(tile.pcsBox || 0);
    const pcsAccriviaDefined = Number(tile.pcsAccrivia || 0); // This is from the sheet.

    let calculatedQtyAccrivia = 0;
    // Use pcsAccriviaDefined for Accrivia calculation if it's different from pcsPerBox.
    // If pcsAccrivia is not explicitly provided or is 0, fall back to pcsPerBox.
    const accriviaConversionUnit = pcsAccriviaDefined > 0 ? pcsAccriviaDefined : pcsPerBox;

    if (accriviaConversionUnit > 0 && totalPiecesInput > 0) {
      calculatedQtyAccrivia = Math.ceil(totalPiecesInput / accriviaConversionUnit);
    }
    return calculatedQtyAccrivia;
  }

  function calculate() {
    // ---- Tiles ----
    let tileRows = []
    if (range.value && edge.value && size.value) {
      tileRows = tilesData.value.filter(
        t => t.range === range.value && t.edge === edge.value && t.size === size.value
      )
    }

    if (tileRows.length > 0) {
      const t = tileRows[0]
      // console.log('picked tile:', {
      //   range: t.range,
      //   size: t.size,
      //   nrc: t.nrc,
      //   cac: t.cac,
      //   datasheet: t.datasheet
      // })

      const priceIdx = priceLevels.findIndex(lv => lv === priceLevel.value)
      const pcsPerBox = Number(t.pcsBox || 0)
      
      // 使用解析后的价格的 value 和 display, isManual
      const parsedPricePerM2 = priceIdx !== -1 ? t["price" + (priceIdx + 1)] : parsePrice(""); // 获取解析后的对象
      const pricePerM2_value = parsedPricePerM2.value;
      const pricePerM2_display = parsedPricePerM2.display;
      const isManualPrice_tile = parsedPricePerM2.isManual;


      const m2PerTile = Number(t.m2pertile) || 0
      const areaVal = Number(area.value) || 0
      const calculatedTotalPieces = m2PerTile ? Math.ceil(areaVal / m2PerTile) : 0

      const calculatedQtyAccrivia = calculateTileQuantities(t, calculatedTotalPieces);

      // 查找成本价 (price6 应该也是一个解析后的对象了)
      const tileCostRow = tilesData.value.find(row => row.code === t.code)
      const costPerM2 = tileCostRow ? tileCostRow.price6.value : 0 // 使用 .value

      // Store both calculated and original values
      const tileItem = {
        code: t.code,
        name: t.desc,
        nrc: t.nrc,
        cac: t.cac,
        pcsPerBox,
        pcsAccrivia: t.pcsAccrivia,
        pricePerM2: pricePerM2_value, // 用于计算的数字价格
        pricePerM2_display: pricePerM2_display, // 用于显示的字符串价格
        isManualPrice: isManualPrice_tile, // 标志位
        leadTime: t.leadTime,
        m2pertile: m2PerTile,
        setPrice: 0, // User input will override this if set. Keep it 0 or null for initial.
        costPerM2, // 用于 margin
        datasheet: t.datasheet,
        // Calculated values (can be overridden by user)
        totalPieces: calculatedTotalPieces,
        qtyAccrivia: calculatedQtyAccrivia,
        // Store original calculated values for reset
        originalTotalPieces: calculatedTotalPieces,
        originalQtyAccrivia: calculatedQtyAccrivia,
      }
      tilesResult.value = [tileItem]
    } else {
      tilesResult.value = []
    }

    // ---- Grids ----
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
      let qtyAccrivia = 0
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
      
      // 使用解析后的价格的 value 和 display, isManual
      const parsedGridPrice = g.priceArr[priceIdx] || parsePrice(""); // 获取解析后的对象
      const gridPrice_value = parsedGridPrice.value;
      const gridPrice_display = parsedGridPrice.display;
      const isManualPrice_grid = parsedGridPrice.isManual;


      // Use setPrice优先，否则用 price_value
      const sellPrice = g.setPrice > 0 ? Number(g.setPrice) : gridPrice_value; // 注意这里使用 gridPrice_value
      const subtotalNum = (packOnAccrivia && qtyAccrivia && perUnit)
        ? packOnAccrivia * qtyAccrivia * perUnit * sellPrice
        : 0
      const subtotal = '$' + subtotalNum.toFixed(2)
      console.log('HBP4501 subtotalNum:', packOnAccrivia * qtyAccrivia * perUnit * sellPrice)

   // log 检查
  if (
    isNaN(Number(qtyAccrivia)) ||
    isNaN(Number(packOnAccrivia)) ||
    isNaN(Number(perUnit)) ||
    isNaN(Number(sellPrice))
  ) {
    console.log(
      '[NaN debug]',
      g.code,
      'qtyAccrivia:', qtyAccrivia,
      'packOnAccrivia:', packOnAccrivia,
      'perUnit:', perUnit,
      'sellPrice:', sellPrice
    );
  }

      // Level 6 成本也需要使用解析后的价格
      const costPerUnit = (g.priceArr[5] && g.priceArr[5].value) ? g.priceArr[5].value : 0; // 使用 .value

      return {
        code: g.code,
        name: g.name,
        qtyAccrivia,
        packOnAccrivia, // 一定要有这一行！
        pcsPerBox: g.packActual || "",
        totalPieces,
        price: gridPrice_value, // 用于计算的数字价格
        price_display: gridPrice_display, // 用于显示的字符串价格
        isManualPrice: isManualPrice_grid, // 标志位
        perUnit,
        qtyPer100,
        setPrice: 0, // Initialize setPrice as 0 for new calculations
        costPerUnit,
        required: g.required,
        imageUrl: `/images/grids/${g.code}.png`,
        subtotalNum,
        subtotal,
        isSelected: g.isSelected // Preserve isSelected state
      }
    }).filter(row => Number(row.qtyPer100) > 0)

    gridsResult.value = gridTable
    // 总价累加所有行的 subtotalNum
    totalPrice.value = gridTable
      .reduce((sum, row) => sum + (row.subtotalNum || 0), 0)
      .toFixed(2)
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
    // 在刷新时也重置所有可选grids的选中状态
    gridsData.value.forEach(g => {
      if (g.required !== 'Y') {
        g.isSelected = false;
      }
    });
  }

  // --- Tile Edit/Reset functionality ---
  const showEditPopup = ref(false);
  const currentTileBeingEdited = ref(null);
  const editedTotalPieces = ref(null);
  const popupX = ref(0);
  const popupY = ref(0);

  function openEditPopup(event, tile) {
    currentTileBeingEdited.value = tile;
    editedTotalPieces.value = tile.totalPieces;
    showEditPopup.value = true;

    // Position the popup relative to the clicked cell
    const cellRect = event.target.getBoundingClientRect();
    popupX.value = event.clientX; // Use mouse X for horizontal positioning
    popupY.value = cellRect.top + window.scrollY; // Position above the cell
  }

  function closeEditPopup() {
    showEditPopup.value = false;
    currentTileBeingEdited.value = null;
    editedTotalPieces.value = null;
  }

  function confirmEditTotalPieces() {
    if (currentTileBeingEdited.value && editedTotalPieces.value !== null && editedTotalPieces.value >= 0) {
      const tile = currentTileBeingEdited.value;

      // Update totalPieces
      tile.totalPieces = editedTotalPieces.value;

      // Recalculate qtyAccrivia based on the new totalPieces
      tile.qtyAccrivia = calculateTileQuantities(tile, tile.totalPieces);
    }
    closeEditPopup();
  }

  function resetTileTotalPieces() {
    if (currentTileBeingEdited.value) {
      const tile = currentTileBeingEdited.value;
      tile.totalPieces = tile.originalTotalPieces;
      tile.qtyAccrivia = tile.originalQtyAccrivia;
    }
    closeEditPopup();
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
    // For tile editing
    showEditPopup,
    currentTileBeingEdited,
    editedTotalPieces,
    openEditPopup,
    closeEditPopup,
    confirmEditTotalPieces,
    resetTileTotalPieces,
    popupX,
    popupY,
  }
}