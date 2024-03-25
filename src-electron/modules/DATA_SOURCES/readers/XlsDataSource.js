import readXlsxFile from 'read-excel-file/node'
import dataSourceManager from '../DataSourceManager.js'
import DataSource from './DataSource.js'
import { MainWindow, checkFile } from '../../helpers.js'

class XlsDataSource extends DataSource {
	constructor(id, type, pathToFile, pollingFrequency) {
		super(() => {
			console.log('\nИСТОЧНИК ДАННЫХ ВКЛЮЧАЕТСЯ')
			this.timer = setInterval(async () => {
				let rows = await this.read()
				console.log('\n===> ОТПРАВЛЕНИЕ ПОДГОТОВЛЕННЫХ ДАННЫХ ИЗ XLS')
				console.log('\nДАННЫЕ')
				console.log(rows)
				dataSourceManager.setDataForSending(this.id, rows)
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

	async read() {
		if (checkFile(this.pathToFile)) {
			let namesOfVariables = (await readXlsxFile(this.pathToFile)).at(0)
			let map = {}
			namesOfVariables.forEach((name) => {
				map[name] = name
			})
			return (await readXlsxFile(this.pathToFile, { map })).rows
		} else {
			this.stop()
			new MainWindow().window.webContents.send('file-does-not-exist', `Файл ${this.pathToFile} не существует!`)
		}
	}
}

export default XlsDataSource