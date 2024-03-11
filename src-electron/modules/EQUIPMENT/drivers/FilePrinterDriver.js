import fs from 'fs'

export default class FilePrinterDriver {
	constructor(pathToFile, template) {
		this.pathToFile = pathToFile
		this.template = template
		this.isStarted = false
	}

	start() {
		this.isStarted = true
		return true
	}

	stop() {
		this.isStarted = false
		return true
	}

	check() {
		return this.isStarted
	}

	write(data) {
		let completedTemplate = ''
		for (let row of data) {
			completedTemplate = this.fillTemplateWithData(row)
			fs.appendFile(this.pathToFile, completedTemplate + '\n', (error) => {
				if (error) {
					console.log(error)
				}
			})
		}
	}

	fillTemplateWithData(row) {
		let arrayOfVarNames = Object.keys(row)
		let result = this.template
		for (let varName of arrayOfVarNames) {
			result = result.replace('${' + varName + '}', row[varName])
		}
		return result
	}
}