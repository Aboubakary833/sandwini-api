import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import Item from './item.js'
import { type HasMany } from '@adonisjs/lucid/types/relations'

export default class Unit extends BaseModel {
  @column({ isPrimary: true })
  declare code: string

  @column()
  declare label: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => Item)
  declare items: HasMany<typeof Item>
}
