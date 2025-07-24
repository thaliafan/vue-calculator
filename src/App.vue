<template>
  <v-app>
    <v-main>
      <v-container fluid class="pa-4 app-layout"> <v-row>
  <v-col cols="12" md="3" lg="3" class="d-flex flex-column">
          <v-card class="pa-6 rounded-lg flex-grow-1 left-panel" color="#334155" theme="dark">
            <v-card-title class="text-h5 text-white pb-4">Ceiling Calculator</v-card-title>
        
            <div>
              <v-text-field label="Area (m²)" variant="outlined" density="compact" class="mb-4" v-model.number="area" type="number" min="0" hide-details="auto"></v-text-field>
              <v-select label="Tile Range" variant="outlined" density="compact" class="mb-4" :items="tileRanges" v-model="range" hide-details="auto">
                <template v-slot:selection="{ item }">{{ item.title || item.raw }}</template>
                <template v-slot:item="{ props, item }"><v-list-item v-bind="props" :title="item.title || item.raw"></v-list-item></template>
              </v-select>
              <v-select label="Tile Edge" variant="outlined" density="compact" class="mb-4" :items="edgeOptions" v-model="edge" :disabled="!range" hide-details="auto">
                <template v-slot:selection="{ item }">{{ item.title || item.raw }}</template>
                <template v-slot:item="{ props, item }"><v-list-item v-bind="props" :title="item.title || item.raw"></v-list-item></template>
              </v-select>
              <v-select label="Tile Size" variant="outlined" density="compact" class="mb-4" :items="sizeOptions" v-model="size" :disabled="!range && !grid" hide-details="auto">
                <template v-slot:selection="{ item }">{{ item.title || item.raw }}</template>
                <template v-slot:item="{ props, item }"><v-list-item v-bind="props" :title="item.title || item.raw"></v-list-item></template>
              </v-select>
              <v-select label="Grid System" variant="outlined" density="compact" class="mb-4" :items="gridOptions" v-model="grid" hide-details="auto">
                <template v-slot:selection="{ item }">{{ item.title || item.raw }}</template>
                <template v-slot:item="{ props, item }"><v-list-item v-bind="props" :title="item.title || item.raw"></v-list-item></template>
              </v-select>
              <v-select label="Price Level" variant="outlined" density="compact" class="mb-4" :items="priceLevels" v-model="priceLevel" hide-details="auto">
                <template v-slot:selection="{ item }">{{ item.title || item.raw }}</template>
                <template v-slot:item="{ props, item }"><v-list-item v-bind="props" :title="item.title || item.raw"></v-list-item></template>
              </v-select>
              <v-radio-group v-model="seismic" hide-details="auto" class="mb-4" label="Seismic Required">
                <v-radio label="Yes" value="Yes"></v-radio>
                <v-radio label="No" value="No"></v-radio>
              </v-radio-group>
            </div>
            <div class="d-flex flex-column align-stretch pt-4">
              <v-btn color="primary" class="mb-2" size="large" @click="refreshForm" elevation="2">Refresh Calculation</v-btn>
              <v-btn color="secondary" size="large" @click="saveProject" elevation="2">Save Project</v-btn>
            </div>
          </v-card>
        </v-col>

          <v-col cols="12" md="9" lg="9"> <v-card class="mb-6 pa-4" color="surface" elevation="2"> <v-card-title class="text-h6 text-high-emphasis pb-4">Tiles</v-card-title>
              <v-table density="compact" class="tiles-table"> <thead>
                  <tr>
                    <th class="text-left text-medium-emphasis">Code</th>
                    <th class="text-left text-medium-emphasis">Name</th>
                    <th class="text-left text-medium-emphasis">QTY Enter to Accrivia</th>
                    <th class="text-left text-medium-emphasis">pcs/box</th>
                    <th class="text-left text-medium-emphasis">Total Pieces</th>
                    <th class="text-left text-medium-emphasis">Price/m²</th>
                    <th class="text-left text-medium-emphasis">Lead Time</th>
                    <th class="text-left text-medium-emphasis">Subtotal</th>
                    <th class="text-left text-medium-emphasis">Margin%</th>
                    <th class="text-left text-medium-emphasis">Set Price</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-if="tilesResult.length">
                    <tr v-for="t in tilesResult" :key="t.code">
                      <td class="text-left text-high-emphasis">{{ t.code }}</td>
                      <td class="text-left text-high-emphasis">{{ t.name }}</td>
                      <td class="text-left text-high-emphasis">{{ t.qtyAccrivia }}</td>
                      <td class="text-center text-high-emphasis">{{ t.pcsPerBox }}</td>
                      <td class="text-center text-high-emphasis">{{ t.totalPieces }}</td>
                      <td class="text-center" :class="{ 'text-error': t.isManualPrice }">
                        {{ t.pricePerM2_display }}
                      </td>
                      <td class="text-left text-high-emphasis">{{ t.leadTime }}</td>
                      <td class="text-left text-high-emphasis">
                        {{
                          formatMoney(
                            Number(t.qtyAccrivia) *
                            Number(t.pcsAccrivia) *
                            (t.setPrice > 0 ? t.setPrice : Number(t.pricePerM2)) *
                            Number(t.m2pertile)
                          )
                        }}
                      </td>
                      <td class="text-center text-high-emphasis">
                        {{ getTileMargin(t) }}
                      </td>
                      <td class="text-center">
                        <div class="d-flex align-center justify-center">
                          <span class="text-medium-emphasis mr-1">$</span>
                          <v-text-field
                            v-model.number="t.setPrice"
                            type="number"
                            placeholder="Enter"
                            density="compact"
                            hide-details="auto"
                            variant="outlined"
                            single-line
                            class="setprice-input-vuetify"
                          ></v-text-field>
                        </div>
                      </td>
                    </tr>
                  </template>
                  <tr v-else>
                    <td colspan="10" class="text-center text-medium-emphasis py-4">
                      No data to display for Tiles yet
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-card>

            <v-card class="mb-6 pa-4" color="surface" elevation="2"> <v-card-title class="text-h6 text-high-emphasis pb-4">Grids</v-card-title>

              <v-card-subtitle class="text-subtitle-1 text-high-emphasis pb-2">Essential Components</v-card-subtitle>
              <v-table density="compact" class="mb-4 grids-table-essential"> <thead>
                  <tr>
                    <th class="text-left text-medium-emphasis">Code</th>
                    <th class="text-left text-medium-emphasis">Name</th>
                    <th class="text-left text-medium-emphasis">QTY Enter to Accrivia</th>
                    <th class="text-left text-medium-emphasis">pcs/box</th>
                    <th class="text-left text-medium-emphasis">Total Pieces</th>
                    <th class="text-left text-medium-emphasis">Price/unit</th>
                    <th class="text-left text-medium-emphasis">QTY/100m²</th>
                    <th class="text-left text-medium-emphasis">Subtotal</th>
                    <th class="text-left text-medium-emphasis">Margin%</th>
                    <th class="text-left text-medium-emphasis">Set Price</th>
                    <th class="text-left text-medium-emphasis">Image</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-if="gridsResult.filter(item => item.required === 'Y').length">
                    <tr v-for="g in gridsResult.filter(item => item.required === 'Y')" :key="'ess-'+g.code">
                      <td class="text-left text-high-emphasis">{{ g.code }}</td>
                      <td class="text-left text-high-emphasis">{{ g.name }}</td>
                      <td class="text-left text-high-emphasis">{{ g.qtyAccrivia }}</td>
                      <td class="text-center text-high-emphasis">{{ g.pcsPerBox }}</td>
                      <td class="text-center text-high-emphasis">{{ g.totalPieces }}</td>
                      <td class="text-center" :class="{ 'text-error': g.isManualPrice }">
                        {{ g.price_display }}
                      </td>
                      <td class="text-left text-high-emphasis">{{ formatInt(g.qtyPer100) }}</td>
                      <td class="text-left text-high-emphasis">
                        {{
                          formatMoney(
                            (g.setPrice > 0 ? g.setPrice : g.price) *
                            g.qtyAccrivia *
                            g.packOnAccrivia *
                            g.perUnit
                          )
                        }}
                      </td>
                      <td class="text-center text-high-emphasis">{{ getGridMargin(g) }}</td>
                      <td class="text-center">
                        <div class="d-flex align-center justify-center">
                          <span class="text-medium-emphasis mr-1">$</span>
                          <v-text-field
                            v-model.number="g.setPrice"
                            type="number"
                            placeholder="Enter"
                            density="compact"
                            hide-details="auto"
                            variant="outlined"
                            single-line
                            class="setprice-input-vuetify"
                          ></v-text-field>
                        </div>
                      </td>
                      <td class="text-center">
                        <img :src="g.imageUrl" alt="" class="grid-thumb clickable-image" @click="showImageModal(g.imageUrl, g.code, g.name)" />
                      </td>
                    </tr>
                  </template>
                  <tr v-else>
                    <td colspan="11" class="text-center text-medium-emphasis py-4">No essential components</td>
                  </tr>
                </tbody>
              </v-table>

              <v-card-subtitle class="text-subtitle-1 text-high-emphasis pb-2">Optional Accessories</v-card-subtitle>
              <v-table density="compact" class="grids-table-optional"> <thead>
                  <tr>
                    <th class="text-left text-medium-emphasis">Code</th>
                    <th class="text-left text-medium-emphasis">Name</th>
                    <th class="text-left text-medium-emphasis">QTY Enter to Accrivia</th>
                    <th class="text-left text-medium-emphasis">pcs/box</th>
                    <th class="text-left text-medium-emphasis">Total Pieces</th>
                    <th class="text-left text-medium-emphasis">Price/unit</th>
                    <th class="text-left text-medium-emphasis">QTY/100m²</th>
                    <th class="text-left text-medium-emphasis">Subtotal</th>
                    <th class="text-left text-medium-emphasis">Margin%</th>
                    <th class="text-left text-medium-emphasis">Set Price</th>
                    <th class="text-left text-medium-emphasis">Image</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-if="gridsResult.filter(item => item.required !== 'Y').length">
                    <tr
                      v-for="g in gridsResult.filter(item => item.required !== 'Y')"
                      :key="'opt-'+g.code"
                    >
                      <td class="text-left">
                        <v-checkbox
                          v-model="g.isSelected"
                          density="compact"
                          hide-details="auto"
                          class="d-inline-flex align-center"
                          color="primary"
                        >
                          <template v-slot:label>
                            <span class="text-high-emphasis">{{ g.code }}</span>
                          </template>
                        </v-checkbox>
                      </td>
                      <td class="text-left text-high-emphasis">{{ g.name }}</td>
                      <td class="text-left text-high-emphasis">{{ g.qtyAccrivia }}</td>
                      <td class="text-center text-high-emphasis">{{ g.pcsPerBox }}</td>
                      <td class="text-center text-high-emphasis">{{ g.totalPieces }}</td>
                      <td class="text-center" :class="{ 'text-error': g.isManualPrice }">
                        {{ g.price_display }}
                      </td>
                      <td class="text-left text-high-emphasis">{{ g.qtyPer100 }}</td>
                      <td class="text-left text-high-emphasis">
                        {{
                          formatMoney(
                            (g.setPrice > 0 ? g.setPrice : g.price) * g.qtyAccrivia * g.packOnAccrivia  * g.perUnit
                          )
                        }}
                      </td>
                      <td class="text-center text-high-emphasis">{{ getGridMargin(g) }}</td>
                      <td class="text-center">
                        <div class="d-flex align-center justify-center">
                          <span class="text-medium-emphasis mr-1">$</span>
                          <v-text-field
                            v-model.number="g.setPrice"
                            type="number"
                            placeholder="Enter"
                            density="compact"
                            hide-details="auto"
                            variant="outlined"
                            single-line
                            class="setprice-input-vuetify"
                          ></v-text-field>
                        </div>
                      </td>
                      <td class="text-center">
                        <img :src="g.imageUrl" alt="" class="grid-thumb clickable-image" @click="showImageModal(g.imageUrl, g.code, g.name)" />
                      </td>
                    </tr>
                  </template>
                  <tr v-if="!gridsResult.filter(item => item.required !== 'Y').length">
                    <td colspan="11" class="text-center text-medium-emphasis py-4">No optional accessories</td>
                  </tr>
                </tbody>
              </v-table>
            </v-card>

            <v-card class="mb-6 pa-4" color="surface" elevation="2"> <v-row class="text-right text-subtitle-1 text-high-emphasis">
                <v-col cols="12" sm="4">
                  Tiles Subtotal: <span class="text-primary">{{ formatMoney(tileSubtotal) }} ({{ '$' + tileRate + ' per m²' }})</span>
                </v-col>
                <v-col cols="12" sm="4">
                  Essential Grids Components Subtotal: <span class="text-primary">{{ formatMoney(essentialGridsSubtotal) }} ({{ '$' + essentialRate + ' per m²' }})</span>
                </v-col>
                <v-col cols="12" sm="4">
                  Optional Accessories Subtotal: <span class="text-primary">{{ formatMoney(optionalAccessoriesSubtotal) }} ({{ '$' + optionalRate + ' per m²' }})</span>
                </v-col>
                <v-col cols="12" class="text-right text-h5 mt-4 text-high-emphasis">
                  Total (Excl. GST): <span class="text-secondary">{{ formatMoney(totalExGst) }}</span>
                </v-col>
              </v-row>
              <v-alert
                type="warning"
                variant="tonal"
                class="mt-4"
                density="compact"
              >
                Calculation based on 10x10m innovated space
              </v-alert>
            </v-card>

            <v-card class="mb-6 pa-4" color="surface" elevation="2"> <v-card-title class="text-h6 text-high-emphasis pb-4">Specification Table</v-card-title>
              <v-sheet class="pa-4 rounded-lg" color="background" :style="{ minHeight: '90px' }">
                <div v-if="specText" v-html="specText" class="text-high-emphasis"></div>
                <div v-else class="text-center text-medium-emphasis py-7">
                  No specification to display yet
                </div>
              </v-sheet>
            </v-card>
          </v-col>
        </v-row>

        <div v-if="isImageModalVisible" class="image-modal-overlay" @click="hideImageModal">
          <div class="image-modal-content" @click.stop>
            <button class="close-modal-btn" @click="hideImageModal">X</button>
            <div class="image-info-container">
              <div class="image-code-display">{{ zoomedImageCode }}</div>
              <div class="image-name-display">{{ zoomedImageName }}</div>
            </div>
            <img :src="currentZoomedImageUrl" alt="Zoomed Image" class="zoomed-image" />
          </div>
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useSheet } from './useSheet'

// Form inputs
const area        = ref('')
const range       = ref('')
const edge        = ref('')
const size        = ref('')
const grid        = ref('')
const priceLevel  = ref('')
const seismic     = ref('')

// Sheet data hooks
const {
  loading, // You might want to display a loading spinner
  error,   // You might want to display error messages
  tileRanges, edgeOptions, sizeOptions, gridOptions,
  priceLevels, seismicOptions,
  tilesResult, gridsResult,
  totalPrice, // This is now correctly calculated based on parsed prices
  calculate, refreshForm,
  // For tile editing
  showEditPopup, currentTileBeingEdited, editedTotalPieces,
  openEditPopup, closeEditPopup, confirmEditTotalPieces, resetTileTotalPieces,
  popupX, popupY
} = useSheet({ area, range, edge, size, grid, priceLevel, seismic })

watch([area, range, edge, size, grid, priceLevel, seismic], () => {
  const canCalcTiles =
    area.value && priceLevel.value && seismic.value &&
    range.value && edge.value && size.value

  const canCalcGrids =
    area.value && priceLevel.value && seismic.value &&
    grid.value && size.value

  if (canCalcTiles || canCalcGrids) calculate()

  if (!canCalcTiles) tilesResult.value = []
  if (!canCalcGrids) {
    gridsResult.value = []
    totalPrice.value  = '0.00'
  }
}, { deep: true })



// Watch for changes in gridsResult (specifically isSelected) to trigger recalculation of subtotals
// This is important because changing isSelected for an optional accessory should update the total
watch(gridsResult, () => {
  // Only trigger if essential fields are filled, otherwise it would calculate on initial load
  const ready = area.value && size.value && grid.value && priceLevel.value && seismic.value;
  if (ready) {
    // We don't need to call calculate() again, as the computed properties below handle the sum
    // based on the updated gridsResult. However, if there are other complex dependencies,
    // you might consider calling calculate() or a more specific sum-only function.
    // For now, computed properties are enough.
  }
}, { deep: true });


// 图片放大模态框相关
const isImageModalVisible = ref(false)
const currentZoomedImageUrl = ref('')
const zoomedImageCode = ref('')
const zoomedImageName = ref('')

function showImageModal(imageUrl, code, name) {
  currentZoomedImageUrl.value = imageUrl
  zoomedImageCode.value = code
  zoomedImageName.value = name
  isImageModalVisible.value = true
}

function hideImageModal() {
  isImageModalVisible.value = false
  currentZoomedImageUrl.value = ''
  zoomedImageCode.value = ''
  zoomedImageName.value = ''
}
// ========= helpers =========
function gridSubtotal(g) {
  return typeof g.subtotal === 'number'
    ? g.subtotal
    : ((g.setPrice > 0 ? g.setPrice : g.price) *
        g.qtyAccrivia *
        g.packOnAccrivia *
        g.perUnit);
}

function tileSubtotalRow(t) {
  return typeof t.subtotal === 'number'
    ? t.subtotal
    : (t.qtyAccrivia *
        t.pcsPerBox *
        (t.setPrice > 0 ? t.setPrice : t.pricePerM2) *
        t.m2pertile);
}

// ========= subtotals =========
const tileSubtotal = computed(() =>
  tilesResult.value.reduce((sum, t) => sum + tileSubtotalRow(t), 0)
);

const essentialGridsSubtotal = computed(() =>
  gridsResult.value
    .filter(g => g.required === 'Y')
    .reduce((sum, g) => sum + gridSubtotal(g), 0)
);

const optionalAccessoriesSubtotal = computed(() =>
  gridsResult.value
    .filter(g => g.required !== 'Y' && g.isSelected)
    .reduce((sum, g) => sum + gridSubtotal(g), 0)
);

// ========= rates =========
const m2 = computed(() => Number(area.value) || 1);

const tileRate      = computed(() => (tileSubtotal.value / m2.value).toFixed(2));
const essentialRate = computed(() => (essentialGridsSubtotal.value / m2.value).toFixed(2));
const optionalRate  = computed(() => (optionalAccessoriesSubtotal.value / m2.value).toFixed(2));

const totalExGst = computed(() =>
  tileSubtotal.value + essentialGridsSubtotal.value + optionalAccessoriesSubtotal.value
);
const totalRate  = computed(() => (totalExGst.value / m2.value).toFixed(2));


// Utility functions
function getTileMargin(t) {
  const cost = Number(t.costPerM2)
  // Use pricePerM2 (which is now a number) for calculation
  const base = t.setPrice > 0 ? t.setPrice : t.pricePerM2
  if (!base || !cost) return ''
  return (((base - cost) / base) * 100).toFixed(2) + '%'
}
function getGridMargin(g) {
  const cost = Number(g.costPerUnit)
  // Use price (which is now a number) for calculation
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

// Specification text
const specText = computed(() => {
  // tiles 和 grids 都没选，不显示
  if (!tilesResult.value.length && !grid.value) return ''

  const tile = tilesResult.value[0] || {}
  const areaNum = Number(area.value) || 1
  const indicativeBudget = (totalExGst.value / areaNum).toFixed(2)

  const onlyGrids = grid.value && !tilesResult.value.length

  const lines = [
    `Supplier: Armstrong Ceiling Solutions`,
  ]

  if (!onlyGrids && tilesResult.value.length) {
    const tileLine = tile.name || [range.value, edge.value, size.value].filter(Boolean).join(' ')
    lines.push(`Tiles: ${tileLine}`)
  }

  if (grid.value) {
    lines.push(`Grid System: ${grid.value}`)
  }

  // 只有当有 tile 时才显示下面两行
  if (!onlyGrids) {
    lines.push(
      `Acoustic: NRC: ${tile.nrc ?? 'N/A'}  CAC: ${tile.cac ?? 'N/A'}`,
      `Lead Time: ${tile.leadTime || 'Usually In stock'}`
    )
  }

  lines.push(
    `Indicative Budget: $${indicativeBudget} per m²`,
    `Data Sheet Link: ${
      tile.datasheet
        ? `<a href="${tile.datasheet}" target="_blank">${tile.datasheet}</a>`
        : 'N/A'
    }`
  )

  return lines.join('<br>')
})


</script>

<style scoped>
/* 移除或注释掉旧的 .page, .form-card, .main-content-col 样式 */
/* ... 步骤 1 中已注释 ... */

.app-layout {
  min-height: 100vh;
  align-items: flex-start;
  padding: 0 16px;
  max-width: 1600px;
  margin: 0 auto;
  gap: 16px;
}

.left-panel {
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: calc(100vh - 32px); /* 减去顶部和底部 v-container 的 padding */
  box-sizing: border-box;
}

.right-content {
  flex: 1;
  padding-top: 24px !important;
  padding-bottom: 24px !important;
  box-sizing: border-box;
}

/* 覆盖下拉菜单展开后的列表背景和文本颜色 */
:deep(.v-overlay__content .v-list) {
  background-color: rgb(var(--v-theme-dropdown-list-bg)) !important; /* 使用 main.js 中定义的背景色 */
}

/* 选项列表项的文本颜色 */
:deep(.v-overlay__content .v-list-item-title) {
  color: rgb(var(--v-theme-on-dropdown-list-bg)) !important; /* 使用 main.js 中定义的文字颜色 */
}
/* Set Price 输入框的 Vuetify 版本微调 */
/* .setprice-input-vuetify .v-input__control {
  min-height: unset !important;
} */
/* .setprice-input-vuetify .v-field__input {
  padding: 4px 8px !important;
  min-height: unset !important;
} */
.setprice-input-vuetify {
  width: 60px; /* 调整宽度以适应 Vuetify 文本框 */
  max-width: 60px; /* 确保固定宽度 */
  text-align: center; /* 居中输入文本 */
  /* height: 32px; /* 尝试固定高度，或依赖 density="compact" */
}
/* 覆盖 Vuetify 的 input 默认样式，让其更紧凑 */
.setprice-input-vuetify :deep(.v-field__input) {
  padding: 4px 8px !important; /* 更小的内边距 */
  min-height: unset !important; /* 移除最小高度限制 */
}
.setprice-input-vuetify :deep(.v-field__outline) {
  /* 调整边框样式，如果需要 */
}

/* 之前用于表格的自定义宽度和对齐样式保留，因为 Vuetify 的 v-table 可能会需要这些来控制列宽 */
/* New style for manual price warning (Vuetify uses text-error class by default for error color) */
.manual-price-warning {
  /* color: red !important;  Vuetify has text-error for this */
  font-weight: bold;
}

/* Code 列 */
.result-card th.codecol, .result-card td.codecol {
  width: 100px;
  min-width: 100px;
  max-width: 100px;
  text-align: left;
}
/* Name 列 */
.result-card th.namecol, .result-card td.namecol {
  width: 160px;
  min-width: 160px;
  max-width: 160px;
  text-align: left;
}
/* QTY Enter to Accrivia 列 */
.result-card th.qtycol, .result-card td.qtycol {
  width: 65px;
  min-width: 65px;
  max-width: 65px;
  text-align: left;
}
.section-header { /* 这个样式可能不再需要，因为 Vuetify 的 v-card-subtitle 会提供类似效果 */
  background: transparent; /* 背景设为透明 */
  font-weight: 700;
  color: white; /* 调整为白色 */
  text-align: left;
  padding: 0; /* 移除内边距 */
  margin-top: 16px; /* 顶部外边距 */
  margin-bottom: 8px; /* 底部外边距 */
}

/* 可选：统一 “No …” 文本的灰色 */
.no-data { /* 这个样式可能不再需要，因为 Vuetify 的 text-medium-emphasis 会提供类似效果 */
  text-align: center;
  color: #B0B0B0; /* 使用主题的 text-muted 或自定义灰色 */
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
.midcol { /* Vuetify 的 v-table 默认是左对齐，需要用 text-center 辅助类覆盖 */
  width: 65px !important;
  min-width: 65px !important;
  max-width: 65px !important;
  /* text-align: center; 已经通过 Vuetify 的 class 控制 */
}

.price-input-wrapper { /* 这个样式可能不再需要，已经被 Vuetify 的 d-flex 替代 */
  display: inline-flex;
  align-items: center;
}

.dollar-prefix { /* 这个样式可能不再需要，已经被 Vuetify 的 text-medium-emphasis 替代 */
  margin-right: 4px;
  font-weight: 600;
}

/* 移除旧的 setprice-input 样式 */
/* .setprice-input {
  -moz-appearance: textfield;
}
.setprice-input::-webkit-outer-spin-button,
.setprice-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.setprice-input {
  width: 50px;
}
.setprice-input {
  width:40px !important;
  min-width: 40px !important;
  max-width: 40px !important;
  text-align: left;
} */


/* 移除旧的表单 input/select/button 样式，因为 Vuetify 会接管 */
/* .area-input { ... }
.form-card input, .form-card select { ... }
input, select { ... }
select:focus, input:focus { ... }
button { ... }
.refresh-btn { ... }
h1 { ... } */


/* ===================== 表格区 ===================== */
/* 移除或注释掉 .result-card 的大部分样式，因为它现在是 v-card */
.result-card {
  /* background: transparent; */ /* 已经通过 v-card color="surface" 控制 */
  border-radius: 0; /* Vuetify v-card 默认有圆角，如果不需要可以覆盖 */
  box-shadow: none; /* Vuetify v-card 默认有阴影，通过 elevation="0" 或 elevation="none" 移除 */
  flex: 1;
  min-width: 750px;
  max-width: 1100px;
  font-size: 0.92em; /* Vuetify 排版，可以根据需要调整 */
}


.result-card .table-wrap {
  margin-bottom: 8px; /* 两个表格之间的间隔更小 */
}
/* .result-card table 样式将被 v-table 接管 */
/* .result-card table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 4px;
  table-layout: fixed;
  font-size: 0.92em;
} */
/* .result-card th, .result-card td 样式将被 v-table 接管 */
/* .result-card th, .result-card td {
  border: 1px solid #eee;
  padding: 4px 6px;
  font-size: 1em;
  text-align: left;
  white-space: normal;
  overflow: hidden;
  text-overflow: ellipsis;
} */

/* 表格标题样式 */
.table-title { /* 这个样式会被 v-card-title 替换 */
  text-align: center;
  font-weight: bold;
  color: white; /* 统一为白色 */
  font-size: 1.06em;
  margin-bottom: 7px;
  margin-top: 15px;
  letter-spacing: 1px;
}
.result-card .table-title:first-child {
  margin-top: 0;
}
/* .repeat-header td 会被 v-table th 接管 */
/* .repeat-header td {
  font-weight: 700;
  color: #263a4d;
} */

/* 替换 spec-table 为 v-sheet */
.spec-table {
  /* min-height: 90px; */ /* v-sheet 中设置 */
  /* padding: 18px 24px; */ /* v-sheet 中设置 pa-4 (16px) 或 pa-6 (24px) */
  /* background: #fafbfc; */ /* v-sheet 中设置 color="background" */
  /* border-radius: 15px; */ /* v-sheet 中设置 rounded-lg (12px) 或自定义 */
  /* box-shadow: 0 2px 8px #e0e9f5; */ /* v-sheet 中设置 elevation="2" 或更高 */
  font-size: 1em; /* Vuetify 默认字号，可以覆盖 */
  margin-bottom: 16px;
  margin-top: 8px;
  white-space: pre-line;
  color: white; /* 文本颜色 */
  letter-spacing: 0.2px;
  text-align: left;
}

/* ===== 图片放大模态框样式 ===== */
/* 这些样式保持不变，因为我们暂时不替换为 Vuetify 的 v-dialog */
.image-modal-overlay { /* ... 保持不变 ... */ }
.image-modal-content { /* ... 保持不变 ... */ }
.image-info-container { /* ... 保持不变 ... */ }
.image-code-display { /* ... 保持不变 ... */ }
.image-name-display { /* ... 保持不变 ... */ }
.zoomed-image { /* ... 保持不变 ... */ }
.close-modal-btn { /* ... 保持不变 ... */ }
.close-modal-btn:hover { /* ... 保持不变 ... */ }


/* 图片列宽度 & 居中 */
.imgcol {
  width: 60px;
  min-width: 60px;
  max-width: 60px;
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

/* 可点击图片样式 */
.clickable-image {
  cursor: zoom-in;
}

/* Checkbox 和 Code 在同一列的样式 */
/* 这些大部分会被 v-checkbox 的 props 和 slots 替换 */
.checkbox-code-cell {
  /* display: table-cell; */ /* 已被 Vuetify 替代 */
  /* align-items: center; */
  /* justify-content: flex-start; */
  /* gap: 5px; */
  /* padding-left: 8px; */
}

/* 移除自定义 checkbox 样式，使用 Vuetify 的 v-checkbox */
/* .inline-checkbox { ... }
.cc-wrap { ... }
.inline-checkbox::before { ... }
.inline-checkbox:checked::before { ... }
.code-text { ... }
.inline-checkbox:checked { ... } */

/* 汇总区块的样式，可以简化 */
.summary-block {
  /* font-size:16px; line-height:1.2; margin-top:16px; text-align:right; font-weight:700; */
  /* 我们可以用 Vuetify 的排版和间距类来替代 */
}
<style scoped>
/* 移除或注释掉旧的 .page, .form-card, .main-content-col 样式 */
/* ... 你的原始 CSS 中已经注释或删除的部分，我这里不再重复 ... */

.app-layout {
  min-height: 100vh;
  /* align-items: flex-start; */ /* 不再需要，v-row 会处理 */
  padding: 16px; /* 调整为统一 padding */
  max-width: 1600px;
  margin: 0 auto;
  /* gap: 16px; */ /* 不再需要，v-col 间距由 Vuetify 处理 */
}

.left-panel {
  /* 这个类名现在应用在 v-card 上，所以这里的样式可能需要调整 */
  /* padding: 24px; */ /* 已在 v-card 上用 pa-6 (24px) 代替 */
  /* display: flex; */ /* 已在 v-col 上用 d-flex flex-column 代替 */
  /* flex-direction: column; */
  /* justify-content: space-between; */
  /* min-height: calc(100vh - 32px); */ /* 由 v-col 的 flex-grow-1 配合 v-app/v-main/v-container 自动填充 */
  /* box-sizing: border-box; */
  /* rounded-r-lg 和 elevation 已在 template 中设置 */

  /* 移除 width="300"，让 v-col 的 md="3" 控制宽度 */
  /* 移除 color="surface"，已在 v-card 中设置 */
}

/* right-content 同样，现在是 v-col，很多样式会由 v-col 的默认行为和 v-card 的设置来处理 */
.right-content {
  /* flex: 1; */ /* v-col 会自动处理 flex 行为 */
  /* padding-top: 24px !important; */ /* 已由 v-container pa-4 覆盖 */
  /* padding-bottom: 24px !important; */
  /* box-sizing: border-box; */
}


/* Set Price 输入框的 Vuetify 版本微调 */
.setprice-input-vuetify {
  width: 60px; /* 调整宽度以适应 Vuetify 文本框 */
  max-width: 60px; /* 确保固定宽度 */
  text-align: center; /* 居中输入文本 */
  /* height: 32px; /* 尝试固定高度，或依赖 density="compact" */
}
/* 覆盖 Vuetify 的 input 默认样式，让其更紧凑 */
.setprice-input-vuetify :deep(.v-field__input) {
  padding: 4px 8px !important; /* 更小的内边距 */
  min-height: unset !important; /* 移除最小高度限制 */
}
.setprice-input-vuetify :deep(.v-field__outline) {
  /* 调整边框样式，如果需要 */
}

/* ===================== 表格样式调整 ===================== */
/* 为 Tiles 表格和 Grids 表格添加通用样式 */
.v-table.tiles-table,
.v-table.grids-table-essential,
.v-table.grids-table-optional {
  /* 移除表格的外部边框 */
  border: none !important;
  /* 确保背景色是白色，Vuetify默认可能是透明 */
  background-color: var(--v-theme-surface); /* 使用 Vuetify 主题变量 */
}

/* 表头样式 */
.v-table.tiles-table thead,
.v-table.grids-table-essential thead,
.v-table.grids-table-optional thead {
  background-color: rgb(var(--v-theme-table-header-bg)); /* 使用自定义的表头背景色 */
}

.v-table.tiles-table th,
.v-table.grids-table-essential th,
.v-table.grids-table-optional th {
  /* 调整表头字体颜色和粗细 */
  color: rgb(var(--v-theme-on-surface)) !important; /* 使用深色文本 */
  font-weight: 600 !important; /* 加粗 */
  padding: 8px 12px !important; /* 调整内边距 */
  border-bottom: 1px solid rgb(var(--v-theme-table-border)) !important; /* 底部边框 */
}

/* 表格行和单元格样式 */
.v-table.tiles-table tbody tr,
.v-table.grids-table-essential tbody tr,
.v-table.grids-table-optional tbody tr {
  /* 移除行之间的阴影或边框，使用细线分隔 */
  box-shadow: none !important;
  border-bottom: 1px solid rgb(var(--v-theme-table-border)) !important; /* 行底部边框 */
}

.v-table.tiles-table tbody tr:last-child,
.v-table.grids-table-essential tbody tr:last-child,
.v-table.grids-table-optional tbody tr:last-child {
  border-bottom: none !important; /* 最后一行不需要底部边框 */
}

.v-table.tiles-table tbody td,
.v-table.grids-table-essential tbody td,
.v-table.grids-table-optional tbody td {
  padding: 8px 12px !important; /* 调整内边距 */
  /* 文本颜色已经在 template 中通过 text-high-emphasis 控制，这里可以省略 */
  /* color: rgb(var(--v-theme-on-surface)) !important; */
}

/* 隔行变色 (可选，如果第二张图有) */
.v-table.tiles-table tbody tr:nth-of-type(odd),
.v-table.grids-table-essential tbody tr:nth-of-type(odd),
.v-table.grids-table-optional tbody tr:nth-of-type(odd) {
  background-color: #F8FAFC* 稍微深一点的背景，增加可读性 */
}

/* 鼠标悬停效果 */
.v-table.tiles-table tbody tr:hover,
.v-table.grids-table-essential tbody tr:hover,
.v-table.grids-table-optional tbody tr:hover {
  background-color: #F8FAFC; /* 鼠标悬停时轻微变色 */
}


/* Code 列 */
/* 移除 result-card 前缀，直接对 v-table 内部的 th/td 应用 */
.v-table th.codecol, .v-table td.codecol {
  width: 100px;
  min-width: 100px;
  max-width: 100px;
  text-align: left;
}
/* Name 列 */
.v-table th.namecol, .v-table td.namecol {
  width: 160px;
  min-width: 160px;
  max-width: 160px;
  text-align: left;
}
/* QTY Enter to Accrivia 列 */
.v-table th.qtycol, .v-table td.qtycol {
  width: 65px;
  min-width: 65px;
  max-width: 65px;
  text-align: left;
}
.section-header { /* 这个样式应该被 v-card-title 和 v-card-subtitle 替代 */
  /* 移除或检查是否还有地方在使用 */
}

/* 可选：统一 “No …” 文本的灰色 */
.no-data { /* 这个样式应该被 Vuetify 的 text-medium-emphasis 替代 */
  /* 移除或检查是否还有地方在使用 */
}

/* Subtotal 列 */
.v-table th.subtcol, .v-table td.subtcol {
  width: 80px;
  min-width: 80px;
  max-width: 80px;
  text-align: left;
}
.v-table th.qtytimecol, .v-table td.qtytimecol {
  width: 65px;
  min-width: 65px;
  max-width: 65px;
  text-align: left;
}
.v-table th.pricecol, .v-table td.pricecol {
  width: 65px;
  min-width: 65px;
  max-width: 65px;
  text-align: Center;
}
.midcol { /* Vuetify 的 v-table 默认是左对齐，需要用 text-center 辅助类覆盖 */
  width: 65px !important;
  min-width: 65px !important;
  max-width: 65px !important;
  /* text-align: center; 已经通过 Vuetify 的 class 控制 */
}

.price-input-wrapper { /* 这个样式已不再需要，已被 Vuetify 的 d-flex 替代 */ }
.dollar-prefix { /* 这个样式已不再需要，已被 Vuetify 的 text-medium-emphasis 替代 */ }


/* 移除旧的 setprice-input 样式，它们现在由 setprice-input-vuetify 处理 */


/* ===================== 表格区 ===================== */
/* 移除 .result-card 的样式，因为它现在是 v-card，其样式由 Vuetify props 和我们新的 CSS 控制 */
/* .result-card { ... } */

.result-card .table-wrap {
  margin-bottom: 8px; /* 两个表格之间的间隔更小 */
}
/* .result-card table 样式将被 v-table 接管 */
/* .result-card th, .result-card td 样式将被 v-table 接管 */


/* 表格标题样式 */
.table-title { /* 这个样式会被 v-card-title 替换 */
  /* 移除或检查是否还有地方在使用 */
}

/* 替换 spec-table 为 v-sheet */
.spec-table {
  /* 移除或检查是否还有地方在使用，现在由 v-sheet 及其 class 控制 */
}

/* ===== 图片放大模态框样式 ===== */
/* 这些样式保持不变，因为我们暂时不替换为 Vuetify 的 v-dialog */
.image-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.image-modal-content {
  position: relative;
  background-color: #333; /* 可以调整模态框背景色 */
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.image-info-container {
  text-align: center;
  color: white; /* 确保信息文本在深色背景上可见 */
}

.image-code-display {
  font-size: 1.2em;
  font-weight: bold;
  margin-bottom: 5px;
}

.image-name-display {
  font-size: 1em;
  opacity: 0.8;
}

.zoomed-image {
  max-width: 100%;
  max-height: 70vh; /* 调整高度以适应信息文本 */
  object-fit: contain;
}

.close-modal-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 1.5em;
  color: white;
  cursor: pointer;
  padding: 5px;
  line-height: 1;
  z-index: 1001;
}

.close-modal-btn:hover {
  color: #ccc;
}


/* 图片列宽度 & 居中 */
.imgcol {
  width: 60px;
  min-width: 60px;
  max-width: 60px;
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

/* 可点击图片样式 */
.clickable-image {
  cursor: zoom-in;
}

/* Checkbox 和 Code 在同一列的样式 */
/* 这些大部分会被 v-checkbox 的 props 和 slots 替换 */
.checkbox-code-cell {
  /* 移除或检查是否还有地方在使用 */
}

/* 汇总区块的样式，可以简化 */
.summary-block {
  /* 移除或检查是否还有地方在使用 */
}
</style>