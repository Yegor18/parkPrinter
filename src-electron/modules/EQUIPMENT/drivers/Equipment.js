import dataSourceManager from "app/src-electron/modules/DATA_SOURCES/DataSourceManager";

// сделать геттер на принтеры по id
export default class Equipment {
	check() {
		return null
	}
	start() {
		return null
	}
	 setDataSourceIsActive(dataSourceId,isActive) {
		this.isActive = isActive
		let source = dataSourceManager.get(dataSourceId)
		if (isActive) {
			//получить источник данных
			//подписать этот источник на принтер
			source.requestToConstantlySendDataToPrinter(dataSourceId)
		} else {
			source.requestToTurnOffSendDataToPrinter(dataSourceId)
		}
	}
}
