import fs from 'node:fs/promises'
import dataSourceManager from '../DataSourceManager.js'
import DataSource from './DataSource.js'
import { MainWindow, checkFile } from '../../helpers.js'

class CsvDataSource extends DataSource {
	constructor(id, type, pathToFile, pollingFrequency) {
		super()
		this.id = id
		this.type = type
		this.pathToFile = pathToFile
		this.pollingFrequency = pollingFrequency
	}

	isValid() {
		return checkFile(this.pathToFile)
	}
	//Файл читается синхронно. Почему? Если файл большой data будет всегда undefined
	//Обязательно протестировать большие файлы!!! Попробовать дробить большие файлы на части поменьше
	async read() {
			try {
				const data = await fs.readFile(this.pathToFile, { encoding: 'utf8' });
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
				return result
			} catch (err) {
				console.log(err);
			}
	}
}

export default CsvDataSource
