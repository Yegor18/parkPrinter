'use strict'
import sequelize from '../modules/DB/connectionToDB'
import { Model, DataTypes } from 'sequelize'

class Setting extends Model {}

Setting.init({
  name: DataTypes.STRING,
  value: DataTypes.STRING
}, {
  sequelize,
  modelName: 'Setting',
  timestamps: false
})

export default Setting