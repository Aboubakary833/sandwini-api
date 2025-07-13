import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'stocks'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('item_id').unsigned().notNullable().references('items.id').onDelete('CASCADE')
      table.uuid('service_id').unsigned().notNullable().references('services.id').onDelete('CASCADE')
      table.decimal('quantity', 10, 2).notNullable()
      table.decimal('min_quantity', 10, 2).notNullable()
      table.decimal('max_quantity', 10, 2).notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
