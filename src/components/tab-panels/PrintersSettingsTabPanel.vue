<template>
	<q-list bordered separator>
		<q-item v-for="printer in printers" :key="printer.id">
			<q-item-section no-wrap>
				<q-item-label class="text-uppercase" header>{{ printer.name }}</q-item-label>
				<q-item-label class="text-body1">Драйвер: {{ printer.Driver.name }} IP адрес: {{ printer.ipAddress }} Порт: {{ printer.port }}</q-item-label>
        <q-item-label v-if="printer.DataSource.message" class="text-body1">Источник данных: {{ printer.DataSource.message }}</q-item-label>
        <q-item-label v-else class="text-body1">Источник данных: {{ printer.DataSource.name }}</q-item-label>
			</q-item-section>
			<q-item-section side>
				<q-btn type="submit" dense flat round color="negative" icon="delete" @click="openDeletePrinterForm(printer)" />
			</q-item-section>
			<q-item-section side>
				<q-btn type="submit" dense unelevated color="primary" label="изменить" @click="openSaveOrUpdatePrinterForm(printer)" />
			</q-item-section>
			<q-item-section side>
				<q-btn type="submit" dense unelevated color="positive" icon="play_arrow" push v-if="!printer.is_active" @click="turnOnOffPrinter(printer.id, 'on')" />
				<q-btn type="submit" dense unelevated color="negative" icon="pause" push v-else @click="turnOnOffPrinter(printer.id, 'off')" />
			</q-item-section>
		</q-item>
	</q-list>
	<div class="row q-mt-md q-gutter-x-md justify-end">
		<div class="col-auto"><q-btn type="submit" dense unelevated color="primary" label="добавить" @click="saveOrUpdatePrinterForm = true; titleForSaveOrUpdatePrinterForm = 'Добавить принтер'" /></div>
		<div class="col-auto"><q-btn type="submit" dense unelevated color="primary" label="выйти" to="/" /></div>
	</div>

	<q-dialog v-model="saveOrUpdatePrinterForm" persistent>
		<q-card>
			<q-card-section>
				<div class="text-h6 text-center">{{ titleForSaveOrUpdatePrinterForm }}</div>
			</q-card-section>
			<q-card-section>
				<q-form class="col q-gutter-y-md" @submit.prevent>
					<q-input outlined v-model="printerModel.name" label="Название принтера" />
					<q-select outlined v-model="printerModel.driver" :options="drivers" label="Драйвер принтера" />
					<q-input outlined v-model="printerModel.ipAddress" label="IP адрес" />
					<q-input outlined v-model="printerModel.port" mask="#####" label="Порт" />
					<q-select outlined v-model="printerModel.dataSource" :options="dataSources" label="Источник данных" />
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

let deletePrinterForm = ref(false)
let printerForDeletion = ref()

let saveOrUpdatePrinterForm = ref(false)
let titleForSaveOrUpdatePrinterForm = ref()
let printerModel = ref({ id: '', name: '', driver: '', ipAddress: '', port: '', dataSource: '' })

let forSpinner = ref(false)

onMounted(async () => {
	printers.value = await window.api.invoke('get-printers')
	drivers.value = await window.api.invoke('get-drivers')
  dataSources.value = (await window.api.invoke('get-data-sources')).map((dataSource) => { return dataSource.name })
})

function openSaveOrUpdatePrinterForm(printer) {
	titleForSaveOrUpdatePrinterForm.value = 'Изменить настройки принтера ' + printer.name
	saveOrUpdatePrinterForm.value = true
  if (printer.DataSource.message) {
	  printerModel.value = { id: printer.id, name: printer.name, driver: printer.Driver.name, ipAddress: printer.ipAddress, port: printer.port, dataSource: '' }
  } else {
	  printerModel.value = { id: printer.id, name: printer.name, driver: printer.Driver.name, ipAddress: printer.ipAddress, port: printer.port, dataSource: printer.DataSource.name }
  }
}

function closeSaveOrUpdatePrinterForm() {
	printerModel.value = { id: '', name: '', driver: '', ipAddress: '', port: '', dataSource: '' }
	saveOrUpdatePrinterForm.value = false
}

async function savePrinter() {
	if (printerModel.value.name !== '' && printerModel.value.driver !== '' && printerModel.value.ipAddress !== '' && printerModel.value.port !== '' && printerModel.value.dataSource !== '') {
		let result = await window.api.invoke('save-or-update-printer', {
			id: printerModel.value.id,
			name: printerModel.value.name,
			driver: printerModel.value.driver,
			ipAddress: printerModel.value.ipAddress,
			port: printerModel.value.port,
      dataSource: printerModel.value.dataSource
		})
		if (result === 'printer-created-or-updated') {
			closeSaveOrUpdatePrinterForm()
			printers.value = await window.api.invoke('get-printers')
			$q.notify({ message: 'Принтер сохранён!', type: 'positive' })
		} else {
			$q.notify({ message: 'Принтер с такими IP-адресом и портом уже существует!', type: 'negative' })
		}
	} else {
		$q.notify({ message: 'Не все поля указаны!', type: 'negative' })
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