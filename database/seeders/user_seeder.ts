import Role from '#models/role'
import User from '#models/user'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'

export default class extends BaseSeeder {
  async run() {
    const role = (await Role.query().where('name', Role.DEFAULTS.ADMIN).first()) as Role
    await User.create({
      name: 'Admin Logan',
      email: 'adminlogan@gmail.com',
      roleId: role.id,
      emailVerifiedAt: DateTime.now(),
      password: 'Admin@logan1234',
      active: true,
    })
  }
}
