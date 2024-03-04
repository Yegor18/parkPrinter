class DataSource {
  constructor(printers) {
    this.printers = printers
    console.log(this.printers)
  }

  updateListPrinters(printer, operation) {
    switch (operation) {
      case 'update':
        for (let i = 0; i < this.printers.length; i++) {
          if (this.printers[i].id === printer.id) {
            this.printers[i] = printer
          }
        }
        console.log(`=== AFTER UPDATE ${printer.id} ===`)
        break
      case 'add':
        this.printers.push(printer)
        console.log(`=== AFTER ADD ${printer.id} ===`)
        break
      case 'delete':
        this.printers = this.printers.filter((printerInArray) => printerInArray.id !== printer.id)
        console.log(`=== AFTER DELETE ${printer.id} ===`)
        break
    }
    console.log(this.printers)
  }
}

export default DataSource