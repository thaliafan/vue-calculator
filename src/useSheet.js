import { ref, computed } from 'vue'

function normalizeSize(str) {
  if (!str) return ""
  const m = str.match(/(\d{3,4}x\d{3,4})/)
  return m ? m[1] : str
}

// 从 .env.local 读取
const sheetId = import.meta.env.VITE_SHEET_ID
const apiKey = import.meta.env.VITE_GOOGLE_API_KEY

// 价格解析函数
function parsePrice(priceStr) {
  let value = 0;
  let display = '$0.00';
  let isManual = false;

  if (typeof priceStr === 'number') {
    value = priceStr;
    display = `$${priceStr.toFixed(2)}`;
  } else if (typeof priceStr === 'string') {
    const matchWithText = priceStr.match(/(\$?\d+\.?\d*)\s*(\(.*\))/);
    if (matchWithText) {
      value = parseFloat(matchWithText[1].replace('$', ''));
      display = `$${value.toFixed(2)} ${matchWithText[2]}`;
      isManual = true;
    } else {
      const num = parseFloat(priceStr.replace('$', ''));
      if (!isNaN(num)) {
        value = num;
        display = `$${num.toFixed(2)}`;
      }
    }
  }

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
  const trimsData = ref([]) // <--- 新增: 存储 Trims 数据
  const loading = ref(false)
  const error = ref(null)

  // 全局尺寸表头
  let sizeList = []

  // ===== 拉数据 =====
  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      const tilesUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent('Tiles!B3:AF300')}?key=${apiKey}`
      const gridsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent('Grids!A3:AF300')}?key=${apiKey}`
      const gridsHeaderUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent('Grids!I1:X1')}?key=${apiKey}`
      const trimsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent('Trims!A1:D300')}?key=${apiKey}`

      const [tilesRes, gridsRes, gridsHeaderRes, trimsRes] = await Promise.all([
        fetch(tilesUrl).then(r => r.json()),
        fetch(gridsUrl).then(r => r.json()),
        fetch(gridsHeaderUrl).then(r => r.json()),
        fetch(trimsUrl).then(r => r.json())
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
        pcsBox: row[11] || "",
        price1: parsePrice(row[13]),
        price2: parsePrice(row[14]),
        price3: parsePrice(row[15]),
        price4: parsePrice(row[16]),
        price5: parsePrice(row[17]),
        price6: parsePrice(row[18]),
        priceArchitect: parsePrice(row[19]),
        priceBuilder: parsePrice(row[20]),
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
        code: row[2] ? row[2].trim() : "",
        name: row[3] || "",
        required: row[4] || "",
        perUnit: row[5] || "",
        packOnAccrivia: row[6] || "",
        packActual: row[7] || "",
        qtyPer100Arr: row.slice(8, 24).map(x => x || "0"),
        priceArr: row.slice(24, 32).map(x => parsePrice(x || "")),
        isSelected: false
      }))

      // 解析 Trims 数据
      trimsData.value = (trimsRes.values || []).map(row => ({
        originalCode: row[0] ? row[0].trim() : "",
        alternativeCodes: row[1] ? row[1].split(',').map(c => c.trim()) : []
      }));
      
      // Grids size 表头
      sizeList = (gridsHeaderRes.values && gridsHeaderRes.values[0]) ? gridsHeaderRes.values[0] : []

    } catch (e) {
      error.value = e.message;
      console.error("Error fetching sheet data:", e);
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

  const priceLevels = ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Level 6', 'Architects', 'Builder'];
  const seismicOptions = ['No', 'Yes']

  // ========== 计算结果 ==========
  const tilesResult = ref([])
  const gridsResult = ref([])
  const totalPrice = ref("0.00")

  function calculateTileQuantities(tile, totalPiecesInput) {
    const M_pcsBox = Number(tile.pcsBox || 0);
    const N_pcsAccrivia = Number(tile.pcsAccrivia || 0);

    if (totalPiecesInput <= 0 || M_pcsBox <= 0) return 0;

    if (N_pcsAccrivia === 0 || N_pcsAccrivia === M_pcsBox) {
      return Math.ceil(totalPiecesInput / M_pcsBox);
    }

    if (N_pcsAccrivia > 0 && N_pcsAccrivia !== M_pcsBox) {
      const Y = Math.ceil(totalPiecesInput / M_pcsBox);
      return Y * M_pcsBox;
    }
    return 0;
  }

  function calculateSingleGridItem(g, sizeIdx, priceIdx, areaVal) {
    const qtyPer100 = Number(g.qtyPer100Arr[sizeIdx]) || 0
    const totalPieces = qtyPer100 ? Math.ceil(areaVal * qtyPer100 / 100) : 0
    const packOnAccrivia = Number(g.packOnAccrivia || 0)
    const packActual = Number(g.packActual || 0)
    let qtyAccrivia = 0

    if (packOnAccrivia && packActual && totalPieces) {
      if (packOnAccrivia === packActual) {
        qtyAccrivia = Math.ceil(totalPieces / packOnAccrivia)
      } else {
        qtyAccrivia = Math.ceil(totalPieces / packActual) * packActual
      }
    }

    const perUnit = Number(g.perUnit || 1)
    const parsedGridPrice = priceIdx !== -1 ? (g.priceArr[priceIdx] || parsePrice('')) : parsePrice('');
    const gridPrice_value = parsedGridPrice.value
    const gridPrice_display = parsedGridPrice.display
    const isManualPrice_grid = parsedGridPrice.isManual
    const sellPrice = gridPrice_value
    const subtotalNum = packOnAccrivia && qtyAccrivia && perUnit
      ? packOnAccrivia * qtyAccrivia * perUnit * sellPrice
      : 0
    const costPerUnit = g.priceArr[5]?.value ?? 0

    return {
      code: g.code,
      name: g.name,
      qtyAccrivia,
      packOnAccrivia,
      pcsPerBox: g.packActual || '',
      totalPieces,
      price: gridPrice_value,
      price_display: gridPrice_display,
      isManualPrice: isManualPrice_grid,
      perUnit,
      qtyPer100,
      setPrice: '',
      setTotalPieces: '',
      costPerUnit,
      required: g.required,
      imageUrl: `/images/grids/${g.code}.png`,
      subtotalNum,
      subtotal: '$' + subtotalNum.toFixed(2),
      isSelected: g.isSelected
    }
  }

  function calculate() {
    const canCalcTiles =
      area.value && priceLevel.value && seismic.value &&
      range.value && edge.value && size.value

    const canCalcGrids =
      area.value && priceLevel.value && seismic.value &&
      grid.value && size.value

    /* -------- Tiles -------- */
    if (canCalcTiles) {
      let tileRows = tilesData.value.filter(
        t => t.range === range.value && t.edge === edge.value && t.size === size.value
      )

      if (tileRows.length) {
        const t = tileRows[0];
        let parsedPricePerM2 = parsePrice('');
        const selectedLevel = priceLevel.value;

        if (selectedLevel.startsWith('Level')) {
          const levelNum = selectedLevel.split(' ')[1];
          parsedPricePerM2 = t['price' + levelNum] || parsePrice('');
        } else if (selectedLevel === 'Architects') {
          parsedPricePerM2 = t.priceArchitect || parsePrice('');
        } else if (selectedLevel === 'Builder') {
          parsedPricePerM2 = t.priceBuilder || parsePrice('');
        }
        
        const pricePerM2_value = parsedPricePerM2.value
        const pricePerM2_display = parsedPricePerM2.display
        const isManualPrice_tile = parsedPricePerM2.isManual
        const m2PerTile = Number(t.m2pertile) || 0
        const areaVal = Number(area.value) || 0
        const totalPiecesCalc = m2PerTile ? Math.ceil(areaVal / m2PerTile) : 0
        const qtyAccriviaCalc = calculateTileQuantities(t, totalPiecesCalc)
        const costPerM2 = t.price6?.value ?? 0

        tilesResult.value = [{
          code: t.code,
          name: t.desc,
          nrc: t.nrc,
          cac: t.cac,
          pcsPerBox: Number(t.pcsBox || 0),
          pcsAccrivia: t.pcsAccrivia,
          pricePerM2: pricePerM2_value,
          pricePerM2_display,
          isManualPrice: isManualPrice_tile,
          leadTime: t.leadTime,
          m2pertile: m2PerTile,
          setPrice: '', 
          setTotalPieces: '',
          costPerM2,
          datasheet: t.datasheet,
          totalPieces: totalPiecesCalc,
          qtyAccrivia: qtyAccriviaCalc,
          originalTotalPieces: totalPiecesCalc,
          originalQtyAccrivia: qtyAccriviaCalc,
        }]
      } else {
        tilesResult.value = []
      }
    } else {
      tilesResult.value = []
    }

    /* -------- Grids -------- */
    if (canCalcGrids) {
      const normalizedSize = normalizeSize(size.value)
      const sizeIdx = sizeList.findIndex(sz => sz === normalizedSize)
      if (sizeIdx === -1) {
        gridsResult.value = []
        totalPrice.value = '0.00'
        return
      }

      const gridRows = gridsData.value.filter(g =>
        g.grid === grid.value &&
        ((seismic.value === 'Yes' && (g.seismic === 'Yes' || !g.seismic)) ||
         (seismic.value !== 'Yes' && (!g.seismic || g.seismic === 'No')))
      )

      const priceIdx = priceLevels.findIndex(lv => lv === priceLevel.value);
      const areaVal = Number(area.value) || 0;

const gridTable = gridRows.map(g => {
    const calculatedItem = calculateSingleGridItem(g, sizeIdx, priceIdx, areaVal);

    if (calculatedItem.name && calculatedItem.name.toLowerCase().includes('wall angle')) {
        console.log('%cFound a Wall Angle:', 'color: green; font-weight: bold;', calculatedItem.name);

        // --- 新增的深度调试日志 ---
        console.log('--- DEEPER DEBUGGING ---');
        console.log('1. The entire Trims array the code is searching in:', trimsData.value);
        console.log(`2. Searching for code: "${calculatedItem.code}" (Type: ${typeof calculatedItem.code})`);

        const trimInfo = trimsData.value.find(t => {
            // 3. 打印出每一次的比较过程
            const isMatch = t.originalCode === calculatedItem.code;
            console.log(`Comparing Grid Code "${calculatedItem.code}" with Trim Code "${t.originalCode}". Match? -->`, isMatch);
            return isMatch;
        });

        console.log('4. Final find result (trimInfo):', trimInfo);
        console.log('--- END DEEPER DEBUGGING ---');
        // --- 深度调试日志结束 ---

        if (trimInfo && trimInfo.alternativeCodes.length > 0) {
            const options = trimInfo.alternativeCodes
                .map(altCode => gridsData.value.find(grid => grid.code === altCode))
                .filter(Boolean)
                .map(gridData => calculateSingleGridItem(gridData, sizeIdx, priceIdx, areaVal));

            console.log('%cSuccessfully attaching options:', 'color: blue;', options);
            calculatedItem.options = options;
        }
    }

    return calculatedItem;
}).filter(r => Number(r.qtyPer100) > 0)

      gridsResult.value = gridTable
      totalPrice.value = gridTable.reduce((s, r) => s + (r.subtotalNum || 0), 0).toFixed(2)
    } else {
      gridsResult.value = []
      totalPrice.value = '0.00'
    }
  }
  
  function updateWallAngleSelection(newSelectedOption) {
    const wallAngleIndex = gridsResult.value.findIndex(g => g.options);
    if (wallAngleIndex === -1) return;

    const oldWallAngle = gridsResult.value[wallAngleIndex];
    const preservedOptions = oldWallAngle.options;
    const preservedSetPrice = oldWallAngle.setPrice;
    const preservedSetTotalPieces = oldWallAngle.setTotalPieces;

    const newWallAngle = { ...newSelectedOption };

    newWallAngle.options = preservedOptions;
    newWallAngle.setPrice = preservedSetPrice;
    newWallAngle.setTotalPieces = preservedSetTotalPieces;

    gridsResult.value.splice(wallAngleIndex, 1, newWallAngle);
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
    gridsData.value.forEach(g => {
      if (g.required !== 'Y') {
        g.isSelected = false;
      }
    });
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
    updateWallAngleSelection,
  }
}