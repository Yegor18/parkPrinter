'use strict'
import sequelize from '../modules/DB/connectionToDB'
const { Model, DataTypes } = require('sequelize')

class Setting extends Model {}

Setting.init({
  name: DataTypes.STRING,
  value: DataTypes.STRING
}, {
  sequelize,
  modelName: 'Setting',
  timestamps: false
})

module.exports = Setting