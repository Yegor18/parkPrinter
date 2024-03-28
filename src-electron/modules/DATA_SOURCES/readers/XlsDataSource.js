import readXlsxFile from 'read-excel-file/node'
import { MainWindow, checkFile } from '../../helpers.js'
import {FileDataSource} from "app/src-electron/modules/DATA_SOURCES/readers/FileDataSource";

class XlsDataSource extends FileDataSource {
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

	async readSourceAndWriteToPrinter(printer) {
		console.log("Read data from source")
			let namesOfVariables = (await readXlsxFile(this.pathToFile)).at(0)
			let map = {}
			namesOfVariables.forEach((name) => {
				map[name] = name
			})
			let result = (await readXlsxFile(this.pathToFile, { map })).rows
		await printer.write(result)
	}
}

export default XlsDataSource
