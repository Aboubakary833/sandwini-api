import Permission from '#models/permission'
import Role from '#models/role'
import AbilityService from '#services/ability_service'
import { Job } from '@rlanz/bull-queue'

interface Payload {
  role: string | Role
  permissions: string[] | Permission[]
}

export default class BulkSetRolePermissionJob extends Job {
  static get $$filepath() {
    return import.meta.url
  }

  /**
   * Entry point
   * permissions is an array of Permission id or an array of Permission
   */
  async handle({ role, permissions }: Payload) {
    if (typeof role === 'string') {
      const fetchedRole = await Role.find(role)
      if (!fetchedRole) return
      role = fetchedRole
    }
    const permissionSet = new Set<Permission>()

    for (let p of permissions) {
      if (typeof p === 'string') {
        const permission = await Permission.find(p)
        if (permission) permissionSet.add(permission)
        continue
      }
      permissionSet.add(p)
    }

    await new AbilityService().grantManyPermissions(role, [...permissionSet])
  }

  /**
   * This is an optional method that gets called when the retries has exceeded and is marked failed.
   */
  async rescue() {}
}
