import Permission from '#models/permission'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await Permission.createMany([
      { name: 'roles:listing' },
      { name: 'roles:ajout' },
      { name: 'roles:modification' },
      { name: 'roles:suppression' },
      { name: 'roles:attribution_de_permissions' },

      { name: 'dépôts:listing' },
      { name: 'dépôts:ajout' },
      { name: 'dépôts:modification' },
      { name: 'dépôts:suppression' },

      { name: 'utilisateurs:listing' },
      { name: 'utilisateurs:ajout' },
      { name: 'utilisateurs:modification' },
      { name: 'utilisateurs:suppression' },
      { name: 'utilisateurs:attribution_de_role' },
      { name: 'utilisateurs:activaction_de_compte' },
    ])
  }
}
