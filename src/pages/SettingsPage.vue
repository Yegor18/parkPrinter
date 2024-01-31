<template>
  <q-page class="flex flex-center">
    <div class="q-gutter-y-md">
      <div class="row q-gutter-x-md" v-for="setting in settings" :key="setting.id" :setting="setting">
        <div class="col text-subtitle2">{{ setting.name }}</div>
        <div class="col"><q-input v-model="setting.value" type="text" /></div>
      </div>
      <div class="row justify-between">
        <div class="col-4"><q-btn type="submit" unelevated color="primary" label="сохранить"
            @click="saveSettings"></q-btn></div>
        <div class="col-4"><q-btn type="submit" unelevated color="primary" label="выйти" to="/"></q-btn></div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'

let settings = ref()

onMounted(async () => {
  settings.value = await window.api.getSettings()
})

async function saveSettings() {
  let newSettings = []
  for (let i = 0; i < settings.value.length; i++) {
    newSettings.push({ id: settings.value[i].id, name: settings.value[i].name, value: settings.value[i].value })
  }
  await window.api.saveSettings(newSettings)
}
</script>