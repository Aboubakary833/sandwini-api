import Role from '#models/role'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Permission from '#models/permission'
import { directorAbilities, managerAbilities } from '#constants/permissions'
import AbilityService from '#services/ability_service'

const getAllPermissions = async () => Permission.query().select('id', 'name')

async function getDirectorPermissions() {
  return await Permission.query().select('id', 'name').whereIn('name', directorAbilities)
}

async function getManagerPermissions() {
  return await Permission.query().select('id', 'name').whereIn('name', managerAbilities)
}

export default class extends BaseSeeder {
  async run() {
    const roleNames = Object.values(Role.DEFAULTS)
    const roles = await Role.createMany(roleNames.map((name) => ({ name })))

    roles.forEach(async (role) => {
      let permissions: Permission[] = []

      switch (role.name) {
        case Role.DEFAULTS.ADMIN:
          permissions = await getAllPermissions()
          break

        case Role.DEFAULTS.DIRECTOR:
          permissions = await getDirectorPermissions()
          break

        default:
          permissions = await getManagerPermissions()
      }

      new AbilityService().grantManyPermissions(role, permissions)
    })
  }
}
