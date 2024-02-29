import readXlsxFile from 'read-excel-file/node'

class XlsDataSource {
	constructor(pathToFile, pollingFrequency, printers) {
		this.pathToFile = pathToFile
		this.pollingFrequency = pollingFrequency
		this.printers = printers
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