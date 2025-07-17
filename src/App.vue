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




    <div class="result-card">
      <!-- Tiles 表格 -->
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
  <td class="subtcol">{{ t.subtotal }}</td>
  <td class="midcol">{{ getTileMargin(t) }}</td>
  <td class="midcol">
    <input v-model="t.setPrice" type="number" placeholder="Enter" class="setprice-input" />
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






<!-- Grids 表格 -->
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


      </tr>
    </thead>
    <tbody>
      <!-- Essential Components -->
      <tr>
        <td colspan="10" style="background:#f5f6fa;font-weight:700;color:#263a4d;">Essential Components</td>
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
  <td class="subtcol">{{ g.subtotal }}</td>
  <td class="midcol">{{ getGridMargin(g) }}</td>
  <td class="midcol">
    <input v-model="g.setPrice" type="number" placeholder="Enter" class="setprice-input" />
  </td>
</tr>




      </template>
      <tr v-if="!gridsResult.filter(item => item.required === 'Y').length">
        <td colspan="10" style="text-align:center; color:#aaa;">No essential components</td>
      </tr>


      <!-- Optional Accessories -->
      <tr>
        <td colspan="10" style="background:#f8f9fa;font-weight:700;color:#888;">Optional Accessories</td>
      </tr>
      <template v-if="gridsResult.length">
      <tr v-for="g in gridsResult.filter(item => item.required !== 'Y')" :key="'opt-'+g.code">
  <td class="codecol">{{ g.code }}</td>
  <td class="namecol">{{ g.name }}</td>
  <td class="qtycol">{{ g.qtyAccrivia }}</td>
  <td class="midcol">{{ g.pcsPerBox }}</td>
  <td class="midcol">{{ g.totalPieces }}</td>
  <td class="midcol">{{ g.price }}</td>
  <td class="qtytimecol">{{ g.qtyPer100 }}</td>
  <td class="subtcol">{{ g.subtotal }}</td>
  <td class="midcol">{{ getGridMargin(g) }}</td>
  <td class="midcol">
    <input v-model="g.setPrice" type="number" placeholder="Enter" class="setprice-input" />
  </td>
</tr>


      </template>
      <tr v-if="!gridsResult.filter(item => item.required !== 'Y').length">
        <td colspan="10" style="text-align:center; color:#aaa;">No optional accessories</td>
      </tr>
      <!-- 总价行 -->
      <tr>
        <td colspan="9" style="text-align:right; font-weight:600; border:none;">Total</td>
        <td style="font-weight:600;">{{ totalPrice }}</td>
      </tr>
    </tbody>
  </table>
</div>


<!-- Specification Table -->
<div class="table-title">Specification Table</div>
<div class="spec-table">
  <div v-if="specText" v-html="specText"></div>
  <div v-else style="color:#aaa;text-align:center;padding:28px 0;">
    No specification to display yet
  </div>
</div>


    </div>
  </div>
</template>


<script setup>
import { ref, watchEffect } from 'vue'
import { useSheet } from './useSheet'


const area = ref('')
const range = ref('')
const edge = ref('')
const size = ref('')
const grid = ref('')
const priceLevel = ref('')
const seismic = ref('')


const {
  tileRanges, edgeOptions, sizeOptions, gridOptions,
  priceLevels, seismicOptions,
  tilesResult, gridsResult, totalPrice,
  calculate, refreshForm
} = useSheet({
  area, range, edge, size, grid, priceLevel, seismic
})
// ===== 👇👇👇 这两段加在这里，watchEffect 之前或之后都行 =====


function getTileMargin(t) {
  const cost = Number(t.costPerM2)
  let base = t.setPrice && !isNaN(Number(t.setPrice))
    ? Number(t.setPrice)
    : Number((t.pricePerM2 || '').toString().replace(/[^0-9.]/g, ''))
  if (!base || !cost) return ''
  return (((base - cost) / base) * 100).toFixed(2) + '%'
}


function getGridMargin(g) {
  const cost = Number(g.costPerUnit)
  let base = g.setPrice && !isNaN(Number(g.setPrice))
    ? Number(g.setPrice)
    : Number(g.price)
  if (!base || !cost) return ''
  return (((base - cost) / base) * 100).toFixed(2) + '%'
}
function formatMoney(val) {
  if (val === undefined || val === null || val === '') return '';
  return '$' + Number(val).toFixed(2);
}
function formatInt(val) {
  if (val === undefined || val === null || val === '') return '';
  return Math.round(Number(val));
}


watchEffect(() => {
  const mainInputsFilled =
    area.value &&
    size.value &&
    grid.value &&
    priceLevel.value &&
    seismic.value




  if (
    mainInputsFilled &&
    (range.value && edge.value || (!range.value && !edge.value))
  ) {
    calculate()
  }
})
import { computed } from 'vue'

const specText = computed(() => {
  if (!range.value || !size.value || !grid.value) return ''
  const tile = tilesResult.value[0] || {}
  // 超链接部分
  const link = tile.datasheet
    ? `<a href="${tile.datasheet}" target="_blank" style="color:#235aa7;text-decoration:underline;">View Data Sheet</a>`
    : 'N/A'
  return [
    `Supplier: Armstrong Ceiling Solutions`,
    `Product: ${range.value} ${edge.value || ''} ${size.value} with ${grid.value} in Global White Color`,
    `Acoustic: NRC: ${tile.nrc || 'N/A'}  CAC: ${tile.cac || 'N/A'}`,
    `Lead Time: ${tile.leadTime || 'Usually In stock'}`,
    `Indicative Budget: $${totalPrice.value || '??'}+ per m² includes grids and tiles`,
    `Data Sheet Link: ${link}`
  ].join('<br>')  // 用 <br> 保留换行
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
/* Set Price输入框 50px */
.setprice-input {
  width:50px !important;
  min-width: 50px !important;
  max-width: 50px !important;
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


.form-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 16px #0001;
  padding: 12px 8px 10px 8px;
  min-width: 170px;
  max-width: 210px;
  width: 100%;
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







