import sequelize from '../connectionToDB.js'
import { Model, DataTypes } from 'sequelize'

class DataSource extends Model { }

DataSource.init({
  name: DataTypes.STRING,
  type: DataTypes.STRING,
  config: DataTypes.STRING
}, {
  sequelize,
  modelName: 'DataSource',
	timestamps: false
})

export default DataSource