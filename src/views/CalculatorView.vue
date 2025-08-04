<template>
  <v-main>
    <v-container fluid class="pa-4 app-layout">
      <v-row>
        <v-col cols="12" md="4" lg="3" class="sticky-menu">
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

        <v-col cols="12" md="8" lg="9">
          <v-card class="mb-6 pa-4" color="surface" elevation="2">
            <v-card-title class="text-h6 text-high-emphasis pb-4">Tiles</v-card-title>
            <v-table density="compact" class="tiles-table">
              <thead>
                <tr>
                  <th class="text-left text-medium-emphasis col-code" style="width: 220px !important;">Code</th>
                  <th class="text-left text-medium-emphasis col-name" style="width: 290px !important;">Name</th>
                  <th class="text-left text-medium-emphasis">System QTY</th>
                  <th class="text-left text-medium-emphasis">pcs/box</th>
                  <th class="text-left text-medium-emphasis">Total Pieces</th>
                  <th class="text-left text-medium-emphasis">Price/m²</th>
                  <th class="text-left text-medium-emphasis col-mid">LeadTime</th>
                  <th class="text-left text-medium-emphasis">Subtotal</th>
                  <th v-if="auth.canViewMargin" class="text-left text-medium-emphasis">Margin%</th>
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
                          <v-btn v-bind="props" class="position-absolute" style="top: 0; right: 0;" icon size="x-small" variant="text" @click="copyToClipboard(t.code)">
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
                        <v-text-field v-model.number="t.setTotalPieces" type="number" placeholder="Set QTY" density="compact" hide-details="auto" variant="outlined" single-line class="setprice-input-vuetify"></v-text-field>
                      </div>
                    </td>
                    <td class="col-price price-cell">
                      <div>{{ t.pricePerM2_display }} </div>
                      <div class="d-flex align-center mt-1">
                        <v-icon size="x-small" color="blue" class="mr-1">mdi-pencil</v-icon>
                        <v-text-field v-model="t.setPrice" type="number" placeholder="Set Price" density="compact" hide-details="auto" variant="outlined" single-line class="setprice-input-vuetify"></v-text-field>
                      </div>
                    </td>
                    <td class="col-mid">{{ t.leadTime }}</td>
                    <td class="col-subtotal">{{ formatMoney(tileSubtotalRow(t)) }}</td>
                    <td v-if="auth.canViewMargin" class="col-margin text-center">{{ getTileMargin(t) }}</td>
                    <td class="col-datasheet text-center">
                      <v-btn v-if="t.datasheet" :href="t.datasheet" target="_blank" rel="noopener noreferrer" icon="mdi-file-pdf-box" variant="text" size="small" title="View Data Sheet"></v-btn>
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
            <v-table density="compact" class="mb-10 grids-table-essential">
              <thead>
                <tr>
                  <th class="text-left text-medium-emphasis col-code" style="width: 220px !important;">Code</th>
                  <th class="text-left text-medium-emphasis col-name" style="width: 290px !important;">Name</th>
                  <th class="text-left text-medium-emphasis col-qty">System QTY</th>
                  <th class="text-left text-medium-emphasis">pcs/box</th>
                  <th class="text-left text-medium-emphasis">Total Pieces</th>
                  <th class="text-left text-medium-emphasis">Price/unit</th>
                  <th class="text-left text-medium-emphasis col-mid">QTY/100m²</th>
                  <th class="text-left text-medium-emphasis">Subtotal</th>
                  <th v-if="auth.canViewMargin" class="text-left text-medium-emphasis">Margin%</th>
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
                      <div>
                        <template v-if="g.options">
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
                        </template>
                      </div>
                    </td>
                    <td class="text-left text-high-emphasis col-qty">{{ getEffectiveGridQtyAccrivia(g) }}</td>
                    <td class="text-left text-high-emphasis col-pcs">{{ g.pcsPerBox }}</td>
                    <td class="text-left col-total">
                      <div class="text-center">{{ g.totalPieces }}</div>
                      <div class="d-flex align-center justify-center mt-1">
                        <v-icon size="x-small" color="blue" class="mr-1">mdi-pencil</v-icon>
                        <v-text-field v-model.number="g.setTotalPieces" type="number" placeholder="Set QTY" density="compact" hide-details="auto" variant="outlined" single-line class="setprice-input-vuetify"></v-text-field>
                      </div>
                    </td>
                    <td class="text-left price-cell col-price" :class="{ 'text-error': g.isManualPrice }">
                      <div class="text-center">{{ g.price_display }}</div>
                      <div class="d-flex align-center mt-1">
                        <v-icon size="x-small" color="blue" class="mr-1">mdi-pencil</v-icon>
                        <v-text-field v-model="g.setPrice" type="number" placeholder="Set Price" density="compact" hide-details="auto" variant="outlined" single-line class="setprice-input-vuetify"></v-text-field>
                      </div>
                    </td>
                    <td class="text-left text-high-emphasis col-mid">{{ formatInt(g.qtyPer100) }}</td>
                    <td class="text-left text-high-emphasis col-subtotal">{{ formatMoney(gridSubtotalRow(g)) }}</td>
                    <td v-if="auth.canViewMargin" class="text-center text-high-emphasis col-margin">{{ getGridMargin(g) }}</td>
                    <td class="text-center col-image">
                      <img :src="g.imageUrl" alt="" class="grid-thumb clickable-image" @click="showImageModal(g.imageUrl, g.code, g.name, g.pcsPerBox)" />
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
            <v-table density="compact" class="grids-table-optional">
              <thead>
                <tr>
                  <th class="text-left text-medium-emphasis col-code" style="width: 220px !important;">Code</th>
                  <th class="text-left text-medium-emphasis col-name" style="width: 290px !important;">Name</th>
                  <th class="text-left text-medium-emphasis col-qty">System QTY</th>
                  <th class="text-left text-medium-emphasis">pcs/box</th>
                  <th class="text-left text-medium-emphasis">Total Pieces</th>
                  <th class="text-left text-medium-emphasis">Price/unit</th>
                  <th class="text-left text-medium-emphasis">QTY/100m²</th>
                  <th class="text-left text-medium-emphasis">Subtotal</th>
                  <th v-if="auth.canViewMargin" class="text-left text-medium-emphasis">Margin%</th>
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
                    <td class="text-left text-high-emphasis col-name">{{ g.name }}</td>
                    <td class="text-left text-high-emphasis col-qty">{{ getEffectiveGridQtyAccrivia(g) }}</td>
                    <td class="text-left text-high-emphasis col-pcs">{{ g.pcsPerBox }}</td>
                    <td class="text-left col-total">
                      <div class="text-center">{{ g.totalPieces }}</div>
                      <div class="d-flex align-center justify-center mt-1">
                        <v-icon size="x-small" color="blue" class="mr-1">mdi-pencil</v-icon>
                        <v-text-field v-model.number="g.setTotalPieces" type="number" placeholder="Set QTY" density="compact" hide-details="auto" variant="outlined" single-line class="setprice-input-vuetify"></v-text-field>
                      </div>
                    </td>
                    <td class="text-left price-cell col-price" :class="{ 'text-error': g.isManualPrice }">
                      <div class="text-center">{{ g.price_display }}</div>
                      <div class="d-flex align-center mt-1">
                        <v-icon size="x-small" color="blue" class="mr-1">mdi-pencil</v-icon>
                        <v-text-field v-model="g.setPrice" type="number" placeholder="Set Price" density="compact" hide-details="auto" variant="outlined" single-line class="setprice-input-vuetify"></v-text-field>
                      </div>
                    </td>
                    <td class="text-left text-high-emphasis col-mid">{{ g.qtyPer100 }}</td>
                    <td class="text-left text-high-emphasis col-subtotal">{{ formatMoney(gridSubtotalRow(g)) }}</td>
                    <td v-if="auth.canViewMargin" class="text-center text-high-emphasis col-margin">{{ getGridMargin(g) }}</td>
                    <td class="text-center col-image">
                      <img :src="g.imageUrl" alt="" class="grid-thumb clickable-image" @click="showImageModal(g.imageUrl, g.code, g.name, g.pcsPerBox)" />
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
              <v-col cols="12" sm="3" class="pa-2">
                <v-card class="pa-4 rounded-lg text-center" color="#F8FAFC" flat>
                  <div class="text-subtitle-2 text-medium-emphasis mb-1">Tiles Subtotal</div>
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
                <v-card class="pa-4 rounded-lg text-center" color="#E8F5E9" flat>
                  <div class="text-subtitle-2 text-high-emphasis mb-1">Total (Excl. GST)</div>
                  <div class="text-h5 text-high-emphasis text-secondary">{{ formatMoney(totalExGst) }}</div>
                  <div class="text-caption text-high-emphasis">({{ '$' + totalRate + ' per m²' }})</div>
                </v-card>
              </v-col>
            </v-row>
            <v-alert type="warning" variant="tonal" class="mt-4" density="compact">
              Calculation based on 10x10m innovated space
            </v-alert>
          </v-card>
          <v-card class="mb-6 pa-4" color="surface" elevation="2">
            <v-card-title class="text-h6 text-high-emphasis pb-4">Specification Table</v-card-title>
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
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useSheet } from '@/useSheet.js'
import { useAuthStore } from '@/stores/auth.js';

const auth = useAuthStore();
const copiedCode = ref(null);

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    copiedCode.value = text;
    setTimeout(() => {
      copiedCode.value = null;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy: ', err);
  }
}

const area = ref('');
const range = ref('');
const edge = ref('');
const size = ref('');
const grid = ref('');
const priceLevel = ref('');
const seismic = ref('');

const {
  loading,
  error,
  tileRanges, edgeOptions, sizeOptions, gridOptions,
  priceLevels, seismicOptions,
  tilesResult, gridsResult,
  totalPrice,
  calculate,
  refreshForm,
  updateWallAngleSelection,
} = useSheet({ area, range, edge, size, grid, priceLevel, seismic });

watch([area, range, edge, size, grid, priceLevel, seismic], () => {
  const canCalcTiles = area.value && priceLevel.value && seismic.value && range.value && edge.value && size.value;
  const canCalcGrids = area.value && priceLevel.value && seismic.value && grid.value && size.value;
  if (canCalcTiles || canCalcGrids) calculate();
  if (!canCalcTiles) tilesResult.value = [];
  if (!canCalcGrids) {
    gridsResult.value = [];
    totalPrice.value = '0.00';
  }
}, { deep: true });

watch(gridsResult, () => {
  const ready = area.value && size.value && grid.value && priceLevel.value && seismic.value;
  if (ready) {
    // Computed properties will handle updates
  }
}, { deep: true });

const isImageModalVisible = ref(false);
const currentZoomedImageUrl = ref('');
const zoomedImageCode = ref('');
const zoomedImageName = ref('');

function showImageModal(imageUrl, code, name, pcsPerBox) {
  currentZoomedImageUrl.value = imageUrl;
  zoomedImageCode.value = code;
  zoomedImageName.value = `${name} (${pcsPerBox}pcs/box)`;
  isImageModalVisible.value = true;
}

function hideImageModal() {
  isImageModalVisible.value = false;
  currentZoomedImageUrl.value = '';
  zoomedImageCode.value = '';
  zoomedImageName.value = '';
}

function getEffectiveGridQtyAccrivia(g) {
  const setQty = Number(g.setTotalPieces);
  const effectiveTotalPieces = (setQty && setQty > 0) ? setQty : g.totalPieces;
  if (effectiveTotalPieces <= 0) return 0;
  const packOnAccrivia = Number(g.packOnAccrivia || 0);
  const packActual = Number(g.pcsPerBox || 0);
  if (packOnAccrivia > 0 && packActual > 0) {
    if (packOnAccrivia === packActual) {
      return Math.ceil(effectiveTotalPieces / packOnAccrivia);
    } else {
      return Math.ceil(effectiveTotalPieces / packActual) * packActual;
    }
  }
  return g.qtyAccrivia;
}

function gridSubtotalRow(g) {
  const effectiveQtyAccrivia = getEffectiveGridQtyAccrivia(g);
  const effectivePrice = (g.setPrice > 0 ? g.setPrice : g.price);
  const packOnAccrivia = Number(g.packOnAccrivia || 0);
  const perUnit = Number(g.perUnit || 1);
  return effectivePrice * effectiveQtyAccrivia * packOnAccrivia * perUnit;
}

function getEffectiveQtyAccrivia(t) {
  const setQty = Number(t.setTotalPieces);
  const effectiveTotalPieces = (setQty && setQty > 0) ? setQty : t.totalPieces;
  if (effectiveTotalPieces <= 0) return 0;
  const M_pcsBox = Number(t.pcsPerBox || 0);
  const N_pcsAccrivia = Number(t.pcsAccrivia || 0);
  if (M_pcsBox <= 0) return 0;
  if (N_pcsAccrivia === 0 || N_pcsAccrivia === M_pcsBox) {
    return Math.ceil(effectiveTotalPieces / M_pcsBox);
  }
  if (N_pcsAccrivia > 0 && N_pcsAccrivia !== M_pcsBox) {
    const Y = Math.ceil(effectiveTotalPieces / M_pcsBox);
    return Y * M_pcsBox;
  }
  return 0;
}

function tileSubtotalRow(t) {
  const effectiveTotalPieces = (t.setTotalPieces && Number(t.setTotalPieces) > 0) ? Number(t.setTotalPieces) : t.totalPieces;
  return typeof t.subtotal === 'number' ? t.subtotal : (effectiveTotalPieces * (t.setPrice > 0 ? t.setPrice : t.pricePerM2) * t.m2pertile);
}

const tileSubtotal = computed(() => tilesResult.value.reduce((sum, t) => sum + tileSubtotalRow(t), 0));
const essentialGridsSubtotal = computed(() => gridsResult.value.filter(g => g.required === 'Y').reduce((sum, g) => sum + gridSubtotalRow(g), 0));
const optionalAccessoriesSubtotal = computed(() => gridsResult.value.filter(g => g.required !== 'Y' && g.isSelected).reduce((sum, g) => sum + gridSubtotalRow(g), 0));

const m2 = computed(() => Number(area.value) || 1);
const tileRate = computed(() => (tileSubtotal.value / m2.value).toFixed(2));
const essentialRate = computed(() => (essentialGridsSubtotal.value / m2.value).toFixed(2));
const optionalRate = computed(() => (optionalAccessoriesSubtotal.value / m2.value).toFixed(2));
const totalExGst = computed(() => tileSubtotal.value + essentialGridsSubtotal.value + optionalAccessoriesSubtotal.value);
const totalRate = computed(() => (totalExGst.value / m2.value).toFixed(2));

function getTileMargin(t) {
  const cost = Number(t.costPerM2);
  const base = t.setPrice > 0 ? t.setPrice : t.pricePerM2;
  if (!base || !cost) return '';
  return (((base - cost) / base) * 100).toFixed(2) + '%';
}

function getGridMargin(g) {
  const cost = Number(g.costPerUnit);
  const base = g.setPrice > 0 ? g.setPrice : g.price;
  if (!base || !cost) return '';
  return (((base - cost) / base) * 100).toFixed(2) + '%';
}

function formatMoney(val) {
  if (val === undefined || val === null || val === '') return '';
  const numberValue = Number(val);
  if (isNaN(numberValue)) return '';
  return '$' + numberValue.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatInt(val) {
  if (val === undefined || val === null || val === '') return '';
  return Math.round(Number(val));
}

const specText = computed(() => {
  if (!tilesResult.value.length && !grid.value) return '';
  const tile = tilesResult.value[0] || {};
  const areaNum = Number(area.value) || 1;
  const indicativeBudget = (totalExGst.value / areaNum).toFixed(2);
  const onlyGrids = grid.value && !tilesResult.value.length;
  const lines = [`Supplier: Armstrong Ceiling Solutions`];
  if (!onlyGrids && tilesResult.value.length) {
    const tileLine = tile.name || [range.value, edge.value, size.value].filter(Boolean).join(' ');
    lines.push(`Tiles: ${tileLine}`);
  }
  if (grid.value) {
    lines.push(`Grid System: ${grid.value}`);
  }
  if (!onlyGrids) {
    lines.push(`Acoustic: NRC: ${tile.nrc ?? 'N/A'}  CAC: ${tile.cac ?? 'N/A'}`, `Lead Time: ${tile.leadTime || 'Usually In stock'}`);
  }
  lines.push(`Indicative Budget: $${indicativeBudget} per m²`, `Data Sheet Link: ${tile.datasheet ? `<a href="${tile.datasheet}" target="_blank">${tile.datasheet}</a>` : 'N/A'}`);
  return lines.join('<br>');
});

function saveProject() {
  console.log('Save Project clicked');
}
</script>

<style scoped>
/* All the scoped styles from before */
.app-layout {
  display: flex;
  min-height: 100vh;
  align-items: flex-start;
  padding: 16px;
  max-width: 1600px;
  margin: 0 auto;
  gap: 16px;
}
.sticky-menu {
  position: -webkit-sticky;
  position: sticky;
  top: 16px;
  align-self: flex-start;
}
.left-menu-card {
  min-height: 95vh;
}
:deep(.v-overlay__content .v-list) {
  background-color: rgb(var(--v-theme-dropdown-list-bg)) !important;
}
:deep(.v-overlay__content .v-list-item-title) {
  color: rgb(var(--v-theme-on-dropdown-list-bg)) !important;
}
.v-table.tiles-table,
.v-table.grids-table-essential,
.v-table.grids-table-optional {
  border: none !important;
  background-color: var(--v-theme-surface);
  table-layout: fixed;
}
.v-table th {
  color: rgb(var(--v-theme-on-surface)) !important;
  font-weight: 600 !important;
  padding: 8px 12px !important;
  border-bottom: 1px solid rgb(var(--v-theme-table-border)) !important;
}
.v-table tbody tr {
  box-shadow: none !important;
  border-bottom: 1px solid rgb(var(--v-theme-table-border)) !important;
}
.v-table tbody tr:last-child {
  border-bottom: none !important;
}
.v-table tbody td {
  padding: 8px 12px !important;
  vertical-align: top !important;
}
.v-table tbody tr:nth-of-type(odd) {
  background-color: #F8FAFC;
}
.v-table tbody tr:hover {
  background-color: #F8FAFC;
}
.code-text {
  white-space: normal !important;
  word-break: break-all !important;
}
.v-table td.col-code {
  position: relative;
  padding-right: 36px !important;
}
.image-modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000;
}
.image-modal-content {
  position: relative; background-color: #333; padding: 20px;
  border-radius: 8px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  max-width: 90vw; max-height: 90vh;
  display: flex; flex-direction: column; align-items: center; gap: 10px;
}
.zoomed-image {
  max-width: 100%; max-height: 70vh; object-fit: contain;
}
.close-modal-btn {
  position: absolute; top: 10px; right: 10px; background: none; border: none;
  font-size: 1.5em; color: white; cursor: pointer; padding: 5px; line-height: 1;
}
.grid-thumb {
  width: 40px; height: auto; object-fit: contain; border-radius: 4px;
  cursor: zoom-in;
}
.setprice-input-vuetify {
  width: 53px;
  max-width: 53px;
}
.setprice-input-vuetify :deep(input[type='number']) {
  -moz-appearance: textfield;
}
.setprice-input-vuetify :deep(input[type='number']::-webkit-outer-spin-button),
.setprice-input-vuetify :deep(input[type='number']::-webkit-inner-spin-button) {
  -webkit-appearance: none;
  margin: 0;
}
.setprice-input-vuetify :deep(.v-field__input) {
  padding: 2px 4px !important;
  min-height: unset !important;
  font-size: 10.5px !important;
}
.setprice-input-vuetify :deep(input::placeholder) {
  color: #9E9E9E !important;
  font-style: italic;
  opacity: 1;
}
.image-info-container {
  text-align: center;
  color: #FFFFFF; /* 强制颜色为纯白色 */
}

.image-code-display,
.image-name-display {
  color: #FFFFFF !important; /* 再次用更高优先级确保文字是纯白色 */
}
/* 表头样式 */
.v-table.tiles-table thead,
.v-table.grids-table-essential thead,
.v-table.grids-table-optional thead {
  /* 👇 您可以在这里修改背景色 */
  background-color: #E4EAF2 !important; 
}


</style>

<style>
.selection-text-color {
  color: rgb(var(--v-theme-on-surface)) !important;
}
</style>