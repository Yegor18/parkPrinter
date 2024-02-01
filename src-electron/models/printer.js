'use strict'
import sequelize from '../modules/DB/connectionToDB'
import { Model, DataTypes } from 'sequelize'

class Printer extends Model {}

Printer.init({
  name: DataTypes.STRING,
  driver: DataTypes.STRING,
  ipAddress: DataTypes.STRING,
  port: DataTypes.STRING
}, {
  sequelize,
  modelName: 'Printer',
  timestamps: false
})

module.exports = Printer