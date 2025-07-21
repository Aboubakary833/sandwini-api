import Permission from '#models/permission'
import Role from '#models/role'
import CacheService from './cache_service.js'

export default class AbilityService {
  protected cache: CacheService

  constructor() {
    this.cache = new CacheService().namespace('permissions')
  }

  /**
   * Grant a single permission to a role
   */
  async grantPermission(role: Role, permission: string | Permission) {
    if (typeof permission === 'string') {
      const id = permission
      const instance = await Permission.find(id)
      if (!instance) return false
      permission = instance
    }
    const abilities = await this.getRoleAbilities(role)

    if (abilities.has(permission.name)) return false
    abilities.add(permission.name)

    await Promise.all([
      role.related('permissions').attach([permission.id]),
      this.cache.set(role.id, [...abilities]),
    ])

    return true
  }

  async getRoleAbilities(role: Role) {
    let abilities = await this.cache.get<string[]>(role.id)
    if (!abilities) {
      abilities = role.permissions.map((p) => p.name)
    }
    return new Set(abilities)
  }

  async grantManyPermissions(role: Role, permissions: Permission[]) {
    const newAbilities = new Set<string>()
    const ids = new Set<string>()
    let abilities = await this.getRoleAbilities(role)

    permissions.forEach((permission) => {
      if (!abilities.has(permission.name)) {
        ids.add(permission.id)
        newAbilities.add(permission.name)
      }
    })

    abilities = new Set(...abilities, ...newAbilities)
    await Promise.all([
      role.related('permissions').attach([...ids]),
      this.cache.set(role.id, [...abilities]),
    ])
  }

  async withdrawPermission(role: Role, permission: string | Permission) {
    if (typeof permission === 'string') {
      const id = permission
      const instance = await Permission.find(id)
      if (!instance) return false
      permission = instance
    }

    const abilities = await this.getRoleAbilities(role)
    if (!abilities.has(permission.name)) return false

    role.related('permissions').detach([permission.id])
    abilities.delete(permission.name)
    await this.cache.set(role.id, [...abilities])

    return true
  }
}
