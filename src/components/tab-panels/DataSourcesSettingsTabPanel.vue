<template>
	<q-list>
		<q-item>
			<q-item-section class="col-2 text-subtitle1">Имя источника данных</q-item-section>
			<q-item-section class="col-2 text-subtitle1">Тип источника данных</q-item-section>
			<q-item-section class="col-auto text-subtitle1">Настройка источника данных</q-item-section>
		</q-item>
		<q-item v-for="dataSource in dataSources" :key="dataSource.id">
			<q-item-section class="col-2">{{ dataSource.name }}</q-item-section>
			<q-item-section class="col-2">{{ dataSource.TypeOfDataSource.name }}</q-item-section>
			<q-item-section class="col-auto">
				<div v-if="dataSource.TypeOfDataSource.name === 'XLS' || dataSource.TypeOfDataSource.name === 'CSV'" class="row q-gutter-x-md">
					<q-input v-model="dataSource.config.pathToFile" readonly type="text" label="Путь к файлу" outlined />
					<q-input v-model="dataSource.config.pollingFrequency" readonly type="text" label="Частота опроса файла" outlined />
				</div>
				<div v-else-if="dataSource.TypeOfDataSource.name === 'API Endpoint'">
					<q-input v-model="dataSource.config.token" readonly type="text" label="Токен" outlined />
				</div>
				<div v-else-if="dataSource.TypeOfDataSource.name === 'TCP (Данные)'" class="row q-gutter-x-md">
					<q-input v-model="dataSource.config.port" readonly type="text" label="Порт" outlined />
					<q-input v-model="dataSource.config.mask" readonly type="text" label="Маска" outlined />
				</div>
				<div v-else-if="dataSource.TypeOfDataSource.name === 'TCP (Сквозной)'">
					<q-input v-model="dataSource.config.port" readonly type="text" label="Порт" outlined />
				</div>
			</q-item-section>
		</q-item>
	</q-list>
	<div class="row q-mt-md q-gutter-x-md justify-end">
		<div class="col-auto"><q-btn type="submit" dense unelevated color="primary" label="добавить" @click="addNewDataSourceForm = true" /></div>
		<div class="col-auto"><q-btn type="submit" dense unelevated color="primary" label="выйти" to="/" /></div>
	</div>

	<q-dialog v-model="addNewDataSourceForm" persistent>
		<q-card>
			<q-card-section>
				<div class="text-h6 text-center">Добавить новый источник данных</div>
			</q-card-section>
			<q-card-section>
				<q-form class="col q-gutter-y-md" @submit.prevent>
					<q-input outlined v-model="dataSourceModel.name" label="Название источника данных" />
					<q-select outlined v-model="dataSourceModel.type" :options="typesOfDataSources" @update:model-value="createDataSourceModel" label="Тип источника данных" />
					<div class="q-gutter-y-md" v-if="dataSourceModel.type === 'XLS' || dataSourceModel.type === 'CSV'">
						<q-file v-if="dataSourceModel.type === 'XLS'" v-model="newDataSourceFilePicker" @update:model-value="dataSourceModel.config.pathToFile = newDataSourceFilePicker.path" clearable outlined label="Выбрать XLS файл" accept=".xls,.xlsx">
							<template #prepend><q-icon name="attach_file" /></template>
						</q-file>
						<q-file v-else-if="dataSourceModel.type === 'CSV'" v-model="newDataSourceFilePicker" @update:model-value="dataSourceModel.config.pathToFile = newDataSourceFilePicker.path" clearable outlined label="Выбрать CSV файл" accept=".csv">
							<template #prepend><q-icon name="attach_file" /></template>
						</q-file>
						<q-input v-model="dataSourceModel.config.pathToFile" readonly type="text" label="Путь к файлу" outlined />
						<q-input v-model="dataSourceModel.config.pollingFrequency" type="number" label="Частота опроса файла" outlined />
					</div>
					<div class="q-gutter-y-md" v-else-if="dataSourceModel.type === 'API Endpoint'">
						<q-input outlined v-model="dataSourceModel.config.token" readonly label="Токен" />
						<q-btn label="сгенерировать" color="primary" dense unelevated />
					</div>
					<div class="q-gutter-y-md" v-else-if="dataSourceModel.type === 'TCP (Данные)'">
						<q-input outlined v-model="dataSourceModel.config.port" mask="#####" label="Порт" />
						<q-input outlined v-model="dataSourceModel.config.mask" label="Маска" />
					</div>
					<div class="q-gutter-y-md" v-else-if="dataSourceModel.type === 'TCP (Сквозной)'">
						<q-input outlined v-model="dataSourceModel.config.port" mask="#####" label="Порт" />
					</div>
					<div class="row q-gutter-x-md justify-end">
						<div class="col-auto"><q-btn label="сохранить" type="submit" color="primary" dense unelevated @click="saveNewDataSource" /></div>
						<div class="col-auto"><q-btn label="отмена" type="reset" color="primary" dense unelevated @click="cancel" /></div>
					</div>
				</q-form>
			</q-card-section>
		</q-card>
	</q-dialog>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

let dataSources = ref()
let typesOfDataSources = ref()

let dataSourceModel = ref({ name: '', type: '', config: { } })

let addNewDataSourceForm = ref(false)

let newDataSourceFilePicker = ref({})

onMounted(async () => {
	dataSources.value = await window.api.invoke('get-data-sources')
	typesOfDataSources.value = await window.api.invoke('get-types-of-data-sources')
})

function createDataSourceModel() {
	switch (dataSourceModel.value.type) {
		case 'CSV':
		case 'XLS':
			dataSourceModel.value.config = { pathToFile: '', pollingFrequency: '' }
			break
		case 'API Endpoint':
			dataSourceModel.value.config = { token: '' }
			break
		case 'TCP (Данные)':
			dataSourceModel.value.config = { port: '', mask: '' }
			break
		case 'TCP (Сквозной)':
			dataSourceModel.value.config = { port: '' }
			break
	}
}

async function saveNewDataSource() {
	if (dataSourceModel.value.name !== '' && dataSourceModel.value.type !== '' && dataSourceModel.value.config !== null) {
		let config = { }
		switch (dataSourceModel.value.type) {
			case 'CSV':
			case 'XLS':
				config = { pathToFile: dataSourceModel.value.config.pathToFile, pollingFrequency: dataSourceModel.value.config.pollingFrequency }
				break
			case 'API Endpoint':
				config = { token: dataSourceModel.value.config.token }
				break
			case 'TCP (Данные)':
				config = { port: dataSourceModel.value.config.port, mask: dataSourceModel.value.config.mask }
				break
			case 'TCP (Сквозной)':
				config = { port: dataSourceModel.value.config.port }
				break
		}
		let result = await window.api.invoke('save-new-data-source', { name: dataSourceModel.value.name, type: dataSourceModel.value.type, config: config })
		if (result) {
			addNewDataSourceForm.value = false
			dataSources.value = await window.api.invoke('get-data-sources')
		  dataSourceModel.value = { name: '', type: '', config: { } }
		  newDataSourceFilePicker.value = { }
			$q.notify({ message: 'Новый источник данных сохранён!', type: 'positive' })
		} else {
			$q.notify({ message: 'Такой источник данных уже существует!', type: 'negative' })
		}
	} else {
		$q.notify({ message: 'Не все поля указаны!', type: 'negative' })
	}
}

function cancel() {
	addNewDataSourceForm.value = false
	dataSourceModel.value = { name: '', type: '', config: { } }
	newDataSourceFilePicker.value = { }
}
</script>