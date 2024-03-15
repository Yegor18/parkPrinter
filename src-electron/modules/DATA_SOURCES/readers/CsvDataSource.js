import fs from 'fs'
import DataSource from './DataSource.js'

class CsvDataSource extends DataSource {
	constructor(pathToFile, pollingFrequency, printers) {
		super(printers)
		this.pathToFile = pathToFile
		this.pollingFrequency = pollingFrequency
		setInterval(() => {
			this.read()
			for (let printer of this.printers) {
				if (printer.driver.check()) {
					if (this.data !== undefined) {
						console.log('\n===> ОТПРАВЛЕНИЕ ПОДГОТОВЛЕННЫХ ДАННЫХ ИЗ CSV')
						console.log('\nДАННЫЕ')
						console.log(this.data)
						printer.driver.write(this.data)
					}
				}
			}
		}, this.pollingFrequency)
	}

	read() {
		fs.readFile(this.pathToFile, { encoding: 'utf-8' }, (error, data) => {
			if (!error) {
				//Закомментировано ошибочное решение
				//let rows = data.split('\"').filter((row) => row !== '' && row !== '\r\n')
				let rows = data.split('\r\n')
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
	//зачем здесь эта функция? она бессмыслена
	writeData(data) {
		this.data = data
	}
}

export default CsvDataSource
