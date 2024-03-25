import fs from 'fs'
import dataSourceManager from '../DataSourceManager.js'
import DataSource from './DataSource.js'
import { MainWindow, checkFile } from '../../helpers.js'

class CsvDataSource extends DataSource {
	constructor(id, type, pathToFile, pollingFrequency) {
		super(() => {
			console.log('\nИСТОЧНИК ДАННЫХ ВКЛЮЧАЕТСЯ')
			this.timer = setInterval(() => {
				this.read()
				console.log('\n===> ОТПРАВЛЕНИЕ ПОДГОТОВЛЕННЫХ ДАННЫХ ИЗ CSV')
				console.log('\nДАННЫЕ')
				console.log(this.data)
				dataSourceManager.setDataForSending(this.id, this.data)
			}, this.pollingFrequency)
		},
			() => {
				console.log('\nИСТОЧНИК ДАННЫХ ВЫКЛЮЧАЕТСЯ')
				clearInterval(this.timer)
			})
		this.id = id
		this.type = type
		this.pathToFile = pathToFile
		this.pollingFrequency = pollingFrequency
	}

	read() {
		if (checkFile(this.pathToFile)) {
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
		} else {
			this.stop()
			new MainWindow().window.webContents.send('file-does-not-exist', `Файл ${this.pathToFile} не существует!`)
		}
	}

	writeData(data) {
		this.data = data
	}
}

export default CsvDataSource