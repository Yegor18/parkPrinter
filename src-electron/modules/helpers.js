// для вычленения данных из запроса
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