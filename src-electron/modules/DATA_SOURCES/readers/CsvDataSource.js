import fs from 'fs'
import dataSourceManager from '../DataSourceManager'

class CsvDataSource {
	constructor(id, type, pathToFile, pollingFrequency) {
		this.id = id
		this.type = type
		this.pathToFile = pathToFile
		this.pollingFrequency = pollingFrequency
		setInterval(() => {
			this.read()
			console.log('\n===> ОТПРАВЛЕНИЕ ПОДГОТОВЛЕННЫХ ДАННЫХ ИЗ CSV')
			console.log('\nДАННЫЕ')
			console.log(this.data)
			dataSourceManager.setDataForSending(this.id, this.data)
		}, this.pollingFrequency)
	}

	read() {
		fs.readFile(this.pathToFile, { encoding: 'utf-8' }, (error, data) => {
			if (!error) {
				let rows = data.split('\"').filter((row) => row !== '' && row !== '\r\n')
				let namesOfVariables = rows[0].split(',')
				let result = []
				for (let i = 1; i < rows.length; i++) {
					let arrayOfValuesInRow = rows[i].split(',')
					let resultRow = {}
					for (let j = 0; j < arrayOfValuesInRow.length; j++) {
						resultRow[namesOfVariables[j]] = arrayOfValuesInRow[j]
					}
					result.push(resultRow)
				}
				this.writeData(result)
			} else {
				console.log(error)
			}
		})
	}

	writeData(data) {
		this.data = data
	}
}

export default CsvDataSource