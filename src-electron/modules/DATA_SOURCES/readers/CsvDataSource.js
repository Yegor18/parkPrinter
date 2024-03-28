import fs from 'node:fs/promises'
import { MainWindow, checkFile } from '../../helpers.js'
import {FileDataSource} from "app/src-electron/modules/DATA_SOURCES/readers/FileDataSource";

class CsvDataSource extends FileDataSource {
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
	//написать новый метод
	async readSourceAndWriteToPrinter(printer) {
		console.log("Read data from source")
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
				await printer.write(result)
			} catch (err) {
				console.log(err);
			}
	}
}

export default CsvDataSource
