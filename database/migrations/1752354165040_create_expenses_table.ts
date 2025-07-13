import Expense from '#models/expense'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'expenses'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('user_id').unsigned().nullable().references('users.id').onDelete('SET NULL')
      table.uuid('service_id').unsigned().notNullable().references('services.id').onDelete('CASCADE')
      table.enum('category', Object.values(Expense.CATEGORY)).notNullable()
      table.integer('amount').notNullable()
      table.string('details').notNullable()
      table.enum('status', Object.values(Expense.STATUS)).defaultTo(Expense.STATUS.IN_PROGRESS)

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
