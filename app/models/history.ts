import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import User from './user.js'
import { type BelongsTo } from '@adonisjs/lucid/types/relations'

export default class History extends BaseModel {

  static TYPE = {
    LOGIN: "Connexion",
    SIGN_UP: "Inscription",
    CREATE: "Création",
    EDIT: "Modification",
    UPDATE: "Mise à jour",
    DELETE: "Suppression",
    EXPORT: "Export",
    SYNC: "Synchronisation",
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare type: (typeof History.TYPE)[keyof typeof History.TYPE]

  @column()
  declare details: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
