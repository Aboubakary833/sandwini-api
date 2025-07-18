import Role from '#models/role'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await Role.createMany(Object.values(Role.DEFAULTS).map((name) => ({ name })))
  }
}
