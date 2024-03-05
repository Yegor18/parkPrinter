class DataSource {
  constructor(printers) {
    this.printers = printers
  }

  updateListPrinters(printer, operation) {
    switch (operation) {
      case 'update':
        for (let i = 0; i < this.printers.length; i++) {
          if (this.printers[i].id === printer.id) {
            this.printers[i] = printer
          }
        }
        break
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