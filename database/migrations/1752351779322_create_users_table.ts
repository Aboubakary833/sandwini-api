import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('role_id').unsigned().nullable().references('roles.id').onDelete('CASCADE')
      table.uuid('service_id').unsigned().nullable().references('services.id').onDelete('CASCADE')
      table.string('name', 150).notNullable()
      table.string('email', 254).notNullable()
      table.datetime('email_verified_at').nullable()
      table.string('password').notNullable()
      table.boolean('active').defaultTo(false)

      table.unique(['username', 'email'])

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
