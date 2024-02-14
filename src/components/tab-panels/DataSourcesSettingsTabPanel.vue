<template>
	<q-list separator>
		<q-item>
			<q-item-section>Имя</q-item-section>
			<q-item-section>Тип</q-item-section>
			<q-item-section>Настройка</q-item-section>
		</q-item>
		<q-item v-for="dataSource in dataSources" :key="dataSource.id">
			<q-item-section>{{ dataSource.name }}</q-item-section>
			<q-item-section>{{ dataSource.type }}</q-item-section>
			<q-item-section>
				<q-file v-if="dataSource.type === 'XLS'" v-model="dataSource.config" clearable label="XLS файл"
					accept=".xls,.xlsx" />
				<q-file v-else-if="dataSource.type === 'CSV'" v-model="dataSource.config" clearable label="CSV файл"
					accept=".csv" />
				<q-input v-else-if="dataSource.type === 'TCP'" v-model="dataSource.config" type="text" label="Порт" />
			</q-item-section>
		</q-item>
	</q-list>
</template>

<script setup>
import { onMounted, ref } from 'vue'

let dataSources = ref()

onMounted(async () => {
	dataSources.value = await window.api.invoke('get-data-sources')
})
</script>