import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import Role from './role.js'
import { type ManyToMany } from '@adonisjs/lucid/types/relations'

export default class Permission extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @manyToMany(() => Role, {
    pivotTable: 'roles_has_permissions',
  })
  declare roles: ManyToMany<typeof Role>
}
