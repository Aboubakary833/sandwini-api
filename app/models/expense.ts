import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import User from './user.js'
import { type BelongsTo } from '@adonisjs/lucid/types/relations'
import Service from './service.js'

export default class Expense extends BaseModel {
  static CATEGORY = {
    LOGISTICS: 'Logistique',
    STAFF: 'Staff',
    STOCK: 'Stock',
  } as const

  static STATUS = {
    APPROVED: 'Approuvée',
    IN_PROGRESS: 'En cours',
    REJECTED: 'Rejété',
  } as const

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare serviceId: string

  @column()
  declare category: (typeof Expense.CATEGORY)[keyof typeof Expense.CATEGORY]

  @column()
  declare amount: number

  @column()
  declare details: string

  @column()
  declare status: (typeof Expense.STATUS)[keyof typeof Expense.STATUS]

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Service)
  declare service: BelongsTo<typeof Service>
}
