<template>
  <q-page class="flex flex-center">
    <div class="column justify-center">

      <q-tabs v-model="tab" dense class="text-grey" active-color="primary" indicator-color="primary" align="justify"
        narrow-indicator>
        <q-tab name="main-settings" label="Основные настройки" />
        <q-tab name="printers-settings" label="Принтеры" />
      </q-tabs>

      <q-tab-panels v-model="tab">
        <q-tab-panel name="main-settings">
          <div class="q-gutter-y-md">
            <div class="row q-gutter-x-md" v-for="setting in settings" :key="setting.id">
              <div class="col text-subtitle2">{{ setting.name }}</div>
              <div class="col"><q-input v-model="setting.value" type="text" /></div>
            </div>
            <div class="row justify-between">
              <div class="col-4"><q-btn type="submit" unelevated color="primary" label="сохранить" @click="saveSettings" /></div>
              <div class="col-4"><q-btn type="submit" unelevated color="primary" label="выйти" to="/" /></div>
            </div>
          </div>
        </q-tab-panel>

        <q-tab-panel name="printers-settings">
          <q-dialog v-model="saveOrUpdatePrinterForm">
            <q-card>
              <q-card-section>
                <div class="text-h6 text-center">{{ titleForSaveOrUpdatePrinterForm }}</div>
              </q-card-section>
              <q-card-section>
                <q-form class="q-gutter-y-md">
                  <q-input outlined v-model="printerModel.name" label="Название принтера" />
                  <q-select outlined v-model="printerModel.driver" :options="drivers" label="Драйвер принтера" />
                  <q-input outlined v-model="printerModel.ipAddress" label="IP адрес" />
                  <q-input outlined v-model="printerModel.port" label="Порт" />
                  <div class="q-gutter-md">
                    <q-btn label="сохранить" type="submit" color="primary" @click="savePrinter" unelevated />
                    <q-btn label="отмена" type="reset" color="primary" unelevated @click="saveOrUpdatePrinterForm = false" />
                    <q-btn label="проверить подключение" color="primary" unelevated @click="testConnection(printerModel.ipAddress)" />
                  </div>
                </q-form>
              </q-card-section>
            </q-card>
          </q-dialog>

          <q-dialog v-model="deletePrinterForm">
            <q-card>
              <q-card-section>
                <div class="text-h6 text-center">Удалить принтер</div>
              </q-card-section>
              <q-card-section>
                <div class="text-center">Вы действительно хотите удалить принтер <span class="text-uppercase">{{ printerForDeletion.name }}</span>?</div>
              </q-card-section>
              <q-card-actions horizontal align="center">
								<q-btn label="да" type="submit" color="negative" unelevated @click="deletePrinter(printerForDeletion.id)" />
                <q-btn label="нет" type="reset" color="primary" unelevated @click="deletePrinterForm = false" />
              </q-card-actions>
            </q-card>
          </q-dialog>

          <div class="q-gutter-y-md">
            <div class="row q-gutter-x-md justify-between" v-for="printer in printers" :key="printer.id">
              <p class="text-uppercase">{{ printer.name }}</p>
              <p class="text-body2">Драйвер: {{ printer.Driver.name }}, IP: {{ printer.ipAddress }}, Порт: {{ printer.port}}</p>
              <div class="q-gutter-md">
                <q-btn type="submit" dense flat round color="negative" icon="delete" @click="openDeletePrinterForm(printer)" />
                <q-btn type="submit" dense unelevated color="primary" label="изменить" @click="openSaveOrUpdatePrinterForm(printer)" />
              </div>
            </div>
            <div class="row justify-between">
							<div class="col-4"><q-btn type="submit" unelevated color="primary" label="добавить" @click="saveOrUpdatePrinterForm = true; titleForSaveOrUpdatePrinterForm = 'Добавить принтер'" /></div>
							<div class="col-4"><q-btn type="submit" unelevated color="primary" label="выйти" to="/" /></div>
						</div>
          </div>
        </q-tab-panel>
      </q-tab-panels>

    </div>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

let settings = ref()
let tab = ref()
let printers = ref()
let drivers = ref()
let deletePrinterForm = ref(false)
let printerForDeletion = ref()

let saveOrUpdatePrinterForm = ref(false)
let titleForSaveOrUpdatePrinterForm = ref()
let printerModel = ref({
	id: '',
  name: '',
  driver: '',
  ipAddress: '',
  port: ''
})

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

async function savePrinter() {
	await window.api.invoke('save-or-update-printer', {
		id: printerModel.value.id,
    name: printerModel.value.name,
    driver: printerModel.value.driver,
    ipAddress: printerModel.value.ipAddress,
    port: printerModel.value.port
  })
}

function openDeletePrinterForm(printer) {
	deletePrinterForm.value = true
	printerForDeletion.value = printer
}

async function deletePrinter(printerId) {
	await window.api.invoke('delete-printer', printerId)
	deletePrinterForm.value = false
}

function openSaveOrUpdatePrinterForm(printer) {
	titleForSaveOrUpdatePrinterForm.value = 'Изменить настройки принтера ' + printer.name
	saveOrUpdatePrinterForm.value = true
	printerModel.value = printer
}

async function testConnection(printerIpAddress) {
	await window.api.invoke('test-connection', printerIpAddress)
		.then((result) => {
			if (result) {
				$q.notify({
					message: 'Подключение установлено',
					type: 'positive'
				})
			} else {
				$q.notify({
					message: 'Подключение НЕ установлено',
					type: 'negative'
				})
			}
		})
}
</script>