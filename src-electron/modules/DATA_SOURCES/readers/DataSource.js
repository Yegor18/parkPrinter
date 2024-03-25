export default class DataSource {
	constructor(onStarted, onStopped) {
		this.isStarted = false
		this.onStarted = onStarted
		this.onStopped = onStopped
	}

	start() {
		this.isStarted = true
		this.onStarted()
	}

	stop() {
		this.isStarted = false
		this.onStopped()
	}
}