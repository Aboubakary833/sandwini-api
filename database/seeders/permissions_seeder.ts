import permissions from '#constants/permissions'
import Permission from '#models/permission'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await Permission.createMany(Object.values(permissions).map((name) => ({ name })))
  }
}
