<template>
  <q-layout view="lHh Lpr lff">
    <q-header bordered class="bg-primary">
      <q-toolbar>
        <q-toolbar-title class="text-center">Редактор</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { ref } from 'vue'

export default {
	setup() {
		return {}
	}
}
</script>