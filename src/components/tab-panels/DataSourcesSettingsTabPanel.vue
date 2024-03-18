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
					<q-input v-model="dataSource.config.pollingFrequency" readonly type="text" label="Частота опроса файла (мсек)" outlined />
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
					<q-input outlined v-model="dataSourceModel.name" :rules="rulesForValidations.dataSourceName" label="Название источника данных" />
					<q-select outlined v-model="dataSourceModel.type" :rules="rulesForValidations.dataSourceType" :options="typesOfDataSources" @update:model-value="createDataSourceModel" label="Тип источника данных" />
					<div class="q-gutter-y-md" v-if="dataSourceModel.type === 'XLS' || dataSourceModel.type === 'CSV'">
						<q-file v-if="dataSourceModel.type === 'XLS'" v-model="newDataSourceFilePicker" @update:model-value="writePathToConfig" clearable outlined label="Выбрать XLS файл" accept=".xls,.xlsx">
							<template #prepend><q-icon name="attach_file" /></template>
						</q-file>
						<q-file v-else-if="dataSourceModel.type === 'CSV'" v-model="newDataSourceFilePicker" @update:model-value="writePathToConfig" clearable outlined label="Выбрать CSV файл" accept=".csv">
							<template #prepend><q-icon name="attach_file" /></template>
						</q-file>
						<q-input v-model="dataSourceModel.config.pathToFile" :rules="rulesForValidations.dataSourcePathToFile" readonly type="text" label="Путь к файлу" outlined />
						<q-input v-model="dataSourceModel.config.pollingFrequency" type="number" :rules="rulesForValidations.dataSourcePollingFrequency" label="Частота опроса файла (мсек)" outlined />
					</div>
					<div class="q-gutter-y-md" v-else-if="dataSourceModel.type === 'API Endpoint'">
						<q-input outlined v-model="dataSourceModel.config.token" readonly label="Токен" />
						<q-btn label="сгенерировать" color="primary" dense unelevated />
					</div>
					<div class="q-gutter-y-md" v-else-if="dataSourceModel.type === 'TCP (Данные)'">
						<q-input outlined v-model="dataSourceModel.config.port" mask="#####" hint="Значение от 5000 до 40000" :rules="rulesForValidations.dataSourcePort" label="Порт" />
						<div class="q-gutter-y-md">
							<q-input outlined v-model="dataSourceModel.config.mask" :rules="rulesForValidations.dataSourceMask" readonly label="Маска" />
							<q-select outlined v-model="separator1" :options="availableSeparators" @update:model-value="changeAvailableSeparators(separator1)" label="Выбрать разделитель 1" />
							<q-select outlined v-model="separator2" :options="availableSeparators" @update:model-value="changeAvailableSeparators(separator2)" label="Выбрать разделитель 2" />
						</div>
					</div>
					<div class="q-gutter-y-md" v-else-if="dataSourceModel.type === 'TCP (Сквозной)'">
						<q-input outlined v-model="dataSourceModel.config.port" mask="#####" hint="Значение от 5000 до 40000" :rules="rulesForValidations.dataSourcePort" label="Порт" />
					</div>
					<div class="row q-gutter-x-md justify-end">
						<div class="col-auto"><q-btn label="сохранить" type="submit" color="primary" dense unelevated @click="saveNewDataSource" /></div>
						<div class="col-auto"><q-btn label="отмена" type="reset" color="primary" dense unelevated @click="cancel" /></div>
						<div class="col-auto" v-if="dataSourceModel.type === 'TCP (Сквозной)' || dataSourceModel.type === 'TCP (Данные)'"><q-btn label="проверить порт" color="primary" dense unelevated @click="testPort(dataSourceModel.config.port)" /></div>
						<div class="col-auto" v-else><q-btn label="проверить файл" color="primary" dense unelevated @click="checkFile(dataSourceModel.config.pathToFile)" /></div>
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

let dataSourceModel = ref({ name: '', type: '', config: {} })

let addNewDataSourceForm = ref(false)

let newDataSourceFilePicker = ref({})

let separator1 = ref('[разделитель1]')
let separator2 = ref('[разделитель2]')
const separators = [':', ';', '-', '=', ',', '_']
let availableSeparators = ref(separators)

const rulesForValidations = ref({
	dataSourceName: [value => !!value || 'Введите название!'],
	dataSourceType: [value => !!value || 'Выберите тип!'],
	dataSourcePathToFile: [value => (!!value || value !== '') || 'Выберите файл!'],
	dataSourcePollingFrequency: [value => !!value || 'Введите значение!', value => value >= 0 || 'Значение не может быть меньше 0!'],
	dataSourceMask: [value => !value.includes('разделитель') || 'Заполните маску!'],
	dataSourcePort: [value => !!value || 'Введите значение!', value => (value >= 5000 && value <= 40000) || 'Неверное значение порта!']
})

onMounted(async () => {
	dataSources.value = await window.api.invoke('get-data-sources')
	typesOfDataSources.value = await window.api.invoke('get-types-of-data-sources')
})

async function testPort(serverPort) {
	if (serverPort !== '' && serverPort >= 5000 && serverPort <= 40000) {
		let result = await window.api.invoke('test-port', serverPort)
		if (result) {
			$q.notify({ message: 'Порт свободен!', type: 'positive' })
		}
	}
}

async function checkFile(pathToFile) {
	let result = await window.api.invoke('check-file', pathToFile)
	if (result) {
		$q.notify({ message: 'Файл существует!', type: 'positive' })
	} else {
		$q.notify({ message: 'Файл не существует!', type: 'negative' })
	}
}

function createMask() {
	dataSourceModel.value.config.mask = '[name]' + separator1.value + '[value]' + separator2.value
}

function changeAvailableSeparators(usedSeparator) {
	createMask()
	availableSeparators.value = separators.filter((separator) => separator !== usedSeparator)
	if (!dataSourceModel.value.config.mask.includes('разделитель')) {
		availableSeparators.value = separators.filter((separator) => separator !== usedSeparator && separator !== separator1.value && separator !== separator2.value)
	}
}

function writePathToConfig() {
	try {
		let path = newDataSourceFilePicker.value.path
		dataSourceModel.value.config.pathToFile = path
	} catch (error) {
		dataSourceModel.value.config.pathToFile = ''
	}
}

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
			availableSeparators.value = separators
			createMask()
			break
		case 'TCP (Сквозной)':
			dataSourceModel.value.config = { port: '' }
			break
	}
}

async function saveNewDataSource() {
	if (dataSourceModel.value.name !== '' && dataSourceModel.value.type !== '') {
		let config = {}
		switch (dataSourceModel.value.type) {
			case 'CSV':
			case 'XLS':
				if (dataSourceModel.value.config.pathToFile === '' || dataSourceModel.value.config.pollingFrequency === '') return
				config = { pathToFile: dataSourceModel.value.config.pathToFile, pollingFrequency: dataSourceModel.value.config.pollingFrequency }
				break
			case 'API Endpoint':
				config = { token: dataSourceModel.value.config.token }
				break
			case 'TCP (Данные)':
				if (dataSourceModel.value.config.port === '' || dataSourceModel.value.config.mask.includes('разделитель')) return
				config = { port: dataSourceModel.value.config.port, mask: dataSourceModel.value.config.mask }
				break
			case 'TCP (Сквозной)':
				if (dataSourceModel.value.config.port === '') return
				config = { port: dataSourceModel.value.config.port }
				break
		}
		let result = await window.api.invoke('save-new-data-source', { name: dataSourceModel.value.name, type: dataSourceModel.value.type, config: config })
		if (result === 'ok') {
			addNewDataSourceForm.value = false
			dataSources.value = await window.api.invoke('get-data-sources')
			dataSourceModel.value = { name: '', type: '', config: {} }
			newDataSourceFilePicker.value = {}
			$q.notify({ message: 'Новый источник данных сохранён!', type: 'positive' })
		} else if (result === 'data-source-already-exists') {
			$q.notify({ message: 'Источник данных с такими настройками уже существует!', type: 'negative' })
		} else {
			$q.notify({ message: 'Сохранение не возможно!', type: 'negative' })
		}
	}
}

function cancel() {
	addNewDataSourceForm.value = false
	dataSourceModel.value = { name: '', type: '', config: {} }
	newDataSourceFilePicker.value = {}
	separator1.value = '[разделитель1]'
	separator2.value = '[разделитель2]'
	availableSeparators.value = separators
}
</script>