import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Item from './item.js'
import { type BelongsTo } from '@adonisjs/lucid/types/relations'
import Service from './service.js'

export default class Stock extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare itemId: string

  @column()
  declare serviceId: string

  @column()
  declare quantity: number

  @column()
  declare minQuantity: number

  @column()
  declare maxQuantity: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Item)
  declare item: BelongsTo<typeof Item>

  @belongsTo(() => Service)
  declare service: BelongsTo<typeof Service>
}
