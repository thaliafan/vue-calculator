<template>
  <v-app>
    <v-main>
      <v-container fluid class="pa-4 app-layout"> <v-row>
        <h1 style="color: red;">🚧 这是 dev 分支 🚧</h1>
<v-col cols="4" md="3" lg="3" class="sticky-menu">  
<v-card class="pa-6 rounded-lg left-menu-card" color="#334155" theme="dark">
<v-card-title class="text-h5 text-white pt-4 pb-2 font-weight-bold mb-10">Ceiling Calculator</v-card-title>    
    <div>
      <v-text-field label="Area (m²)" variant="outlined" density="compact" class="mb-4" v-model.number="area" type="number" min="0" hide-details="auto" hide-spin-buttons></v-text-field>
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
        <v-radio label="No" value="No"></v-radio>
        <v-radio label="Yes" value="Yes"></v-radio>
      </v-radio-group>
    </div>
    
    <div class="d-flex flex-column align-stretch pt-4">
      <v-btn color="primary" class="mb-2" size="large" @click="refreshForm" elevation="2">Refresh</v-btn>
      <v-btn color="secondary" size="large" @click="saveProject" elevation="2">Save Project</v-btn>
    </div>
    
  </v-card>
</v-col>

          <v-col cols="8" md="9" lg="9"> 
            
<v-card class="mb-6 pa-4" color="surface" elevation="2">
  <v-card-title class="text-h6 text-high-emphasis pb-4">Tiles</v-card-title>

  <v-table density="compact" class="tiles-table">
<thead>
  <tr>
    <th class="text-left text-medium-emphasis col-code" style="width: 220px !important;">Code</th>
    <th class="text-left text-medium-emphasis col-name" style="width: 290px !important;">Name</th>
    <th class="text-left text-medium-emphasis">QTY Enter to Accrivia</th>
    <th class="text-left text-medium-emphasis">pcs/box</th>
    <th class="text-left text-medium-emphasis">Total Pieces</th>
    <th class="text-left text-medium-emphasis">Price/m²</th>
    <th class="text-left text-medium-emphasis col-mid">LeadTime</th>
    <th class="text-left text-medium-emphasis">Subtotal</th>
    <th class="text-left text-medium-emphasis">Margin%</th>
    <th class="text-left text-medium-emphasis">Data Sheet</th>
  </tr>
</thead>
    <tbody>
      <template v-if="tilesResult.length">
        <tr v-for="t in tilesResult" :key="t.code">
<td class="col-code position-relative">
  <span class="code-text">{{ t.code }}</span>

  <v-tooltip location="top">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        class="position-absolute"
        style="top: 0; right: 0;"
        icon
        size="x-small"
        variant="text"
        @click="copyToClipboard(t.code)"
      >
        <v-icon size="small">{{ copiedCode === t.code ? 'mdi-check' : 'mdi-content-copy' }}</v-icon>
      </v-btn>
    </template>
    <span>{{ copiedCode === t.code ? 'Copied!' : 'Copy Code' }}</span>
  </v-tooltip>
</td>
          <td class="col-name">{{ t.name }}</td>
          <td class="col-qty">{{ getEffectiveQtyAccrivia(t) }}</td>
          <td class="col-pcs">{{ t.pcsPerBox }}</td>
<td class="col-total">
  <div class="text-center">{{ t.totalPieces }}</div>
  <div class="d-flex align-center justify-center mt-1">
    <v-icon size="x-small" color="blue" class="mr-1">mdi-pencil</v-icon>
    <v-text-field
      v-model.number="t.setTotalPieces"
      type="number"
      placeholder="Set QTY"
      density="compact"
      hide-details="auto"
      variant="outlined"
      single-line
      class="setprice-input-vuetify"
    ></v-text-field>
  </div>
</td>

<td class="col-price price-cell">
  <div>{{ t.pricePerM2_display }} </div>
  <div class="d-flex align-center mt-1">
    <v-icon size="x-small" color="blue" class="mr-1">mdi-pencil</v-icon>
    <v-text-field
      v-model="t.setPrice"
      type="number"
      placeholder="Set Price"
      density="compact"
      hide-details="auto"
      variant="outlined"
      single-line
      class="setprice-input-vuetify"
    ></v-text-field>
  </div>
</td>
          <td class="col-mid">{{ t.leadTime }}</td>
<td class="col-subtotal">
  {{ formatMoney(tileSubtotalRow(t)) }}
</td>
          <td class="col-margin text-center">{{ getTileMargin(t) }}</td>
          <td class="col-datasheet text-center">
            <v-btn
              v-if="t.datasheet"
              :href="t.datasheet"
              target="_blank"
              rel="noopener noreferrer"
              icon="mdi-file-pdf-box"
              variant="text"
              size="small"
              title="View Data Sheet"
            ></v-btn>
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

            <v-card class="mb-6 pa-4" color="surface" elevation="2"> 

<v-card-title class="text-h6 text-high-emphasis pb-4">Essential Grids Components</v-card-title>
              <v-table density="compact" class="mb-10 grids-table-essential"> <thead>
                  <tr>
                    <th class="text-left text-medium-emphasis col-code" style="width: 220px !important;">Code</th>
                    <th class="text-left text-medium-emphasis col-name" style="width: 290px !important;">Name</th>
                    <th class="text-left text-medium-emphasis col-qty">QTY Enter to Accrivia</th>
                    <th class="text-left text-medium-emphasis">pcs/box</th>
                    <th class="text-left text-medium-emphasis">Total Pieces</th>
                    <th class="text-left text-medium-emphasis">Price/unit</th>
                    <th class="text-left text-medium-emphasis col-mid">QTY/100m²</th>
                    <th class="text-left text-medium-emphasis">Subtotal</th>
                    <th class="text-left text-medium-emphasis">Margin%</th>
                    <th class="text-left text-medium-emphasis">Image</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-if="gridsResult.filter(item => item.required === 'Y').length">
<tr v-for="g in gridsResult.filter(item => item.required === 'Y')" :key="'ess-'+g.code">
  <td class="text-left text-high-emphasis col-code position-relative">
    <span class="code-text">{{ g.code }}</span>
    <v-tooltip location="top">
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props" class="position-absolute" style="top: 0; right: 0;" icon size="x-small" variant="text" @click="copyToClipboard(g.code)">
          <v-icon size="small">{{ copiedCode === g.code ? 'mdi-check' : 'mdi-content-copy' }}</v-icon>
        </v-btn>
      </template>
      <span>{{ copiedCode === g.code ? 'Copied!' : 'Copy Code' }}</span>
    </v-tooltip>
  </td>

  <td class="text-left text-high-emphasis col-name"> 
    <div><template v-if="g.options">
      <v-select item-value="code" :items="g.options" :model-value="g" return-object @update:modelValue="updateWallAngleSelection" variant="outlined" density="compact" hide-details>
        <template v-slot:selection="{ item }">
          <span class="selection-text-color text-wrap text-caption text-high-emphasis">{{ item.raw.name }}</span>
        </template>
        <template v-slot:item="{ props, item }">
          <v-list-item v-bind="props" :title="null">
            <v-list-item-title class="text-wrap">{{ item.raw.name }} ({{ item.raw.code }})</v-list-item-title>
          </v-list-item>
        </template>
      </v-select>
    </template>
    <template v-else>
      {{ g.name }}
    </template></div>
  </td>

  <td class="text-left text-high-emphasis col-qty">{{ getEffectiveGridQtyAccrivia(g) }}</td>

  <td class="text-left text-high-emphasis col-pcs">{{ g.pcsPerBox }}</td> <td class="text-left col-total"> <div class="text-center">{{ g.totalPieces }}</div>
    <div class="d-flex align-center justify-center mt-1">
      <v-icon size="x-small" color="blue" class="mr-1">mdi-pencil</v-icon>
      <v-text-field v-model.number="g.setTotalPieces" type="number" placeholder="Set QTY" density="compact" hide-details="auto" variant="outlined" single-line class="setprice-input-vuetify"></v-text-field>
    </div>
  </td>

  <td class="text-left price-cell col-price" :class="{ 'text-error': g.isManualPrice }"> <div class="text-center">{{ g.price_display }}</div>
    <div class="d-flex align-center mt-1">
      <v-icon size="x-small" color="blue" class="mr-1">mdi-pencil</v-icon>
      <v-text-field v-model="g.setPrice" type="number" placeholder="Set Price" density="compact" hide-details="auto" variant="outlined" single-line class="setprice-input-vuetify"></v-text-field>
    </div>
  </td>

<td class="text-left text-high-emphasis col-mid">{{ formatInt(g.qtyPer100) }}</td>

  <td class="text-left text-high-emphasis col-subtotal">{{ formatMoney(gridSubtotalRow(g)) }}</td> <td class="text-center text-high-emphasis col-margin">{{ getGridMargin(g) }}</td> <td class="text-center col-image"> <img :src="g.imageUrl" alt="" class="grid-thumb clickable-image" @click="showImageModal(g.imageUrl, g.code, g.name, g.pcsPerBox)" />
  </td>
</tr>
                  </template>
                  <tr v-else>
                    <td colspan="11" class="text-center text-medium-emphasis py-4">No essential components</td>
                  </tr>
                </tbody>
              </v-table>

<v-card-title class="text-h6 text-high-emphasis pb-0">Optional Accessories</v-card-title>

             <v-card-subtitle class="text-subtitle-1 text-high-emphasis pb-4">
               *Select required accessories
             </v-card-subtitle>
              <v-table density="compact" class="grids-table-optional"> <thead>
                  <tr>
                    <th class="text-left text-medium-emphasis col-code" style="width: 220px !important;">Code</th>
                    <th class="text-left text-medium-emphasis col-name" style="width: 290px !important;">Name</th>
                    <th class="text-left text-medium-emphasis col-qty">QTY Enter to Accrivia</th>
                    <th class="text-left text-medium-emphasis">pcs/box</th>
                    <th class="text-left text-medium-emphasis">Total Pieces</th>
                    <th class="text-left text-medium-emphasis">Price/unit</th>
                    <th class="text-left text-medium-emphasis">QTY/100m²</th>
                    <th class="text-left text-medium-emphasis">Subtotal</th>
                    <th class="text-left text-medium-emphasis">Margin%</th>
                    <th class="text-left text-medium-emphasis">Image</th>
                  </tr>
                </thead>
<tbody>
  <template v-if="gridsResult.filter(item => item.required !== 'Y').length">
<tr v-for="g in gridsResult.filter(item => item.required !== 'Y')" :key="'opt-'+g.code">
  <td class="text-left col-code position-relative">
    <div class="d-flex align-center">
      <v-checkbox v-model="g.isSelected" density="compact" hide-details="auto" color="primary" class="pr-2"></v-checkbox>
      <span class="text-high-emphasis code-text">{{ g.code }}</span>
    </div>
    <v-tooltip location="top">
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props" class="position-absolute" style="top: 6px; right: 0;" icon size="x-small" variant="text" @click="copyToClipboard(g.code)">
          <v-icon size="small">{{ copiedCode === g.code ? 'mdi-check' : 'mdi-content-copy' }}</v-icon>
        </v-btn>
      </template>
      <span>{{ copiedCode === g.code ? 'Copied!' : 'Copy Code' }}</span>
    </v-tooltip>
  </td>

  <td class="text-left text-high-emphasis col-name">{{ g.name }}</td> <td class="text-left text-high-emphasis col-qty">{{ getEffectiveGridQtyAccrivia(g) }}</td>

  <td class="text-left text-high-emphasis col-pcs">{{ g.pcsPerBox }}</td> <td class="text-left col-total"> <div class="text-center">{{ g.totalPieces }}</div>
    <div class="d-flex align-center justify-center mt-1">
      <v-icon size="x-small" color="blue" class="mr-1">mdi-pencil</v-icon>
      <v-text-field v-model.number="g.setTotalPieces" type="number" placeholder="Set QTY" density="compact" hide-details="auto" variant="outlined" single-line class="setprice-input-vuetify"></v-text-field>
    </div>
  </td>

  <td class="text-left price-cell col-price" :class="{ 'text-error': g.isManualPrice }"> <div class="text-center">{{ g.price_display }}</div>
    <div class="d-flex align-center mt-1">
      <v-icon size="x-small" color="blue" class="mr-1">mdi-pencil</v-icon>
      <v-text-field v-model="g.setPrice" type="number" placeholder="Set Price" density="compact" hide-details="auto" variant="outlined" single-line class="setprice-input-vuetify"></v-text-field>
    </div>
  </td>

  <td class="text-left text-high-emphasis col-mid">{{ g.qtyPer100 }}</td>

  <td class="text-left text-high-emphasis col-subtotal">{{ formatMoney(gridSubtotalRow(g)) }}</td> <td class="text-center text-high-emphasis col-margin">{{ getGridMargin(g) }}</td> <td class="text-center col-image"> <img :src="g.imageUrl" alt="" class="grid-thumb clickable-image" @click="showImageModal(g.imageUrl, g.code, g.name, g.pcsPerBox)" />
  </td>
</tr>


  </template>
  <tr v-if="!gridsResult.filter(item => item.required !== 'Y').length">
    <td colspan="10" class="text-center text-medium-emphasis py-4">No optional accessories</td>
  </tr>
</tbody>
              </v-table>
            </v-card>

<v-card class="mb-6 pa-4" color="surface" elevation="2">
             <div class="text-h6 text-high-emphasis pb-4">Subtotals</div>
             <v-row no-gutters class="text-subtitle-1">
               <v-col cols="12" sm="3" class="pa-2"> <v-card class="pa-4 rounded-lg text-center" color="#F8FAFC" flat> <div class="text-subtitle-2 text-medium-emphasis mb-1">Tiles Subtotal</div>
                   <div class="text-h6 text-high-emphasis text-primary">{{ formatMoney(tileSubtotal) }}</div>
                   <div class="text-caption text-medium-emphasis">({{ '$' + tileRate + ' per m²' }})</div>
                 </v-card>
               </v-col>

               <v-col cols="12" sm="3" class="pa-2">
                 <v-card class="pa-4 rounded-lg text-center" color="#F8FAFC" flat>
                   <div class="text-subtitle-2 text-medium-emphasis mb-1">Essential Components Subtotal</div>
                   <div class="text-h6 text-high-emphasis text-primary">{{ formatMoney(essentialGridsSubtotal) }}</div>
                   <div class="text-caption text-medium-emphasis">({{ '$' + essentialRate + ' per m²' }})</div>
                 </v-card>
               </v-col>

               <v-col cols="12" sm="3" class="pa-2">
                 <v-card class="pa-4 rounded-lg text-center" color="#F8FAFC" flat>
                   <div class="text-subtitle-2 text-medium-emphasis mb-1">Optional Accessories Subtotal</div>
                   <div class="text-h6 text-high-emphasis text-primary">{{ formatMoney(optionalAccessoriesSubtotal) }}</div>
                   <div class="text-caption text-medium-emphasis">({{ '$' + optionalRate + ' per m²' }})</div>
                 </v-card>
               </v-col>

               <v-col cols="12" sm="3" class="pa-2">
                 <v-card class="pa-4 rounded-lg text-center" color="#E8F5E9" flat> <div class="text-subtitle-2 text-high-emphasis mb-1">Total (Excl. GST)</div>
                   <div class="text-h5 text-high-emphasis text-secondary">{{ formatMoney(totalExGst) }}</div> <div class="text-caption text-high-emphasis">({{ '$' + totalRate + ' per m²' }})</div>
                 </v-card>
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

// 用于提供“复制成功”反馈的状态
const copiedCode = ref(null);

// 复制到剪贴板的函数
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    copiedCode.value = text; // 记录刚刚复制了哪个code
    // 2秒后清除记录，让图标恢复原样
    setTimeout(() => {
      copiedCode.value = null;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy: ', err);
    // 您可以在这里添加一个错误提示，比如弹出一个小通知
  }
}

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
  calculate, 
  refreshForm,
  updateWallAngleSelection, // <--- 在这里添加新函数
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

function showImageModal(imageUrl, code, name, pcsPerBox) {
  currentZoomedImageUrl.value = imageUrl
  zoomedImageCode.value = code
  zoomedImageName.value = `${name} (${pcsPerBox}pcs/box)`
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
// =================================================================
// 请将以下两个新函数添加到您的 <script setup>
// =================================================================

function getEffectiveGridQtyAccrivia(g) {
  // 1. 决定使用哪个 "Total Pieces" 的值 (手动输入优先)
  const setQty = Number(g.setTotalPieces);
  const effectiveTotalPieces = (setQty && setQty > 0) ? setQty : g.totalPieces;

  if (effectiveTotalPieces <= 0) {
    return 0;
  }

  // 2. 在此完整复制 useSheet.js 中 Grids 的 QTY 计算逻辑
  const packOnAccrivia = Number(g.packOnAccrivia || 0);
  const packActual = Number(g.pcsPerBox || 0); // 在您的代码中 pcsPerBox 是 packActual 的别名

  if (packOnAccrivia > 0 && packActual > 0) {
    if (packOnAccrivia === packActual) {
      return Math.ceil(effectiveTotalPieces / packOnAccrivia);
    } else {
      return Math.ceil(effectiveTotalPieces / packActual) * packActual;
    }
  }
  
  // 如果逻辑无法应用，返回原始计算值
  return g.qtyAccrivia;
}

function gridSubtotalRow(g) {
  // 1. 获取动态计算出的 QTY Accrivia
  const effectiveQtyAccrivia = getEffectiveGridQtyAccrivia(g);
  
  // 2. 决定使用哪个价格
  const effectivePrice = (g.setPrice > 0 ? g.setPrice : g.price);

  // 3. 复制 Grids 的 Subtotal 计算逻辑
  const packOnAccrivia = Number(g.packOnAccrivia || 0);
  const perUnit = Number(g.perUnit || 1);

  return effectivePrice * effectiveQtyAccrivia * packOnAccrivia * perUnit;
}
function getEffectiveQtyAccrivia(t) {
  // 1. 决定用于计算的 "Total Pieces" 的值 (手动输入优先)
  const setQty = Number(t.setTotalPieces);
  const effectiveTotalPieces = (setQty && setQty > 0) ? setQty : t.totalPieces;

  // 如果没有有效的总片数，返回0
  if (effectiveTotalPieces <= 0) {
    return 0;
  }

  // 2. 在此完整复制 useSheet.js 中的最终计算逻辑
  const M_pcsBox = Number(t.pcsPerBox || 0);
  const N_pcsAccrivia = Number(t.pcsAccrivia || 0);

  // 如果每箱数量无效，无法计算
  if (M_pcsBox <= 0) {
    return 0;
  }

  // 规则 1: 如果 N 列为空或等于 M 列，返回计算出的“箱数”
  if (N_pcsAccrivia === 0 || N_pcsAccrivia === M_pcsBox) {
    return Math.ceil(effectiveTotalPieces / M_pcsBox);
  }

  // 规则 2: 如果 N 列不等于 M 列，返回“向上取整到一整箱后的总片数”
  if (N_pcsAccrivia > 0 && N_pcsAccrivia !== M_pcsBox) {
    const Y = Math.ceil(effectiveTotalPieces / M_pcsBox);
    return Y * M_pcsBox;
  }

  // 其他情况的备用返回值
  return 0;
}
function tileSubtotalRow(t) {
  // 1. 决定用于计算的 "Total Pieces" 的值
  //    如果用户在 "Set QTY" 输入了有效数字，则使用该数字。
  //    否则，使用原始的 t.totalPieces (即 t.qtyAccrivia * t.pcsPerBox)。
  const effectiveTotalPieces = (t.setTotalPieces && Number(t.setTotalPieces) > 0)
                                ? Number(t.setTotalPieces)
                                : t.totalPieces;

  // 2. 将这个值应用到您原有的计算逻辑中
  //    除了 total pieces 的来源，其他所有逻辑都保持不变。
  return typeof t.subtotal === 'number'
    ? t.subtotal
    : (effectiveTotalPieces * // << 这是公式中唯一被改变的部分
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
    .reduce((sum, g) => sum + gridSubtotalRow(g), 0) // <== 使用新的函数
);

const optionalAccessoriesSubtotal = computed(() =>
  gridsResult.value
    .filter(g => g.required !== 'Y' && g.isSelected)
    .reduce((sum, g) => sum + gridSubtotalRow(g), 0) // <== 使用新的函数
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
  if (val === undefined || val === null || val === '') return '';
  const numberValue = Number(val);
  if (isNaN(numberValue)) return ''; // 如果转换失败，返回空

  // 使用 toLocaleString() 来自动添加千位符，并保留两位小数
  return '$' + numberValue.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
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
/* --- 在这里添加下面的新样式 --- */

.sticky-menu {
  position: -webkit-sticky; /* 兼容 Safari 浏览器 */
  position: sticky;
  top: 16px; /* 让它在距离顶部 16px 的位置停住，和页面的内边距保持一致 */
  align-self: flex-start; /* 这非常重要，确保它在 Flex 布局中能够正确地“粘住” */
}
.left-panel {
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* <-- 把这个加回来 */
  min-height: calc(100vh - 32px); /* <-- 也把这个加回来 */
  box-sizing: border-box;
}
.left-menu-card {
  /* 设置最小高度为屏幕可见高度的 70% */
  /* 你可以随意调整这个值，比如 60vh, 85vh 等，直到满意为止 */
  min-height: 95vh; 
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

/* 之前用于表格的自定义宽度和对齐样式保留，因为 Vuetify 的 v-table 可能会需要这些来控制列宽 */
/* New style for manual price warning (Vuetify uses text-error class by default for error color) */
.manual-price-warning {
  /* color: red !important;  Vuetify has text-error for this */
  font-weight: bold;
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
<style Scoped>

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


/* ===================== 表格样式调整 ===================== */
/* 为 Tiles 表格和 Grids 表格添加通用样式 */
.v-table.tiles-table,
.v-table.grids-table-essential,
.v-table.grids-table-optional {
  /* 移除表格的外部边框 */
  border: none !important;
  /* 确保背景色是白色，Vuetify默认可能是透明 */
  background-color: var(--v-theme-surface); /* 使用 Vuetify 主题变量 */
  
  /* --- 新增这一行，强制所有表格使用固定布局 --- */
  table-layout: fixed;
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

/* 3. 修正隔行变色中的语法错误 */
.v-table.tiles-table tbody tr:nth-of-type(odd),
.v-table.grids-table-essential tbody tr:nth-of-type(odd),
.v-table.grids-table-optional tbody tr:nth-of-type(odd) {
    background-color: #F8FAFC; /* 修正了此处的注释语法 */
}

/* 鼠标悬停效果 */
.v-table.tiles-table tbody tr:hover,
.v-table.grids-table-essential tbody tr:hover,
.v-table.grids-table-optional tbody tr:hover {
  background-color: #F8FAFC; /* 鼠标悬停时轻微变色 */
}
.code-text {
  white-space: normal !important;
  word-break: break-all !important;
}
/* ================================================= */
/* ========== MASTER COLUMN WIDTH CONTROL ========== */
/* ================================================= */

/* --- 所有表格的列宽都在这里统一控制 --- */
/* ========================================================= */
/* == 新版解决方案：强制修正列宽和重叠问题 == */
/* ========================================================= */

.v-table .col-qty     { width: 110px !important; }
.v-table .col-pcs     { width: 80px !important; }
.v-table .col-total   { width: 120px !important; }
.v-table .col-price   { width: 110px !important; }
.v-table .col-mid     { width: 60px !important; } /* <-- 您为 Lead Time 和 QTY/100m² 设置的 60px 在这里 */
.v-table .col-subtotal{ width: 110px !important; }
.v-table .col-margin  { width: 90px !important; }
.v-table .col-last    { width: 90px !important; }
.v-table.tiles-table,
.v-table.grids-table-essential,
.v-table.grids-table-optional {
    table-layout: fixed !important;
}
/* --- 步骤2：为每个表格的 "Name" 列应用样式 --- */
/* 同
.result-card .table-wrap {
  margin-bottom: 8px; /* 两个表格之间的间隔更小 */
/* .result-card table 样式将被 v-table 接管 */
/* .result-card th, .result-card td 样式将被 v-table 接管 */
/*
 * 解决 Code 列宽度和重叠问题
 */
.v-table td.col-code {
  position: relative; /* 确保td是按钮的定位父级 */
  padding-right: 36px !important; /* 为右侧的复制按钮留出空间 */
}

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


/*
  为新的 Data Sheet 列和 Grids 的 Image 列
  设置统一的 class 和宽度，确保对齐
*/
.col-datasheet,
.col-image { 
  width: 6%;
  text-align: center;
}

/*
 * 请将此代码块粘贴到原位
 */
/* Set Price 输入框的 Vuetify 版本微调 */
.setprice-input-vuetify {
  width: 53px; /* 根据您的要求再次减小宽度 */
  max-width: 53px; /* 根据您的要求再次减小宽度 */
}

/* 隐藏 setprice-input-vuetify 内部数字输入框的上下箭头 */
.setprice-input-vuetify :deep(input[type='number']) {
  -moz-appearance: textfield; /* Firefox */
}

.setprice-input-vuetify :deep(input[type='number']::-webkit-outer-spin-button),
.setprice-input-vuetify :deep(input[type='number']::-webkit-inner-spin-button) {
  -webkit-appearance: none;
  margin: 0;
}

/* 覆盖 Vuetify 的 input 默认样式，让其更紧凑并减小字体 */
.setprice-input-vuetify :deep(.v-field__input) {
  padding: 2px 4px !important; /* 调整内边距以适应更小尺寸 */
  min-height: unset !important;
  font-size: 10.5px !important; /* 再次减小字体以在缩小后的框内显示 "Set Price" */
}

/* 确保 v-text-field 的 outline 样式不会被破坏 */
.setprice-input-vuetify :deep(.v-field__outline) {
  /* 可根据需要添加样式 */
}

/* 设置 Set Price 输入框的占位符样式 */
.setprice-input-vuetify :deep(input::placeholder) {
  color: #9E9E9E !important;
  font-style: italic; /* 改回斜体以匹配用户要求 */
  opacity: 1;
}

/* 强制所有表格中所有单元格的内容都从顶部开始对齐 */
.tiles-table tbody td,
.grids-table-essential tbody td,
.grids-table-optional tbody td {
  vertical-align: top !important;
}
/* --- Vertical Alignment Fix --- */

/* Target the specific cells in the Tiles table to control their layout */
.tiles-table .col-total,
.tiles-table .col-price {
  vertical-align: top;
  padding-top: 12px !important; /* Adjust this value to fine-tune alignment */
}

/* --- 垂直对齐修正 --- */

/* 强制 Tiles 表格中所有单元格的内容都从顶部开始对齐 */
.tiles-table tbody td {
  vertical-align: top !important;
}
<style>
/* 最终修正: 使用全局样式来覆盖Vuetify默认的前缀字体大小 */
.setprice-input-vuetify .v-field__prefix {
  font-size: 10.5px !important;
  color: inherit !important;
  padding-right: 2px;
  display: flex;
  align-items: center;
}
.selection-text-color {
  color: rgb(var(--v-theme-on-surface)) !important;
}
</style>
