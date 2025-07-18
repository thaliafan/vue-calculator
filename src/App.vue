<template>
  <div class="page">
    <div class="form-card">
      <h1>Ceiling Calculator</h1>
      <form @submit.prevent="calculate">
        <label>Area (m²):</label>
        <input type="number" min="0" v-model.number="area" class="area-input" />

        <label>Tile Range:</label>
        <select v-model="range">
          <option value="">Select range</option>
          <option v-for="r in tileRanges" :key="r" :value="r">{{ r }}</option>
        </select>

        <label>Tile Edge:</label>
        <select v-model="edge" :disabled="!range">
          <option value="">Select edge</option>
          <option v-for="e in edgeOptions" :key="e" :value="e">{{ e }}</option>
        </select>

        <label>Tile Size:</label>
        <select v-model="size" :disabled="!range && !grid">
          <option value="">Select size</option>
          <option v-for="s in sizeOptions" :key="s" :value="s">{{ s }}</option>
        </select>

        <label>Grid System:</label>
        <select v-model="grid">
          <option value="">Select grid</option>
          <option v-for="g in gridOptions" :key="g" :value="g">{{ g }}</option>
        </select>

        <label>Price Level:</label>
        <select v-model="priceLevel">
          <option value="">Select level</option>
          <option v-for="level in priceLevels" :key="level" :value="level">{{ level }}</option>
        </select>

        <label>Seismic Required:</label>
        <select v-model="seismic">
          <option value="">Select option</option>
          <option v-for="opt in seismicOptions" :key="opt" :value="opt">{{ opt }}</option>
        </select>

        <button type="button" class="refresh-btn" @click="refreshForm">Refresh</button>
      </form>
    </div>

    <div class="main-content-col">
      <div class="result-card">
        <div class="table-title">Tiles</div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th class="codecol">Code</th>
                <th class="namecol">Name</th>
                <th class="qtycol">QTY Enter to Accrivia</th>
                <th class="midcol">pcs/box</th>
                <th class="midcol">Total Pieces</th>
                <th class="midcol">Price/m²</th>
                <th class="qtytimecol">Lead Time</th>
                <th class="subtcol">Subtotal</th>
                <th class="midcol">Margin%</th>
                <th class="midcol">Set Price</th>
              </tr>
            </thead>
            <tbody>
              <template v-if="tilesResult.length">
                <tr v-for="t in tilesResult" :key="t.code">
                  <td class="codecol">{{ t.code }}</td>
                  <td class="namecol">{{ t.name }}</td>
                  <td class="qtycol">{{ t.qtyAccrivia }}</td>
                  <td class="midcol">{{ t.pcsPerBox }}</td>
                  <td class="midcol">{{ t.totalPieces }}</td>
                  <td class="midcol">{{ formatMoney(t.pricePerM2) }}</td>
                  <td class="qtytimecol">{{ t.leadTime }}</td>
                  <td class="subtcol">
                    {{
                      formatMoney(
                        t.pcsPerBox *
                          t.qtyAccrivia *
                          (t.setPrice > 0 ? t.setPrice : t.pricePerM2) *
                          t.m2pertile
                      )
                    }}
                  </td>
                  <td class="midcol">
                    {{
                      (
                        ((t.setPrice > 0 ? t.setPrice : t.pricePerM2) -
                          t.costPerM2) /
                        (t.setPrice > 0 ? t.setPrice : t.pricePerM2) *
                        100
                      ).toFixed(2) + '%'
                    }}
                  </td>
                  <td class="midcol">
                    <div class="price-input-wrapper">
                      <span class="dollar-prefix">$</span>
                      <input
                        v-model.number="t.setPrice"
                        type="number"
                        placeholder="Enter"
                        class="setprice-input"
                      />
                    </div>
                  </td>
                </tr>
              </template>
              <tr v-else>
                <td class="wide" colspan="10" style="text-align:center; color:#aaa;">
                  No data to display for Tiles yet
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="table-title">Grids</div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th class="codecol">Code</th>
                <th class="namecol">Name</th>
                <th class="qtycol">QTY Enter to Accrivia</th>
                <th class="midcol">pcs/box</th>
                <th class="midcol">Total Pieces</th>
                <th class="midcol">Price/unit</th>
                <th class="qtytimecol">QTY/100m²</th>
                <th class="subtcol">Subtotal</th>
                <th class="midcol">Margin%</th>
                <th class="midcol">Set Price</th>
                <th class="imgcol">Image</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colspan="11" class="section-header">Essential Components</td>
              </tr>
              <template v-if="gridsResult.length">
                <tr v-for="g in gridsResult.filter(item => item.required === 'Y')" :key="'ess-'+g.code">
                  <td class="codecol">{{ g.code }}</td>
                  <td class="namecol">{{ g.name }}</td>
                  <td class="qtycol">{{ g.qtyAccrivia }}</td>
                  <td class="midcol">{{ g.pcsPerBox }}</td>
                  <td class="midcol">{{ g.totalPieces }}</td>
                  <td class="midcol">{{ formatMoney(g.price) }}</td>
                  <td class="qtytimecol">{{ formatInt(g.qtyPer100) }}</td>
                  <td class="subtcol">
                    {{
                      formatMoney(
                        (g.setPrice > 0 ? g.setPrice : g.price) *
                          g.qtyAccrivia *
                          g.pcsPerBox *
                          g.perUnit
                      )
                    }}
                  </td>
                  <td class="midcol">{{ getGridMargin(g) }}</td>
                  <td class="midcol">
                    <div class="price-input-wrapper">
                      <span class="dollar-prefix">$</span>
                      <input
                        v-model.number="g.setPrice"
                        type="number"
                        placeholder="Enter"
                        class="setprice-input"
                      />
                    </div>
                  </td>
                  <td class="imgcol">
                    <img :src="g.imageUrl" alt="" class="grid-thumb" />
                  </td>
                </tr>
              </template>
              <tr v-if="!gridsResult.filter(item => item.required === 'Y').length">
                <td colspan="11" class="no-data">No essential components</td>
              </tr>

              <tr>
                <td colspan="11" class="section-header">Optional Accessories</td>
              </tr>
              <template v-if="gridsResult.length">
                <tr
                  v-for="g in gridsResult.filter(item => item.required !== 'Y')"
                  :key="'opt-'+g.code"
                >
                  <td class="codecol">{{ g.code }}</td>
                  <td class="namecol">{{ g.name }}</td>
                  <td class="qtycol">{{ g.qtyAccrivia }}</td>
                  <td class="midcol">{{ g.pcsPerBox }}</td>
                  <td class="midcol">{{ g.totalPieces }}</td>
                  <td class="midcol">{{ formatMoney(g.price) }}</td>
                  <td class="qtytimecol">{{ g.qtyPer100 }}</td>
                  <td class="subtcol">{{ formatMoney(g.subtotalNum) }}</td>
                  <td class="midcol">{{ getGridMargin(g) }}</td>
                  <td class="midcol">
                    <div class="price-input-wrapper">
                      <span class="dollar-prefix">$</span>
                      <input
                        v-model.number="g.setPrice"
                        type="number"
                        placeholder="Enter"
                        class="setprice-input"
                      />
                    </div>
                  </td>
                  <td class="imgcol">
                    <img :src="g.imageUrl" alt="" class="grid-thumb" />
                  </td>
                </tr>
              </template>
              <tr v-if="!gridsResult.filter(item => item.required !== 'Y').length">
                <td colspan="11" class="no-data">No optional accessories</td>
              </tr>
            </tbody>
          </table>
        </div>
   <div class="summary-block" style="font-size: 16px;
 line-height: 1.2; margin-top:16px; text-align:right; font-weight:700;">
          <div>
            Tiles Subtotal:
            {{ formatMoney(tileSubtotal) }}
            ({{ '$' + tileRate }})
          </div>
          <div>
            Essential Grids Components Subtotal:
            {{ formatMoney(essentialGridsSubtotal) }}
            ({{ '$' + essentialRate }})
          </div>
          <div>
            Total (Excl. GST):
            {{ formatMoney(totalExGst) }}
            ({{ '$' + totalRate }})
          </div>
        </div>
      </div>

      <div class="result-card">
        <div class="table-title">Specification Table</div>
        <div class="spec-table">
          <div v-if="specText" v-html="specText"></div>
          <div v-else style="color:#aaa; text-align:center; padding:28px 0;">
            No specification to display yet
          </div>
        </div>
      </div>
    </div>
    </div>
</template>



<script setup>
import { ref, watchEffect, computed } from 'vue'
import { useSheet } from './useSheet'

// Form inputs
const area       = ref('')
const range      = ref('')
const edge       = ref('')
const size       = ref('')
const grid       = ref('')
const priceLevel = ref('')
const seismic    = ref('')

// Sheet data hooks
const {
  tileRanges, edgeOptions, sizeOptions, gridOptions,
  priceLevels, seismicOptions,
  tilesResult, gridsResult,
  calculate, refreshForm
} = useSheet({ area, range, edge, size, grid, priceLevel, seismic })

// Computed summaries
const tileSubtotal = computed(() =>
  tilesResult.value.reduce((sum, t) => {
    const unit = t.setPrice > 0 ? t.setPrice : t.pricePerM2
    return sum + t.pcsPerBox * t.qtyAccrivia * unit * t.m2pertile
  }, 0)
)
const tileRate = computed(() => {
  const m2 = Number(area.value) || 1
  return (tileSubtotal.value / m2).toFixed(2)
})

const essentialGridsSubtotal = computed(() =>
  gridsResult.value
    .filter(g => g.required === 'Y')
    .reduce((sum, g) => {
      const unit = g.setPrice > 0 ? g.setPrice : g.price
      return sum + unit * g.qtyAccrivia * g.pcsPerBox * g.perUnit
    }, 0)
)
const essentialRate = computed(() => {
  const m2 = Number(area.value) || 1
  return (essentialGridsSubtotal.value / m2).toFixed(2)
})

const totalExGst = computed(() => tileSubtotal.value + essentialGridsSubtotal.value)
const totalRate = computed(() => {
  const m2 = Number(area.value) || 1
  return (totalExGst.value / m2).toFixed(2)
})

// Utility functions
function getTileMargin(t) {
  const cost = Number(t.costPerM2)
  const base = t.setPrice > 0 ? t.setPrice : t.pricePerM2
  if (!base || !cost) return ''
  return (((base - cost) / base) * 100).toFixed(2) + '%'
}
function getGridMargin(g) {
  const cost = Number(g.costPerUnit)
  const base = g.setPrice > 0 ? g.setPrice : g.price
  if (!base || !cost) return ''
  return (((base - cost) / base) * 100).toFixed(2) + '%'
}
function formatMoney(val) {
  if (val === undefined || val === null || val === '') return ''
  return '$' + Number(val).toFixed(2)
}
function formatInt(val) {
  if (val === undefined || val === null || val === '') return ''
  return Math.round(Number(val))
}

// Auto-calculate on input change
watchEffect(() => {
  const ready = area.value && size.value && grid.value && priceLevel.value && seismic.value
  if (ready && (range.value && edge.value || (!range.value && !edge.value))) {
    calculate()
  }
})

// Specification text
const specText = computed(() => {
  if (!range.value || !size.value || !grid.value) return ''
  const tile = tilesResult.value[0] || {}
  const link = tile.datasheet
    ? `<a href="${tile.datasheet}" target="_blank">View Data Sheet</a>`
    : 'N/A'
return [
  `Supplier: Armstrong Ceiling Solutions`,
  `Product: ${range.value} ${edge.value || ''} ${size.value} with ${grid.value}`,
  // NRC/CAC 从 tilesData 拉的 row[2]/row[3]
  `Acoustic: NRC: ${tile.nrc || 'N/A'}  CAC: ${tile.cac || 'N/A'}`,
  `Lead Time: ${tile.leadTime || 'Usually In stock'}`,
  // Indicative budget 用我们算好的 totalRate（就是总价 ÷ m²）
  `Indicative Budget: $${totalRate.value} per m²`,
  // datasheet 变成真正的超链接
  `Data Sheet Link: ${
    tile.datasheet
      ? `<a href="${tile.datasheet}" target="_blank">${tile.datasheet}</a>`
      : 'N/A'
  }`
].join('<br>')

})
</script>


<style scoped>
/* Code 列 */

.result-card th.codecol, .result-card td.codecol {
  width: 120px;
  min-width: 120px;
  max-width: 120px;
  text-align: left;
}
/* Name 列 */
.result-card th.namecol, .result-card td.namecol {
  width: 180px;
  min-width: 180px;
  max-width: 180px;
  text-align: left;
}
/* QTY Enter to Accrivia 列 */
.result-card th.qtycol, .result-card td.qtycol {
  width: 70px;
  min-width: 70px;
  max-width: 70px;
  text-align: left;
  }
.section-header {
  background: #f5f6fa;      /* 和 Essential Components 一致 */
  font-weight: 700;         /* 粗体 */
  color: #263a4d;           /* 深色文字 */
  text-align: left;         /* 左对齐 */
}

/* 可选：统一 “No …” 文本的灰色 */
.no-data {
  text-align: center;
  color: #aaa;
}

/* Subtotal 列 */
.result-card th.subtcol, .result-card td.subtcol {
  width: 80px;
  min-width: 80px;
  max-width: 80px;
  text-align: left;
}
.result-card th.qtytimecol, .result-card td.qtytimecol {
  width: 65px;
  min-width: 65px;
  max-width: 65px;
  text-align: left;
}
.result-card th.pricecol, .result-card td.pricecol {
  width: 65px;
  min-width: 65px;
  max-width: 65px;
  text-align: Center;
}
.midcol {
  width: 65px !important;
  min-width: 65px !important;
  max-width: 65px !important;
  text-align: center;
}

.price-input-wrapper {
  display: inline-flex;
  align-items: center;
  /* 如果你想限制宽度，可加 width，比如 width: 60px; */
}

.dollar-prefix {
  margin-right: 4px;
  font-weight: 600;
}

.setprice-input {
  /* 去掉原生上下箭头 */
  -moz-appearance: textfield;
}
.setprice-input::-webkit-outer-spin-button,
.setprice-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* （可选）根据需要微调 input 宽度 */
.setprice-input {
  width: 50px;
}


/* Set Price输入框 50px */
.setprice-input {
  width:40px !important;
  min-width: 40px !important;
  max-width: 40px !important;
  text-align: left;
}
.area-input {
  width: 100%;
  max-width: 180px !important;
  min-width: 0;
  box-sizing: border-box;
}
.form-card input,
.form-card select {
  width: 100%;
  max-width: 180px;
  min-width: 0;
  box-sizing: border-box;
}


.page {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 18px 0;
  gap: 14px;
  max-width: 1600px;
  margin-left: 8px;
  font-size: 14px;
}
.main-content-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 750px;
  max-width: 1100px;
}

.form-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 16px #0001;
  padding: 12px 8px 10px 8px;
  min-width: 170px;
  max-width: 210px;
  width: 100%;
}

/* 图片列宽度 & 居中 */
.imgcol {
  width: 60px;
  text-align: center;
  vertical-align: middle;
}

/* 缩略图 */
.grid-thumb {
  display: inline-block;
  width: 40px;
  height: auto;
  object-fit: contain;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

form label {
  display: block;
  margin-bottom: 16px;
  font-weight: 500;
  font-size: 1em;
}
input,
select {
  width: 100%;
  padding: 5px 8px;
  margin-top: 3px;
  margin-bottom: 8px;
  font-size: 0.93em;
  border-radius: 7px;
  border: 2px solid #476186;
  background: #fff;
  box-shadow: 0 1px 4px #47618622;
  transition: border-color 0.18s;
  appearance: none;
}
input[type="number"] {
  min-width: 0;
  max-width: 100%;
}
select:focus,
input:focus {
  border-color: #1a4c8b;
  outline: none;
  box-shadow: 0 2px 8px #1a4c8b22;
}
button {
  width: 100%;
  margin-top: 10px;
  padding: 8px;
  background: #263a4d;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 0.95em;
  cursor: pointer;
}
.refresh-btn {
  margin-top: 7px;
  background: #eaeaea;
  color: #1d1d1d;
}
button:disabled { opacity: 0.7; }
h1 {
  margin-bottom: 10px;
  font-size: 1.7em;
  font-weight: bold;
  color: #263a4d;
  line-height: 1.06;
}


/* ===================== 表格区 ===================== */
.result-card {
  background: transparent;
  border-radius: 0;
  box-shadow: none;
  flex: 1;
  min-width: 750px;
  max-width: 1100px;
  font-size: 0.92em;
}


.result-card .table-wrap {
  margin-bottom: 8px; /* 两个表格之间的间隔更小 */
}
.result-card table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 4px;
  table-layout: fixed;
  font-size: 0.92em;
}
.result-card th,
.result-card td {
  border: 1px solid #eee;
  padding: 4px 6px;
  font-size: 1em;
  text-align: left;
  white-space: normal;
  overflow: hidden;
  text-overflow: ellipsis;
}




/* 表格标题样式 */
.table-title {
  text-align: center;
  font-weight: bold;
  color: #263a4d;
  font-size: 1.06em;
  margin-bottom: 7px;
  margin-top: 15px;
  letter-spacing: 1px;
}
.result-card .table-title:first-child {
  margin-top: 0;
}
.spec-table {
  min-height: 90px;
  padding: 18px 24px;
  background: #fafbfc;
  border-radius: 15px;
  box-shadow: 0 2px 8px #e0e9f5;
  font-size: 1em;
  margin-bottom: 16px;
  margin-top: 8px;
  white-space: pre-line;
  color: #263a4d;
  letter-spacing: 0.2px;
  text-align: left;
}

</style>







