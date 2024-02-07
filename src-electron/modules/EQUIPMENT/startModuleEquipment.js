import getPrinters from './getPrinters'

export default start = () => {
	let printers = getPrinters()
	for (const printer of printers) {
		try {
			if (printer.isActive) {
				printer.driver.model.start()
			}
		} catch(error) {
			console.log('НЕ УДАЛОСЬ ПОДКЛЮЧИТСЯ К ПРИНТЕРУ')
		}
	}
}