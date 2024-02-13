<template>
	<q-page class="column justify-start items-center">

		<q-tabs v-model="tab" dense class="text-grey" active-color="primary" indicator-color="primary" narrow-indicator>
			<q-tab name="main-settings" label="Основные настройки" />
			<q-tab name="printers-settings" label="Принтеры" />
		</q-tabs>

		<q-tab-panels v-model="tab">
			<q-tab-panel name="main-settings">
				<div class="q-gutter-md">
					<div class="row q-gutter-md items-center" v-for="setting in settings" :key="setting.id">
						<div class="col-auto text-uppercase text-body2">{{ setting.name }}</div>
						<div class="col-auto"><q-input v-model="setting.value" type="text" /></div>
					</div>
					<div class="row q-gutter-md justify-end">
						<div class="col-auto"><q-btn type="submit" dense unelevated color="primary" label="сохранить"
								@click="saveSettings" /></div>
						<div class="col-auto"><q-btn type="submit" dense unelevated color="primary" label="выйти" to="/" /></div>
					</div>
				</div>
			</q-tab-panel>

			<q-tab-panel name="printers-settings">
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
								<q-input outlined v-model="printerModel.port" label="Порт" />
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

				<q-list bordered separator class="">
					<q-item v-for="printer in printers" :key="printer.id">
						<q-item-section no-wrap>
							<q-item-label class="text-uppercase" header>{{ printer.name }}</q-item-label>
							<q-item-label class="text-body1">Драйвер: {{ printer.Driver.name }} IP адрес: {{ printer.ipAddress }} Порт: {{ printer.port }}</q-item-label>
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
					<div class="col-auto">
						<q-btn type="submit" dense unelevated color="primary" label="добавить"
							@click="saveOrUpdatePrinterForm = true; titleForSaveOrUpdatePrinterForm = 'Добавить принтер'" />
					</div>
					<div class="col-auto">
						<q-btn type="submit" dense unelevated color="primary" label="выйти" to="/" />
					</div>
					<div class="col-auto">
						<q-btn type="submit" dense unelevated color="primary" label="обновить" @click="refresh" />
					</div>
				</div>
			</q-tab-panel>
		</q-tab-panels>

	</q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

let tab = ref('main-settings')

let settings = ref()
let printers = ref()
let drivers = ref()

let deletePrinterForm = ref(false)
let printerForDeletion = ref()

let saveOrUpdatePrinterForm = ref(false)
let titleForSaveOrUpdatePrinterForm = ref()
let printerModel = ref({ id: '', name: '', driver: '', ipAddress: '', port: '' })

let forSpinner = ref(false)

onMounted(async () => {
	settings.value = await window.api.invoke('get-settings')
	printers.value = await window.api.invoke('get-printers')
	drivers.value = await window.api.invoke('get-drivers')
})

async function saveSettings() {
	let newSettings = []
	for (let i = 0; i < settings.value.length; i++) {
		newSettings.push({ id: settings.value[i].id, name: settings.value[i].name, value: settings.value[i].value })
	}
	await window.api.invoke('save-settings', newSettings)
}

function openSaveOrUpdatePrinterForm(printer) {
	titleForSaveOrUpdatePrinterForm.value = 'Изменить настройки принтера ' + printer.name
	saveOrUpdatePrinterForm.value = true
	printerModel.value = { id: printer.id, name: printer.name, driver: printer.Driver.name, ipAddress: printer.ipAddress, port: printer.port }
}

function closeSaveOrUpdatePrinterForm() {
	printerModel.value = { id: '', name: '', driver: '', ipAddress: '', port: '' }
	saveOrUpdatePrinterForm.value = false
}

async function savePrinter() {
	if (printerModel.value.name !== '' && printerModel.value.driver !== '' && printerModel.value.ipAddress !== '' && printerModel.value.port !== '') {
		let result = await window.api.invoke('save-or-update-printer', {
			id: printerModel.value.id,
			name: printerModel.value.name,
			driver: printerModel.value.driver,
			ipAddress: printerModel.value.ipAddress,
			port: printerModel.value.port
		})
		if (result === 'printer-created-or-updated') {
			closeSaveOrUpdatePrinterForm()
			printers.value = await window.api.invoke('get-printers')
			$q.notify({ message: 'Принтер сохранён!', type: 'positive' })
		} else {
			$q.notify({ message: 'Такой принтер уже существует!', type: 'negative' })
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
		console.log(result)
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

async function refresh() {
	settings.value = await window.api.invoke('get-settings')
	printers.value = await window.api.invoke('get-printers')
	drivers.value = await window.api.invoke('get-drivers')
}
</script>