<template>
	<q-list bordered separator>
		<q-item v-for="template in templates" :key="template.id">
			<q-item-section no-wrap>
				<q-item-label header>{{ template.name }}</q-item-label>
			</q-item-section>
			<q-item-section side>
				<q-btn type="submit" dense color="primary" label="редактировать" @click="openTemplateEditor(template, 'edit-template')" />
			</q-item-section>
			<q-item-section side>
				<q-btn type="submit" dense flat round color="negative" icon="delete" @click="openDeleteTemplateForm(template)" />
			</q-item-section>
		</q-item>
	</q-list>
	<div class="row q-mt-md q-gutter-x-md justify-end">
		<q-btn type="submit" dense color="primary" label="добавить" @click="openTemplateEditor(null, 'add-template')" />
	</div>

	<q-dialog v-model="templateEditor" full-width persistent>
		<q-card>
			<q-card-section>
				<div class="text-h6 text-center">{{ titleForTemplateEditor }}</div>
			</q-card-section>
			<q-card-section class="q-gutter-y-md">
				<q-input v-if="addTemplate" outlined v-model="editableTemplate.name" label="Название шаблона" />
				<q-input outlined v-model="editableTemplate.template" type="textarea" />
			</q-card-section>
			<q-card-actions horizontal align="center">
				<q-btn label="сохранить" type="submit" color="primary" dense unelevated @click="saveTemplate" />
				<q-btn label="закрыть" type="reset" color="primary" dense unelevated @click="templateEditor = false" />
			</q-card-actions>
		</q-card>
	</q-dialog>

	<q-dialog v-model="deleteTemplateForm" persistent>
		<q-card>
			<q-card-section>
				<div class="text-h6 text-center">Удалить шаблон</div>
			</q-card-section>
			<q-card-section>
				<div class="text-center text-body1">Вы действительно хотите удалить шаблон {{ templateForDeletion.name }}?</div>
			</q-card-section>
			<q-card-actions horizontal align="center">
				<q-btn label="да" type="submit" color="negative" dense unelevated @click="deleteTemplate" />
				<q-btn label="нет" type="reset" color="primary" dense unelevated @click="deleteTemplateForm = false" />
			</q-card-actions>
		</q-card>
	</q-dialog>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

let templates = ref([])
let editableTemplate = ref({ id: '', name: '', template: '' })
let templateEditor = ref(false)
let titleForTemplateEditor = ref('')
let addTemplate = ref(false)

let deleteTemplateForm = ref(false)
let templateForDeletion = ref({ id: '', name: '', template: '' })

onMounted(async () => {
	await getValidTemplates()
})

async function getValidTemplates() {
	let templatesDB = await window.api.invoke('get-templates')
	templates.value = templatesDB.filter((template) => template.name !== 'Без шаблона')
}

function openTemplateEditor(template, operation) {
	templateEditor.value = true
	if (operation === 'edit-template') {
		editableTemplate.value = { ...template }
		titleForTemplateEditor.value = `Редактировать шаблон ${editableTemplate.value.name}`
	} else if (operation === 'add-template') {
		titleForTemplateEditor.value = `Добавить новый шаблон`
		addTemplate.value = true
	}
}

async function saveTemplate() {
	if (addTemplate.value) {
		await window.api.invoke('add-new-template', { name: editableTemplate.value.name, template: editableTemplate.value.template })
	} else {
		await window.api.invoke('update-template', { id: editableTemplate.value.id, name: editableTemplate.value.name, template: editableTemplate.value.template })
	}
	$q.notify({ message: 'Шаблон сохранён!', type: 'positive' })
	templateEditor.value = false
	editableTemplate.value = { id: '', name: '', template: '' }
	await getValidTemplates()
}

function openDeleteTemplateForm(template) {
	templateForDeletion.value = { ...template }
	deleteTemplateForm.value = true
}

async function deleteTemplate() {
	await window.api.invoke('delete-template', templateForDeletion.value.id)
	deleteTemplateForm.value = false
	await getValidTemplates()
}
</script>