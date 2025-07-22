import Permission from '#models/permission'
import CacheService from '#services/cache_service'

export default class PermissionController {
  private cache: CacheService
  constructor() {
    this.cache = new CacheService().namespace('default')
  }

  async index() {
    let permissions = await this.cache.from('default').get<Permission[]>('permissions')
    if (!permissions) {
      permissions = await Permission.all()
      await this.cache.set('permissions', permissions)
    }

    return {
      data: permissions,
    }
  }
}
