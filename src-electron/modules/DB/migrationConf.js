import { Umzug, SequelizeStorage } from 'umzug'
import sequelize from './connectionToDB.js'

const umzug = new Umzug({
	migrations: [
		require('./migrations/20240124155515-create-setting.js'),
		require('./migrations/20240201142153-create-driver.js'),
		require('./migrations/20240201125821-create-printer.js'),
		require('./seeders/20240131114501-settings.js'),
		require('./seeders/20240201142215-drivers.js'),
		require('./seeders/20240201130409-printers.js'),
		require('./migrations/20240207142450-add-column-to-printer-table.js'),
		require('./migrations/20240216084733-create-type-of-data-source.js'),
		require('./migrations/20240214085155-create-data-source.js'),
		require('./seeders/20240216090424-types-of-data-sources.js'),
		require('./migrations/20240220080557-add-column-to-printer-table.js'),
		require('./seeders/20240220083617-add-file-tcp-drivers.js'),
		require('./migrations/20240227113713-add-column-to-printer-table.js'),
		require('./migrations/20240305075813-create-template.js'),
		require('./seeders/20240305082658-example-template.js'),
		require('./migrations/20240305081851-add-column-to-printer-table.js')
	],
	context: sequelize.getQueryInterface(),
	storage: new SequelizeStorage({ sequelize }),
	logger: console
})

export default umzug