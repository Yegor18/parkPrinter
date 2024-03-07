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
		if (Array.isArray(data)) {
			for (let row of data) {
				completedTemplate = this.fillTemplateWithData(row)
				fs.appendFile(this.pathToFile, completedTemplate, (error) => {
					if (error) {
						console.log(error)
					}
				})
			}
		} else if (typeof data === 'object' && data !== null) {
			completedTemplate = this.fillTemplateWithData(data)
			fs.appendFile(this.pathToFile, data, (error) => {
				if (error) {
					console.log(error)
				}
			})
		} else {
			fs.appendFile(this.pathToFile, data, (error) => {
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