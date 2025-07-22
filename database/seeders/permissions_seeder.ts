import { allAbilities } from '#constants/permissions'
import Permission from '#models/permission'
import CacheService from '#services/cache_service'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    const cache = new CacheService().namespace('default')
    const data = allAbilities.map((name) => ({ name }))
    const permissions = await Permission.createMany(data)

    await cache.set('permissions', permissions)
  }
}
