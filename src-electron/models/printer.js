'use strict'
import sequelize from '../modules/DB/connectionToDB'
import { Model, DataTypes } from 'sequelize'
import Driver from './Driver'

class Printer extends Model { }

Printer.init({
  name: DataTypes.STRING,
  driver_id: DataTypes.INTEGER,
  ipAddress: DataTypes.STRING,
  port: DataTypes.STRING
}, {
  sequelize,
  modelName: 'Printer',
  timestamps: false
})

Printer.belongsTo(Driver, { foreignKey: 'driver_id' })

export default Printer