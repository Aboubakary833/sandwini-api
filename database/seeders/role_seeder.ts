import Role from '#models/role'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import BulkSetRolePermissionJob from '#jobs/bulk_set_role_permission_job'
import queue from '@rlanz/bull-queue/services/main'
import Permission from '#models/permission'
import { directorAbilities, managerAbilities } from '#constants/permissions'

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

      queue.dispatch(BulkSetRolePermissionJob, { role, permissions })
    })
  }
}
