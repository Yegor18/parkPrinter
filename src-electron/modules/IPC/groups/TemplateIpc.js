import { ipcMain } from 'electron'
import { unwrap } from '../../helpers.js'
import Template from '../../DB/models/Template.js'
import equipmentManager from '../../EQUIPMENT/EquipmentManager.js'
import Printer from '../../DB/models/Printer.js'

class TemplateIpc {
	constructor() {
		ipcMain.handle('get-templates', async () => {
			return unwrap(await Template.findAll())
		})

		ipcMain.handle('update-template', async (event, templateData) => {
			await Template.update(templateData, { where: { id: templateData.id } })
			equipmentManager.updateTemplateData(templateData)
		})

		ipcMain.handle('add-new-template', async (event, newTemplate) => {
			await Template.create(newTemplate)
		})

		ipcMain.handle('delete-template', async (event, templateId) => {
			let templateIdWithoutTemplate = unwrap(await Template.findOne({ where: { name: 'Без шаблона' } })).id
			await Printer.update({ template_id: templateIdWithoutTemplate }, { where: { template_id: templateId } })
			await Template.destroy({ where: { id: templateId } })
		})
	}
}

export default new TemplateIpc