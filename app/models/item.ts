import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Unit from './unit.js'
import { type BelongsTo } from '@adonisjs/lucid/types/relations'

export default class Item extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare sku: string

  @column()
  declare name: string

  @column()
  declare unitCode: string

  @column()
  declare unitPrice: number

  @column()
  declare cover: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Unit)
  declare unitOfMesure: BelongsTo<typeof Unit>
}
