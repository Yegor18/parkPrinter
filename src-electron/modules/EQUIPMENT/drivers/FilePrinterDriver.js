import fs from 'node:fs/promises'
import Equipment from "app/src-electron/modules/EQUIPMENT/drivers/Equipment";
import {checkFile} from "app/src-electron/modules/helpers";

export default class FilePrinterDriver extends Equipment {

	constructor(pathToFile, template) {
		super()
		this.pathToFile = pathToFile
		this.template = template
	}

	close() {
		return true
	}
	start() {
		return checkFile(this.pathToFile)
	}

	async write(data) {
		if (data !== undefined) {
			console.log('\n===> ПОЛУЧЕНЫ ДАННЫЕ ОТ ИСТОЧНИКА ДАННЫХ В Файловом принтере')
			console.log('\nДАННЫЕ')
			console.log(data)
			console.log('\nШАБЛОН')
			console.log(this.template)
			for (let row of data) {
				let completedTemplate = ''
				if (this.template !== '') {
					completedTemplate = this.template
					let arrayOfVarNames = Object.keys(row)
					for (let varName of arrayOfVarNames) {
						while (completedTemplate.includes('${' + varName + '}')) {
							completedTemplate = completedTemplate.replace('${' + varName + '}', row[varName])
						}
					}
					while (completedTemplate.includes(completedTemplate.substring(completedTemplate.indexOf('${'), completedTemplate.indexOf('}')))) {
						completedTemplate = completedTemplate.replace(completedTemplate.substring(completedTemplate.indexOf('${'), completedTemplate.indexOf('}') + 1), '')
						if (completedTemplate.substring(completedTemplate.indexOf('${'), completedTemplate.indexOf('}')) === '') {
							break
						}
					}
				} else {
					completedTemplate = JSON.stringify(row)
				}
				console.log('\nЗАПОЛНЕННЫЙ ШАБЛОН')
				console.log(completedTemplate)
				try {
					await fs.appendFile(this.pathToFile,completedTemplate + '\n')
				} catch(error) {
					if (error) {
						console.log(error)
					}
				}


			}
		}
	}
}
