<template>
  <q-layout view="lHh Lpr lff">
    <q-header bordered class="bg-primary">
      <q-toolbar>
        <q-toolbar-title class="text-center">Редактор</q-toolbar-title>
        <q-btn flat round dense icon="settings" to="/settings" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { onMounted } from 'vue'

const $q = useQuasar()

onMounted(async () => {
  let message = await window.api.invoke('get-failed-connections-to-printers', 'atStart')
  if (message !== '') {
    $q.notify({ message: message, type: 'warning', timeout: 0, actions: [ { label: 'принято', color: 'dark' } ] })
  }
  getConnections()
})

async function getConnections() {
  setInterval(async () => {
    let message = await window.api.invoke('get-failed-connections-to-printers', 'byTimer')
    if (message !== '') {
      $q.notify({ message: message, type: 'warning', timeout: 0, actions: [ { label: 'принято', color: 'dark' } ] })
    }
  }, 2000)
}
</script>