<template>
  <div class="container">
    <h1>Ceiling Calculator</h1>

    <div class="form">
      <label>
        Area (m²):
        <input type="number" v-model.number="m2" />
      </label>

      <label>
        Tile Range:
        <select v-model="tileRange">
          <option disabled value="">Select range</option>
          <option v-for="item in tileRanges" :key="item">{{ item }}</option>
        </select>
      </label>

      <label>
        Tile Size:
        <select v-model="tileSize">
          <option disabled value="">Select size</option>
          <option v-for="item in tileSizes" :key="item">{{ item }}</option>
        </select>
      </label>

      <label>
        Tile Color:
        <select v-model="tileColor">
          <option disabled value="">Select color</option>
          <option v-for="item in tileColors" :key="item">{{ item }}</option>
        </select>
      </label>

      <label>
        Grid System:
        <select v-model="gridSystem">
          <option disabled value="">Select system</option>
          <option v-for="item in gridSystems" :key="item">{{ item }}</option>
        </select>
      </label>

      <label>
        Price Level:
        <select v-model="priceLevel">
          <option disabled value="">Select level</option>
          <option v-for="item in priceLevels" :key="item">{{ item }}</option>
        </select>
      </label>

      <label>
        Seismic Required:
        <select v-model="seismic">
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>
      </label>

      <button @click="calculate">Calculate</button>
    </div>

    <div class="result" v-if="result">
      <h2>Results:</h2>

      <h3>Tile</h3>
      <p><strong>Code:</strong> {{ result.tile.code }}</p>
      <p><strong>Description:</strong> {{ result.tile.description }}</p>
      <p><strong>Quantity:</strong> {{ result.tile.qty }}</p>
      <p><strong>Price:</strong> ${{ result.tile.price }}</p>

      <h3>Grid</h3>
      <p><strong>Code:</strong> {{ result.grid.code }}</p>
      <p><strong>Description:</strong> {{ result.grid.description }}</p>
      <p><strong>Quantity:</strong> {{ result.grid.qty }}</p>
      <p><strong>Price:</strong> ${{ result.grid.price }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const m2 = ref(0)
const tileRange = ref('')
const tileSize = ref('')
const tileColor = ref('')
const gridSystem = ref('')
const priceLevel = ref('')
const seismic = ref('no')

const tileRanges = ['Perla', 'Ultima', 'Dune']
const tileSizes = ['600x600', '1200x600']
const tileColors = ['White', 'Black', 'Grey']
const gridSystems = ['24mm Exposed', '15mm Silhouette']
const priceLevels = ['Standard', 'Premium']

const result = ref(null)

function calculate() {
  const tilePrice = priceLevel.value === 'Premium' ? 25 : 15
  const gridPrice = seismic.value === 'yes' ? 10 : 7

  result.value = {
    tile: {
      code: 'TL-' + tileRange.value.slice(0, 2).toUpperCase(),
      description: `${tileRange.value} ${tileSize.value} ${tileColor.value}`,
      qty: Math.ceil(m2.value),
      price: (Math.ceil(m2.value) * tilePrice).toFixed(2),
    },
    grid: {
      code: 'GD-' + gridSystem.value.slice(0, 2).toUpperCase(),
      description: `${gridSystem.value} ${seismic.value === 'yes' ? '(Seismic)' : ''}`,
      qty: Math.ceil(m2.value * 0.8),
      price: (Math.ceil(m2.value * 0.8) * gridPrice).toFixed(2),
    },
  }
}
</script>

<style>
body {
  font-family: Arial, sans-serif;
}
.container {
  max-width: 600px;
  margin: auto;
  padding: 2rem;
}
.form label {
  display: block;
  margin: 1rem 0;
}
input, select {
  width: 100%;
  padding: 0.5rem;
}
button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
}
.result {
  margin-top: 2rem;
  background: #f8f8f8;
  padding: 1rem;
  border-radius: 8px;
}
</style>
