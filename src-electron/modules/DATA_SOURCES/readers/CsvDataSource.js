import fs from 'fs'
import CsvReadableStream from 'csv-reader'

class CsvDataSource {
  constructor(pathToFile, pollingFrequency, printers) {
		this.pathToFile = pathToFile
		this.pollingFrequency = pollingFrequency
		this.printers = printers
    this.rows = []
    let inputStream = fs.createReadStream(this.pathToFile, 'utf8')
    let csvReadableStream = new CsvReadableStream()
		setInterval(async () => {
      inputStream.pipe(csvReadableStream)
        .on('data', (row) => this.rows.push(row))
        .on('end', () => {
          for (let printer of printers) {
            if (printer.driver.check()) {
              printer.driver.write(this.rows)
            }
          }
        })
		}, this.pollingFrequency)
	}
}

export default CsvDataSource