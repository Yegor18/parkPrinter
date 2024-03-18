import net from 'node:net'
import fs from 'node:fs'

export const unwrap = (model_instance) => {
	try {
		return JSON.parse(JSON.stringify(model_instance))
	} catch (error) {
		console.log(error)
	}
}

export class MainWindow {
	constructor() {
		if (!!MainWindow.instance) {
			return MainWindow.instance
		}
		MainWindow.instance = this
		return this
	}
	setWindow(window) {
		this.window = window
	}
}

export function portIsOpen(port) {
	let server = net.createServer()
	server.on('error', (error) => {
		console.log(`===> ПОРТ: ${port}: ОШИБКА ПРИ ЗАПУСКЕ: ${error}`)
		if (error.code === 'EADDRINUSE') {
			new MainWindow().window.webContents.send('opening-port-fail', `Порт ${port} уже занят!`)
		}
	})
	server.listen(port)
	if (server.listening) {
		server.close()
		return true
	} else {
		server.close()
		return false
	}
}

export function checkFile(pathToFile) {
	return fs.existsSync(pathToFile)
}