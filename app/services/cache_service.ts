import cache from '@adonisjs/cache/services/main'
import { CacheProvider, Duration } from '@adonisjs/cache/types'

export default class CacheService {
  private __namespace: string | undefined
  private provider: CacheProvider

  constructor() {
    this.provider = cache
  }

  public async has(key: string) {
    if (this.__namespace) {
      return this.provider.namespace(this.__namespace).has({ key })
    }
    return this.provider.has({ key })
  }

  public get<T>(key: string) {
    if (this.__namespace) {
      return this.provider.namespace(this.__namespace).get<T | null>({ key })
    }
    return this.provider.get<T | null>({ key })
  }

  public set(key: string, value: any, ttl?: Duration) {
    if (this.__namespace) {
      return this.provider.namespace(this.__namespace).set({ key, value, ttl })
    }
    return this.provider.set({ key, value, ttl })
  }

  public delete(key: string) {
    if (this.__namespace) {
      return this.provider.namespace(this.__namespace).delete({ key })
    }
    return this.provider.delete({ key })
  }

  public async deleteIfExists(key: string) {
    if (await this.has(key)) {
      return this.delete(key)
    }
    return false
  }

  /**
   * Define cache namespace
   */
  public namespace(namespace: string) {
    this.__namespace = namespace
    return this
  }

  /**
   * Define the namespace to which we want to store. Shortcut for namespace method.
   */
  public to(namespace: string) {
    return this.namespace(namespace)
  }

  /**
   * Define the namespace from which we want to get/delete. Shortcut for namespace method.
   */
  public from(namespace: string) {
    return this.namespace(namespace)
  }
}
