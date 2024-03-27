<template>
	<q-list bordered separator>
		<q-item v-for="printer in printers" :key="printer.id">
			<q-item-section no-wrap>
				<q-item-label header>{{ printer.name }}</q-item-label>
				<q-item-label class="text-body1">Драйвер: {{ printer.Driver.name }}</q-item-label>
				<q-item-label class="text-body1" v-if="printer.Driver.name === 'Файловый принтер'">Путь к TXT файлу для записи: {{ printer.config.pathToFile }}</q-item-label>
				<q-item-label class="text-body1" v-else-if="printer.Driver.name === 'Сквозной TCP принтер'">Порт: {{ printer.config.port }}</q-item-label>
				<q-item-label class="text-body1" v-else>IP адрес: {{ printer.ipAddress }} Порт: {{ printer.port }}</q-item-label>
				<q-item-label class="text-body1" v-if="printer.DataSource.message">Источник данных: {{ printer.DataSource.message }}</q-item-label>
				<q-item-label class="text-body1" v-else>Источник данных: {{ printer.DataSource.name }}</q-item-label>
				<q-item-label class="text-body1">Шаблон: {{ printer.Template.name }}</q-item-label>
			</q-item-section>
			<q-item-section side>
				<q-btn type="submit" dense flat round color="negative" icon="delete" @click="openDeletePrinterForm(printer)" />
			</q-item-section>
			<q-item-section side>
				<q-btn type="submit" dense unelevated color="primary" label="изменить" @click="openSaveOrUpdatePrinterForm(printer, 'edit-printer')" />
			</q-item-section>
			<q-item-section side>
				<q-btn type="submit" dense unelevated color="positive" icon="play_arrow" push v-if="!printer.is_active" @click="turnOnOffPrinter({		printerId:printer.id,dataSourceId:printer.data_source_id}, 'on')" />
				<q-btn type="submit" dense unelevated color="negative" icon="pause" push v-else @click="turnOnOffPrinter({		printerId:printer.id,dataSourceId:printer.data_source_id}, 'off')" />
			</q-item-section>
		</q-item>
	</q-list>
	<div class="row q-mt-md q-gutter-x-md justify-end">
		<div class="col-auto"><q-btn type="submit" dense unelevated color="primary" label="добавить" @click="openSaveOrUpdatePrinterForm(null, 'add-printer')" /></div>
		<div class="col-auto"><q-btn type="submit" dense unelevated color="primary" label="выйти" to="/" /></div>
	</div>

	<q-dialog v-model="saveOrUpdatePrinterForm" full-width persistent>
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
						<q-input outlined v-model="printerModel.config.port" mask="#####" hint="Значение от 5000 до 40000" :rules="rulesForValidations.printerPort" label="Порт" />
					</div>
					<div class="q-gutter-y-md" v-else>
						<q-input outlined v-model="printerModel.ipAddress" :rules="rulesForValidations.printerIpAddress" label="IP адрес" />
						<q-input outlined v-model="printerModel.port" mask="#####" hint="Значение от 5000 до 40000" :rules="rulesForValidations.printerPort" label="Порт" />
					</div>
					<q-select outlined v-model="printerModel.dataSource" :options="dataSources" :rules="rulesForValidations.printerDataSource" label="Источник данных" />
					<q-select outlined v-model="printerModel.template" :options="templates" :rules="rulesForValidations.printerTemplate" label="Шаблон" />
					<q-btn v-if="printerModel.template !== 'Без шаблона'" label="редактировать шаблон" color="primary" dense unelevated @click="openTemplateEditor(printerModel.template)" />
					<div class="row q-gutter-x-md">
						<div class="col-auto"><q-btn label="сохранить" type="submit" color="primary" dense unelevated @click="savePrinter" /></div>
						<div class="col-auto"><q-btn label="отмена" type="reset" color="primary" dense unelevated @click="closeSaveOrUpdatePrinterForm" /></div>
						<div class="col-auto" v-if="printerModel.driver === 'Файловый принтер'"><q-btn label="проверить файл" color="primary" dense unelevated @click="checkFile(printerModel.config.pathToFile)" /></div>
						<div class="col-auto" v-else-if="printerModel.driver === 'Сквозной TCP принтер'"><q-btn label="проверить порт" color="primary" dense unelevated @click="testPort(printerModel.config.port)" /></div>
						<div class="col-auto" v-else><q-btn label="проверить подключение" color="primary" dense unelevated @click="testConnection(printerModel.ipAddress, printerModel.port)" /></div>
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
				<div class="text-center text-body1">Вы действительно хотите удалить принтер {{ printerForDeletion.name }}?</div>
			</q-card-section>
			<q-card-actions horizontal align="center">
				<q-btn label="да" type="submit" color="negative" dense unelevated @click="deletePrinter(printerForDeletion.id)" />
				<q-btn label="нет" type="reset" color="primary" dense unelevated @click="deletePrinterForm = false" />
			</q-card-actions>
		</q-card>
	</q-dialog>

	<q-dialog v-model="templateEditor" full-width persistent>
		<q-card>
			<q-card-section>
				<div class="text-h6 text-center">Редактировать {{ template.name }}</div>
			</q-card-section>
			<q-card-section>
				<q-input outlined v-model="template.template" type="textarea" />
			</q-card-section>
			<q-card-actions horizontal align="center">
				<q-btn label="сохранить" type="submit" color="primary" dense unelevated @click="openAttentionForm" />
				<q-btn label="закрыть" type="reset" color="primary" dense unelevated @click="templateEditor = false" />
			</q-card-actions>
		</q-card>
	</q-dialog>

	<q-dialog v-model="attentionForm" persistent>
		<q-card>
			<q-card-section>
				<div class="text-h6 text-center">Внимание</div>
			</q-card-section>
			<q-card-section>
				<div class="text-center text-body1">Этот изменённый шаблон ({{ template.name }}) могут использовать другие принтеры!</div>
			</q-card-section>
			<q-card-actions horizontal align="center">
				<q-btn label="сохранить изменения" type="submit" color="primary" dense unelevated @click="saveTemplate" />
				<q-btn label="не сохранять" type="reset" color="negative" dense unelevated @click="attentionForm = false" />
			</q-card-actions>
		</q-card>
	</q-dialog>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

let printers = ref([])
let drivers = ref([])
let dataSources = ref([])
let dataSourcesDB = []
let templates = ref([])
let templatesDB = []

let deletePrinterForm = ref(false)
let printerForDeletion = ref({})

let saveOrUpdatePrinterForm = ref(false)
let titleForSaveOrUpdatePrinterForm = ref('')
let printerModel = ref({ id: '', name: '', driver: '', ipAddress: '', port: '', dataSource: '', config: {}, template: '' })

let forSpinner = ref(false)

let fileForWritingFilePicker = ref({})

let operationOnPrinter = ''

let templateEditor = ref(false)
let template = ref({ id: '', name: '', template: '' })
let oldTemplate = {}
let attentionForm = ref(false)

const rulesForValidations = ref({
	printerName: [value => !!value || 'Введите название!'],
	printerDriver: [value => !!value || 'Выберите тип!'],
	printerIpAddress: [value => !!value || 'Введите IP-адрес!', value => value.match(/[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/) !== null || 'Неверный IP-адрес!'],
	printerPort: [value => !!value || 'Введите значение!', value => (value >= 5000 && value <= 40000) || 'Неверное значение порта!'],
	printerPathToFile: [value => (!!value || value !== '') || 'Выберите файл!'],
	printerDataSource: [value => !!value || 'Выберите источник данных!'],
	printerTemplate: [value => !!value || 'Выберите шаблон!'],
})

onMounted(async () => {
	printers.value = await window.api.invoke('get-printers')
	drivers.value = await window.api.invoke('get-drivers')
	dataSourcesDB = await window.api.invoke('get-data-sources')
	dataSources.value = dataSourcesDB.filter((dataSource) => dataSource.TypeOfDataSource.name !== 'TCP (Сквозной)').map((dataSource) => { return dataSource.name })
	templatesDB = await window.api.invoke('get-templates')
	templates.value = templatesDB.map((template) => { return template.name })
})

function openTemplateEditor(templateName) {
	let necessaryTemplate = templatesDB.find((template) => template.name === templateName)
	oldTemplate = necessaryTemplate
	template.value = { id: necessaryTemplate.id, name: necessaryTemplate.name, template: necessaryTemplate.template }
	templateEditor.value = true
}

async function saveTemplate() {
	await window.api.invoke('update-template', { id: template.value.id, name: template.value.name, template: template.value.template })
	attentionForm.value = false
	templateEditor.value = false
	$q.notify({ message: 'Шаблон сохранён!', type: 'positive' })
	templatesDB = await window.api.invoke('get-templates')
}

function openAttentionForm() {
	if (oldTemplate.template !== template.value.template) {
		attentionForm.value = true
	} else {
		$q.notify({ message: 'Шаблон не был изменён', type: 'info' })
	}
}

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
			operationOnPrinter = 'update'
			break
		case 'add-printer':
			titleForSaveOrUpdatePrinterForm.value = 'Добавить принтер'
			operationOnPrinter = 'add'
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
			(newPrinter.driver === 'Сквозной TCP принтер' && newPrinter.config.port !== '' && newPrinter.config.port >= 5000 && newPrinter.config.port <= 40000) ||
			(newPrinter.ipAddress !== '' && newPrinter.ipAddress.match(/[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/) !== null && newPrinter.port !== '' && newPrinter.port >= 5000 && newPrinter.port <= 40000))) {
		let result = await window.api.invoke('save-or-update-printer', { printer: newPrinter, operation: operationOnPrinter })
		if (result === 'printer-already-exists') {
			$q.notify({ message: 'Принтер с такими настройками уже существует!', type: 'negative' })
		} else {
			closeSaveOrUpdatePrinterForm()
			printers.value = await window.api.invoke('get-printers')
			$q.notify({ message: 'Принтер сохранён!', type: 'positive' })
		}
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

async function testConnection(printerIpAddress, printerPort) {
	if (printerIpAddress !== '' && printerIpAddress.match(/[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/) !== null && printerPort !== '' && printerPort >= 5000 && printerPort <= 40000) {
		forSpinner.value = true
		let result = await window.api.invoke('test-connection', { ipAddress: printerIpAddress, port: printerPort })
		if (result) {
			$q.notify({ message: 'Подключение установлено!', type: 'positive' })
		} else {
			$q.notify({ message: 'Подключение НЕ установлено!', type: 'negative' })
		}
		forSpinner.value = false
	}
}

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

async function turnOnOffPrinter(options, operation) {
	let result = await window.api.invoke('turn-on-off-printer', {
	options, operation })
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
