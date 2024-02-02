'use strict'
import sequelize from '../modules/DB/connectionToDB'
import { Model, DataTypes } from 'sequelize'
import Driver from './driver'

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

Printer.hasOne(Driver, { foreignKey: 'id' })

export default Printer