import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'services'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.string('name', 150).notNullable()
      table.string('email', 254).notNullable()
      table.string('phone', 25).notNullable()
      table.string('address', 512).notNullable()
      table.integer('surface').notNullable()
      table.boolean('status').defaultTo(true)

      table.unique(['email', 'phone'])

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
