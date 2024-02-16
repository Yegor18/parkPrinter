<template>
	<q-page class="column justify-start items-center">

		<q-tabs v-model="tab" dense class="text-grey" active-color="primary" indicator-color="primary" narrow-indicator>
			<q-tab name="main-settings" label="Основные настройки" />
			<q-tab name="printers-settings" label="Принтеры" />
      <q-tab name="data-sources-settings" label="Источники данных" />
		</q-tabs>

		<q-tab-panels class="fit row wrap justify-start items-start content-start" v-model="tab">
			<q-tab-panel name="main-settings">
				<MainSettingsTabPanel class="col" />
			</q-tab-panel>

			<q-tab-panel name="printers-settings">
				<PrintersSettingsTabPanel class="col" />
			</q-tab-panel>

      <q-tab-panel name="data-sources-settings">
        <DataSourcesSettingsTabPanel class="col" />
      </q-tab-panel>
		</q-tab-panels>

	</q-page>
</template>

<script setup>
import { ref } from 'vue'
import DataSourcesSettingsTabPanel from 'components/tab-panels/DataSourcesSettingsTabPanel.vue'
import MainSettingsTabPanel from 'src/components/tab-panels/MainSettingsTabPanel.vue'
import PrintersSettingsTabPanel from 'src/components/tab-panels/PrintersSettingsTabPanel.vue'

let tab = ref('main-settings')
</script>