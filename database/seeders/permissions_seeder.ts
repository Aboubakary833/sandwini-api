import Permission from '#models/permission'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await Permission.createMany([
      { name: 'role:ajouter' },
      { name: 'role:modifier' },
      { name: 'role:supprimer' },
      { name: 'role:attribuer_permissions' },
    ])
  }
}
