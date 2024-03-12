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
		console.log('\n===> ПОЛУЧЕНЫ ДАННЫЕ ОТ ИСТОЧНИКА ДАННЫХ В Файловом принтере')
		console.log('\nДАННЫЕ')
		console.log(data)
		console.log('\nШАБЛОН')
		console.log(this.template)
		for (let row of data) {
			let completedTemplate = this.template
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
			console.log('\nЗАПОЛНЕННЫЙ ШАБЛОН')
			console.log(completedTemplate)
			fs.appendFile(this.pathToFile, completedTemplate + '\n', (error) => {
				if (error) {
					console.log(error)
				}
			})
		}
	}
}