<template>
	<div class="q-gutter-md">
		<div class="row q-gutter-md items-center" v-for="setting in settings" :key="setting.id">
			<div class="col-auto text-uppercase text-body2">{{ setting.name }}</div>
			<div class="col-auto"><q-input v-model="setting.value" type="text" /></div>
		</div>
		<div class="row q-gutter-md justify-end">
			<div class="col-auto"><q-btn type="submit" dense unelevated color="primary" label="сохранить" @click="saveSettings" /></div>
			<div class="col-auto"><q-btn type="submit" dense unelevated color="primary" label="выйти" to="/" /></div>
		</div>
	</div>
</template>

<script setup>
import { onMounted, ref } from 'vue'

let settings = ref()

onMounted(async () => {
	settings.value = await window.api.invoke('get-settings')
})

async function saveSettings() {
	let newSettings = []
	for (let i = 0; i < settings.value.length; i++) {
		newSettings.push({ id: settings.value[i].id, name: settings.value[i].name, value: settings.value[i].value })
	}
	await window.api.invoke('save-settings', newSettings)
}
</script>