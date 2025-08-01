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

export function useSheet({ area, range, edge, size, grid, seismic }) {
  // 所有数据
  const tilesData = ref([])
  const gridsData = ref([])
  const trimsData = ref([])
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

      tilesData.value = (tilesRes.values || []).map(row => ({
        range: row[0] || "", code: row[1] || "", nrc: row[2] || "", cac: row[3] || "", edge: row[4] || "",
        size: row[5] || "", desc: row[6] || "", leadTime: row[7] || "", grids: row[8] || "", m2pertile: row[9] || "",
        pcsBox: row[11] || "", pcsAccrivia: Number(row[12]) || 0,
        price1: parsePrice(row[13]), price2: parsePrice(row[14]), price3: parsePrice(row[15]),
        price4: parsePrice(row[16]), price5: parsePrice(row[17]), price6: parsePrice(row[18]),
        datasheet: row[24] || "",
      }))

      gridsData.value = (gridsRes.values || []).map(row => ({
        seismic: row[0] || "", grid: row[1] || "", code: row[2] ? row[2].trim() : "", name: row[3] || "",
        required: row[4] || "", perUnit: row[5] || "", packOnAccrivia: row[6] || "", packActual: row[7] || "",
        qtyPer100Arr: row.slice(8, 24).map(x => x || "0"),
        priceArr: row.slice(24, 32).map(x => parsePrice(x || "")),
        isSelected: false
      }))

      trimsData.value = (trimsRes.values || []).map(row => ({
        originalCode: row[0] ? row[0].trim() : "",
        alternativeCodes: row[1] ? row[1].split(',').map(c => c.trim()) : []
      }));
      
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
  const tileRanges = computed(() => [...new Set(tilesData.value.map(t => t.range).filter(Boolean))])
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
          if (v && v !== '0') sizeIdxSet.add(idx)
        })
      })
      return Array.from(sizeIdxSet).sort((a, b) => a - b).map(idx => sizeList[idx]).filter(Boolean)
    }
    if (!range.value) return [...new Set(tilesData.value.map(t => t.size).filter(Boolean))]
    if (range.value && edge.value) return [...new Set(tilesData.value.filter(t => t.range === range.value && t.edge === edge.value).map(t => t.size).filter(Boolean))]
    return [...new Set(tilesData.value.filter(t => t.range === range.value).map(t => t.size).filter(Boolean))]
  })
  const gridOptions = computed(() => {
    if (!range.value) return [...new Set(gridsData.value.map(g => g.grid).filter(Boolean))]
    const filtered = tilesData.value.filter(t => t.range === range.value && (!edge.value || t.edge === edge.value) && (!size.value || t.size === size.value))
    const allGrids = filtered.flatMap(t => t.grids ? t.grids.split(',').map(g => g.trim()) : []);
    return [...new Set(allGrids.filter(Boolean))];
  })
  const seismicOptions = ['No', 'Yes']

  // ========== 计算结果 ==========
  const tilesResult = ref([])
  const gridsResult = ref([])
  const totalPrice = ref("0.00")

  function calculateTileQuantities(tile, totalPiecesInput) {
    const M_pcsBox = Number(tile.pcsBox || 0);
    if (totalPiecesInput <= 0 || M_pcsBox <= 0) return 0;
    const N_pcsAccrivia = Number(tile.pcsAccrivia || 0);
    if (N_pcsAccrivia === 0 || N_pcsAccrivia === M_pcsBox) return Math.ceil(totalPiecesInput / M_pcsBox);
    if (N_pcsAccrivia > 0 && N_pcsAccrivia !== M_pcsBox) return Math.ceil(totalPiecesInput / M_pcsBox) * M_pcsBox;
    return 0;
  }

  function calculateSingleGridItem(g, sizeIdx, priceIdx, areaVal) {
    const qtyPer100 = Number(g.qtyPer100Arr[sizeIdx]) || 0;
    const totalPieces = qtyPer100 ? Math.ceil(areaVal * qtyPer100 / 100) : 0;
    const packOnAccrivia = Number(g.packOnAccrivia || 0);
    const packActual = Number(g.packActual || 0);
    let qtyAccrivia = 0;

    if (packOnAccrivia && packActual && totalPieces) {
      qtyAccrivia = (packOnAccrivia === packActual)
        ? Math.ceil(totalPieces / packOnAccrivia)
        : Math.ceil(totalPieces / packActual) * packActual;
    }

    const parsedActivePrice = priceIdx !== -1 && g.priceArr && g.priceArr[priceIdx] ? g.priceArr[priceIdx] : parsePrice('');
    
    // 安全地获取所有价格用于显示
    const price1 = g.priceArr && g.priceArr[0] ? g.priceArr[0] : parsePrice('');
    const price2 = g.priceArr && g.priceArr[1] ? g.priceArr[1] : parsePrice('');
    const price3 = g.priceArr && g.priceArr[2] ? g.priceArr[2] : parsePrice('');
    const price4 = g.priceArr && g.priceArr[3] ? g.priceArr[3] : parsePrice('');

    const displayPriceGridsOnly = areaVal > 200 ? price3.display : price1.display;
    const displayPriceTilesAndGrids = areaVal > 200 ? price4.display : price2.display;

    const perUnit = Number(g.perUnit || 1);
    const subtotalNum = packOnAccrivia * qtyAccrivia * perUnit * parsedActivePrice.value;

    return {
      code: g.code, name: g.name, qtyAccrivia, packOnAccrivia, pcsPerBox: g.packActual || '',
      totalPieces, price: parsedActivePrice.value, price_display: parsedActivePrice.display,
      price_display_grids_only: displayPriceGridsOnly, price_display_tiles_and_grids: displayPriceTilesAndGrids,
      perUnit, qtyPer100, required: g.required, imageUrl: `/images/grids/${g.code}.png`,
      subtotalNum, subtotal: '$' + subtotalNum.toFixed(2), isSelected: g.isSelected,
    };
  }

  function calculate() {
    const areaVal = Number(area.value) || 0;
    let gridPriceIndex = -1;

    if (areaVal > 0 && areaVal <= 200) gridPriceIndex = 1;
    else if (areaVal > 200) gridPriceIndex = 3;

    const canCalcTiles = area.value && seismic.value && range.value && edge.value && size.value;
    const canCalcGrids = area.value && seismic.value && grid.value && size.value;

    if (canCalcTiles) {
      const tileRows = tilesData.value.filter(t => t.range === range.value && t.edge === edge.value && t.size === size.value);
      if (tileRows.length > 0) {
        const t = tileRows[0];
        const priceKeyTilesOnly = areaVal > 200 ? 'price3' : 'price1';
        const priceKeyTilesAndGrids = areaVal > 200 ? 'price4' : 'price2';
        const priceTilesOnly = t[priceKeyTilesOnly] || parsePrice('');
        const priceTilesAndGrids = t[priceKeyTilesAndGrids] || parsePrice('');
        const activePrice = grid.value ? priceTilesAndGrids : priceTilesOnly;
        const m2PerTile = Number(t.m2pertile) || 0;
        const totalPiecesCalc = m2PerTile ? Math.ceil(areaVal / m2PerTile) : 0;
        
        tilesResult.value = [{
          code: t.code, name: t.desc, nrc: t.nrc, cac: t.cac, pcsPerBox: Number(t.pcsBox || 0),
          pcsAccrivia: t.pcsAccrivia, pricePerM2: activePrice.value, priceTilesOnly: priceTilesOnly,
          priceTilesAndGrids: priceTilesAndGrids, leadTime: t.leadTime, m2pertile: m2PerTile,
          datasheet: t.datasheet, totalPieces: totalPiecesCalc,
          qtyAccrivia: calculateTileQuantities(t, totalPiecesCalc),
        }];
      } else { tilesResult.value = []; }
    } else { tilesResult.value = []; }

    if (canCalcGrids && gridPriceIndex !== -1) {
      const normalizedSize = normalizeSize(size.value);
      const sizeIdx = sizeList.findIndex(sz => sz === normalizedSize);
      if (sizeIdx === -1) {
        gridsResult.value = [];
        return;
      }
      const gridRows = gridsData.value.filter(g => g.grid === grid.value && ((seismic.value === 'Yes' && (g.seismic === 'Yes' || !g.seismic)) || (seismic.value !== 'Yes' && (!g.seismic || g.seismic === 'No'))));
      const gridTable = gridRows.map(g => calculateSingleGridItem(g, sizeIdx, gridPriceIndex, areaVal)).filter(r => Number(r.qtyPer100) > 0);
      gridsResult.value = gridTable;
    } else {
      gridsResult.value = [];
    }
  }

  function updateWallAngleSelection(newSelectedOption) {
    const wallAngleIndex = gridsResult.value.findIndex(g => g.options);
    if (wallAngleIndex === -1) return;
    const newWallAngle = { ...newSelectedOption, options: gridsResult.value[wallAngleIndex].options };
    gridsResult.value.splice(wallAngleIndex, 1, newWallAngle);
  }

  function refreshForm() {
    area.value = ''; range.value = ''; edge.value = ''; size.value = ''; grid.value = ''; seismic.value = '';
    tilesResult.value = []; gridsResult.value = []; totalPrice.value = "0.00";
    gridsData.value.forEach(g => { if (g.required !== 'Y') g.isSelected = false; });
  }

  return {
    loading, error, tileRanges, edgeOptions, sizeOptions, gridOptions,
    seismicOptions, tilesResult, gridsResult, totalPrice,
    calculate, refreshForm, updateWallAngleSelection,
  }
}