import readXlsxFile from 'read-excel-file/node'

class XlsReader {
	constructor(pathToFile) {
		this.pathToFile = pathToFile
	}

	async read() {
		let namesOfVariables = (await readXlsxFile(this.pathToFile)).at(0)
		let map = {}
		namesOfVariables.forEach((name) => {
			map[name] = name
		})
		// let data ='DATA: ' + (await readXlsxFile(this.pathToFile, { map })).rows.map((row) => {
		// 	return JSON.stringify(row)
		// })
		// return data
    return (await readXlsxFile(this.pathToFile, { map })).rows
	}
}

export default XlsReader