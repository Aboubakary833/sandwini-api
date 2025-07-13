import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.string('sku', 64).notNullable()
      table.string('name').notNullable()
      table.string('unit_code').unsigned().notNullable().references('units.code').onDelete('CASCADE')
      table.integer('unit_price').notNullable()
      table.string('cover').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
