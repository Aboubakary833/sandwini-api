import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import User from './user.js'
import { type HasMany } from '@adonisjs/lucid/types/relations'
import Expense from './expense.js'
import Stock from './stock.js'

export default class Service extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare email: string

  @column()
  declare phone: string

  @column()
  declare address: string

  @column()
  declare surface: number

  @column()
  declare status: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => User)
  declare users: HasMany<typeof User>

  @hasMany(() => Expense)
  declare expenses: HasMany<typeof Expense>

  @hasMany(() => Stock)
  declare stocks: HasMany<typeof Stock>
}
