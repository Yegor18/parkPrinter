import readXlsxFile from 'read-excel-file/node'
import DataSource from './DataSource.js'

class XlsDataSource extends DataSource {
	constructor(pathToFile, pollingFrequency, printers) {
    super(printers)
		this.pathToFile = pathToFile
		this.pollingFrequency = pollingFrequency
		setInterval(async () => {
      let rows = await this.read()
			for (let printer of printers) {
        if (printer.driver.check()) {
          printer.driver.write(rows)
        }
			}
		}, this.pollingFrequency)
	}

	async read() {
		let namesOfVariables = (await readXlsxFile(this.pathToFile)).at(0)
		let map = {}
		namesOfVariables.forEach((name) => {
			map[name] = name
		})
		return (await readXlsxFile(this.pathToFile, { map })).rows
	}
}

export default XlsDataSource