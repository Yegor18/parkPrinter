<template>
	<q-list bordered separator>
		<q-item v-for="printer in printers" :key="printer.id">
			<q-item-section no-wrap>
				<q-item-label class="text-uppercase" header>{{ printer.name }}</q-item-label>
				<q-item-label class="text-body1">Драйвер: {{ printer.Driver.name }}</q-item-label>
				<q-item-label v-if="printer.Driver.name === 'Файловый принтер'" class="text-body1">Путь к TXT файлу для записи: {{ printer.config.pathToFile }}</q-item-label>
				<q-item-label v-else-if="printer.Driver.name === 'Сквозной TCP принтер'" class="text-body1">Порт: {{ printer.config.port }}</q-item-label>
				<q-item-label v-else class="text-body1">IP адрес: {{ printer.ipAddress }} Порт: {{ printer.port }}</q-item-label>
				<q-item-label v-if="printer.DataSource.message" class="text-body1">Источник данных: {{ printer.DataSource.message }}</q-item-label>
				<q-item-label v-else class="text-body1">Источник данных: {{ printer.DataSource.name }}</q-item-label>
				<q-item-label class="text-body1">Шаблон: {{ printer.Template.name }}</q-item-label>
			</q-item-section>
			<q-item-section side>
				<q-btn type="submit" dense flat round color="negative" icon="delete" @click="openDeletePrinterForm(printer)" />
			</q-item-section>
			<q-item-section side>
				<q-btn type="submit" dense unelevated color="primary" label="изменить" @click="openSaveOrUpdatePrinterForm(printer, 'edit-printer')" />
			</q-item-section>
			<q-item-section side>
				<q-btn type="submit" dense unelevated color="positive" icon="play_arrow" push v-if="!printer.is_active" @click="turnOnOffPrinter(printer.id, 'on')" />
				<q-btn type="submit" dense unelevated color="negative" icon="pause" push v-else @click="turnOnOffPrinter(printer.id, 'off')" />
			</q-item-section>
		</q-item>
	</q-list>
	<div class="row q-mt-md q-gutter-x-md justify-end">
		<div class="col-auto"><q-btn type="submit" dense unelevated color="primary" label="добавить" @click="openSaveOrUpdatePrinterForm(null, 'add-printer')" /></div>
		<div class="col-auto"><q-btn type="submit" dense unelevated color="primary" label="выйти" to="/" /></div>
	</div>

	<q-dialog v-model="saveOrUpdatePrinterForm" persistent>
		<q-card>
			<q-card-section>
				<div class="text-h6 text-center">{{ titleForSaveOrUpdatePrinterForm }}</div>
			</q-card-section>
			<q-card-section>
				<q-form class="col q-gutter-y-md" @submit.prevent>
					<q-input outlined v-model="printerModel.name" :rules="rulesForValidations.printerName" label="Название принтера" />
					<q-select outlined v-model="printerModel.driver" :rules="rulesForValidations.printerDriver" :options="drivers" @update:model-value="changeConfig" label="Драйвер принтера" />
					<div class="q-gutter-y-md" v-if="printerModel.driver === 'Файловый принтер'">
						<q-file v-model="fileForWritingFilePicker" @update:model-value="writePathToConfig" clearable outlined label="Выбрать TXT файл" accept=".txt">
							<template #prepend><q-icon name="attach_file" /></template>
						</q-file>
						<q-input v-model="printerModel.config.pathToFile" :rules="rulesForValidations.printerPathToFile" readonly type="text" label="Путь к файлу" outlined />
					</div>
					<div v-else-if="printerModel.driver === 'Сквозной TCP принтер'">
						<q-input outlined v-model="printerModel.port" mask="#####" hint="Значение от 5000 до 40000" :rules="rulesForValidations.printerPort" label="Порт" />
					</div>
					<div class="q-gutter-y-md" v-else>
						<q-input outlined v-model="printerModel.ipAddress" :rules="rulesForValidations.printerIpAddress" label="IP адрес" />
						<q-input outlined v-model="printerModel.port" mask="#####" hint="Значение от 5000 до 40000" :rules="rulesForValidations.printerPort" label="Порт" />
					</div>
					<q-select outlined v-model="printerModel.dataSource" :options="dataSources" :rules="rulesForValidations.printerDataSource" label="Источник данных" />
					<q-select outlined v-model="printerModel.template" :options="templates" :rules="rulesForValidations.printerTemplate" label="Шаблон" />
					<div class="row q-gutter-x-md">
						<div class="col-auto"><q-btn label="сохранить" type="submit" color="primary" dense unelevated @click="savePrinter" /></div>
						<div class="col-auto"><q-btn label="отмена" type="reset" color="primary" dense unelevated @click="closeSaveOrUpdatePrinterForm" /></div>
						<div class="col-auto"><q-btn label="проверить подключение" color="primary" dense unelevated @click="testConnection(printerModel.ipAddress)" /></div>
					</div>
					<q-spinner-radio v-if="forSpinner" color="primary" size="2em" />
				</q-form>
			</q-card-section>
		</q-card>
	</q-dialog>

	<q-dialog v-model="deletePrinterForm" persistent>
		<q-card>
			<q-card-section>
				<div class="text-h6 text-center">Удалить принтер</div>
			</q-card-section>
			<q-card-section>
				<div class="text-center text-body1">Вы действительно хотите удалить принтер <span class="text-uppercase">{{ printerForDeletion.name }}</span>?</div>
			</q-card-section>
			<q-card-actions horizontal align="center">
				<q-btn label="да" type="submit" color="negative" dense unelevated @click="deletePrinter(printerForDeletion.id)" />
				<q-btn label="нет" type="reset" color="primary" dense unelevated @click="deletePrinterForm = false" />
			</q-card-actions>
		</q-card>
	</q-dialog>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

let printers = ref()
let drivers = ref()
let dataSources = ref()
let dataSourcesDB
let templates = ref()

let deletePrinterForm = ref(false)
let printerForDeletion = ref()

let saveOrUpdatePrinterForm = ref(false)
let titleForSaveOrUpdatePrinterForm = ref()
let printerModel = ref({ id: '', name: '', driver: '', ipAddress: '', port: '', dataSource: '', config: {}, template: '' })

let forSpinner = ref(false)

let fileForWritingFilePicker = ref({})

const rulesForValidations = ref({
	printerName: [value => !!value || 'Введите название!'],
	printerDriver: [value => !!value || 'Выберите тип!'],
	//***Расширить правило для айпишников. запретить введение букв
	printerIpAddress: [value => !!value || 'Введите IP-адрес!'],
	printerPort: [value => !!value || 'Введите значение!', value => (value >= 5000 && value <= 40000) || 'Неверное значение порта!'],
	printerPathToFile: [value => (!!value || value !== '') || 'Выберите файл!'],
	printerDataSource: [value => !!value || 'Выберите источник данных!'],
	printerTemplate: [value => !!value || 'Выберите шаблон!'],
})

onMounted(async () => {
	//***почему функции называются одинаково get_something, но возвращают разные типы ответов(объекты и строки)?
	printers.value = await window.api.invoke('get-printers')
	drivers.value = await window.api.invoke('get-drivers')
	dataSourcesDB = (await window.api.invoke('get-data-sources'))
	dataSources.value = dataSourcesDB.filter((dataSource) => dataSource.TypeOfDataSource.name !== 'TCP (Сквозной)').map((dataSource) => { return dataSource.name })
	templates.value = await window.api.invoke('get-templates')
})

//***переименовать функцию
function changeConfig() {
	switch (printerModel.value.driver) {
		case 'Файловый принтер':
			printerModel.value.config = { pathToFile: '' }
			break
		case 'Сквозной TCP принтер':
			printerModel.value.config = { port: '' }
			dataSources.value = dataSourcesDB.filter((dataSource) => dataSource.TypeOfDataSource.name === 'TCP (Сквозной)').map((dataSource) => { return dataSource.name })
			break
	}
}

function writePathToConfig() {
	try {
		let path = fileForWritingFilePicker.value.path
		printerModel.value.config.pathToFile = path
	} catch (error) {
		printerModel.value.config.pathToFile = ''
	}
}

function openSaveOrUpdatePrinterForm(printer, operation) {
	switch (operation) {
		case 'edit-printer':
			titleForSaveOrUpdatePrinterForm.value = 'Изменить настройки принтера ' + printer.name
			if (printer.DataSource.message) {
				printerModel.value = { id: printer.id, name: printer.name, driver: printer.Driver.name, ipAddress: printer.ipAddress, port: printer.port, dataSource: '', config: printer.config, template: printer.Template.name }
			} else {
				printerModel.value = { id: printer.id, name: printer.name, driver: printer.Driver.name, ipAddress: printer.ipAddress, port: printer.port, dataSource: printer.DataSource.name, config: printer.config, template: printer.Template.name }
			}
			break
		case 'add-printer':
			titleForSaveOrUpdatePrinterForm.value = 'Добавить принтер'
			break
	}
	saveOrUpdatePrinterForm.value = true
}

function closeSaveOrUpdatePrinterForm() {
	printerModel.value = { id: '', name: '', driver: '', ipAddress: '', port: '', dataSource: '', config: {}, template: '' }
	fileForWritingFilePicker.value = {}
	saveOrUpdatePrinterForm.value = false
}

async function savePrinter() {
	let newPrinter = { id: printerModel.value.id, name: printerModel.value.name, driver: printerModel.value.driver, ipAddress: printerModel.value.ipAddress, port: printerModel.value.port, dataSource: printerModel.value.dataSource, config: printerModel.value.config, template: printerModel.value.template }
	switch (printerModel.value.driver) {
		case 'Файловый принтер':
			newPrinter.config = { pathToFile: printerModel.value.config.pathToFile }
			newPrinter.ipAddress = ''
			newPrinter.port = ''
			break
		case 'Сквозной TCP принтер':
			newPrinter.config = { port: printerModel.value.config.port }
			newPrinter.ipAddress = ''
			newPrinter.port = ''
			break
		default:
			newPrinter.config = {}
			newPrinter.ipAddress = printerModel.value.ipAddress
			newPrinter.port = printerModel.value.port
	}
	if ((newPrinter.name !== '' && newPrinter.driver !== '' && newPrinter.dataSource !== '' && newPrinter.template !== '') &&
		((newPrinter.driver === 'Файловый принтер' && newPrinter.config.pathToFile !== '') ||
			(newPrinter.driver === 'Сквозной TCP принтер' && newPrinter.config.port !== '') ||
			(newPrinter.ipAddress !== '' && newPrinter.port !== ''))) {
		await window.api.invoke('save-or-update-printer', newPrinter)
		closeSaveOrUpdatePrinterForm()
		printers.value = await window.api.invoke('get-printers')
		$q.notify({ message: 'Принтер сохранён!', type: 'positive' })
	}
}

function openDeletePrinterForm(printer) {
	deletePrinterForm.value = true
	printerForDeletion.value = printer
}

async function deletePrinter(printerId) {
	await window.api.invoke('delete-printer', printerId)
	deletePrinterForm.value = false
	printers.value = await window.api.invoke('get-printers')
	$q.notify({ message: 'Принтер удалён!', type: 'positive' })
}

async function testConnection(printerIpAddress) {
	if (printerIpAddress !== '') {
		forSpinner.value = true
		let result = await window.api.invoke('test-connection', printerIpAddress)
		if (result) {
			$q.notify({ message: 'Подключение установлено!', type: 'positive' })
		} else {
			$q.notify({ message: 'Подключение НЕ установлено!', type: 'negative' })
		}
		forSpinner.value = false
	} else {
		$q.notify({ message: 'Введите IP адрес!', type: 'negative' })
	}
}

async function turnOnOffPrinter(printerId, operation) {
	let result = await window.api.invoke('turn-on-off-printer', { printerId: printerId, operation: operation })
	switch (result.type) {
		case 'ok-on':
			$q.notify({ message: result.message, type: 'positive' })
			break
		case 'error-on':
			$q.notify({ message: result.message, type: 'negative' })
			break
		case 'ok-off':
			$q.notify({ message: result.message, type: 'positive' })
			break
		case 'error-off':
			$q.notify({ message: result.message, type: 'negative' })
			break
	}
	printers.value = await window.api.invoke('get-printers')
}
</script>
