import { ipcMain } from 'electron'
import { unwrap } from '../../helpers.js'
import Template from '../../DB/models/Template.js'

class TemplateIpc {
	constructor() {
		ipcMain.handle('get-templates', async () => {
			return unwrap(await Template.findAll())
		})

		ipcMain.handle('save-template', async (event, templateData) => {
			console.log(templateData)
			await Template.update(templateData, { where: { id: templateData.id } })
		})
	}
}

export default new TemplateIpc