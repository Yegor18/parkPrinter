import { ipcMain } from "electron"
import { unwrap } from "../../helpers"
import Template from "../../DB/models/Template"

class TemplateIpc {
	constructor() {
		ipcMain.handle('get-templates', async () => {
			return unwrap(await Template.findAll()).map((template) => template.name)
		})
	}
}

export default new TemplateIpc