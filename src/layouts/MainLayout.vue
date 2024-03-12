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

onMounted(() => {
	window.api.on('failed-connections', (event, message) => {
		$q.notify({ message: message, type: 'warning', timeout: 0, group: false, actions: [{ label: 'принято', color: 'dark' }] })
	})
	window.api.on('data-is-not-valid-for-tcp-data-data-source', (event, message) => {
		$q.notify({ message: message, type: 'warning', timeout: 0, group: false, actions: [{ label: 'принято', color: 'dark' }] })
	})
})
</script>