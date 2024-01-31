import { Umzug, SequelizeStorage } from 'umzug'
import sequelize from './connectionToDB.js'

const umzug = new Umzug({
  migrations: [
    require('../../migrations/20240124155515-create-setting.js'),
    require('../../seeders/20240131114501-first-settings.js')
  ],
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console
})

export default umzug