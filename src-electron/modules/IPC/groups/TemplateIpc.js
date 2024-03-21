import { ipcMain } from 'electron'
import { unwrap } from '../../helpers.js'
import Template from '../../DB/models/Template.js'
import equipmentManager from '../../EQUIPMENT/EquipmentManager.js'

class TemplateIpc {
	constructor() {
		ipcMain.handle('get-templates', async () => {
			return unwrap(await Template.findAll())
		})

		ipcMain.handle('save-template', async (event, templateData) => {
			await Template.update(templateData, { where: { id: templateData.id } })
			equipmentManager.updateTemplateData(templateData)
		})
	}
}

export default new TemplateIpc