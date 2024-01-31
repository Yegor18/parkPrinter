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
</script>