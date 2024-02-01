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
              <div class="col-4"><q-btn type="submit" unelevated color="primary" label="сохранить"
                  @click="saveSettings" /></div>
              <div class="col-4"><q-btn type="submit" unelevated color="primary" label="выйти" to="/" /></div>
            </div>
          </div>
        </q-tab-panel>

        <q-tab-panel name="printers-settings">
          <q-dialog v-model="addNewPrinterForm">
            <q-card>
              <q-card-section>
                <div class="text-h6 text-center">Добавить принтер</div>
              </q-card-section>
              <q-card-section>
                <q-form class="q-gutter-y-md">
                  <q-input outlined v-model="printerName" label="Название принтера" />
                  <q-select outlined v-model="printersDriver" :options="drivers" label="Драйвер принтера" />
                  <q-input outlined v-model="ipAddress" label="IP адрес" />
                  <q-input outlined v-model="port" label="Порт" />
                  <div class="q-gutter-x-md">
                    <q-btn label="сохранить" type="submit" color="primary" unelevated />
                    <q-btn label="отмена" type="reset" color="primary" unelevated />
                    <q-btn label="проверить подключение" color="primary" unelevated />
                  </div>
                </q-form>
              </q-card-section>
            </q-card>
          </q-dialog>

          <q-dialog v-model="deletePrinter">
            <q-card>
              <q-card-section>
                <div class="text-h6 text-center">Удалить принтер</div>
              </q-card-section>
              <q-card-section>
                <div class="text-center">Вы действительно хотите удалить?</div>
              </q-card-section>
              <q-card-actions horizontal align="center">
                <q-btn label="да" type="submit" color="negative" unelevated />
                <q-btn label="нет" type="reset" color="primary" unelevated />
              </q-card-actions>
            </q-card>
          </q-dialog>

          <div class="q-gutter-y-md">
            <div class="row q-gutter-x-md justify-between" v-for="printer in printers" :key="printer.id">
              <p class="text-uppercase">{{ printer.name }}</p>
              <p class="text-body2">Драйвер: {{ printer.driver }}, IP: {{ printer.ipAddress }}, Порт: {{ printer.port }}
              </p>
              <div class="q-gutter-md">
                <q-btn type="submit" dense flat round color="negative" icon="delete" @click="deletePrinter = true" />
                <q-btn type="submit" dense unelevated color="primary" label="изменить" />
              </div>
            </div>
            <div class="row justify-center"><q-btn type="submit" unelevated color="primary" label="добавить"
                @click="addNewPrinterForm = true" /></div>
          </div>
        </q-tab-panel>
      </q-tab-panels>

    </div>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'

let settings = ref()
let tab = ref()
let printers = ref()
let addNewPrinterForm = ref(false) // окно добавления нового принтера
let drivers = ref()
let deletePrinter = ref(false)

drivers.value = ['driver 1', 'driver 2', 'driver 3', 'driver 4', 'driver 5', 'driver 6', 'driver 7']

onMounted(async () => {
  settings.value = await window.api.invoke('get-settings')
  printers.value = await window.api.invoke('get-printers')
})

async function saveSettings() {
  let newSettings = []
  for (let i = 0; i < settings.value.length; i++) {
    newSettings.push({ id: settings.value[i].id, name: settings.value[i].name, value: settings.value[i].value })
  }
  await window.api.invoke('save-settings', newSettings)
}
</script>