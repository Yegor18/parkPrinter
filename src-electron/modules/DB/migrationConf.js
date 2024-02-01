import { Umzug, SequelizeStorage } from 'umzug'
import sequelize from './connectionToDB.js'

const umzug = new Umzug({
  migrations: [
    require('../../migrations/20240124155515-create-setting.js'),
    require('../../seeders/20240131114501-first-settings.js'),
    require('../../migrations/20240201125821-create-printer.js'),
    require('../../seeders/20240201130409-printers.js'),
    require('../../migrations/20240201142153-create-driver.js'),
    require('../../seeders/20240201142215-drivers.js')
  ],
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console
})

export default umzug