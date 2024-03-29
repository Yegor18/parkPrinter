class DataSource {
	//***Избавиться от этого Класса
	//Принтеры получать с помощью запроса в базу данных
	constructor(printers) {
		this.printers = printers
	}

	updateListPrinters(printer, operation) {
		switch (operation) {
			case 'add':
				this.printers.push(printer)
				break
			case 'delete':
				this.printers = this.printers.filter((printerInArray) => printerInArray.id !== printer.id)
				break
		}
	}
}

export default DataSource
