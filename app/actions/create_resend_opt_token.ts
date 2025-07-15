import { CacheProvider } from '@adonisjs/cache/types'
import { OtpType } from './send_otp_to.ts'
import cache from '@adonisjs/cache/services/main'
import encryption from '@adonisjs/core/services/encryption'

export type ResendOtpTokenPayload = {
  email: string
  type: OtpType
}

export default class CreateResendOtpToken {
  private cache: CacheProvider
  public email: string
  public type: OtpType
  public expireIn: string | number

  constructor(email: string, type: OtpType, expireIn: string | number) {
    this.email = email
    this.type = type
    this.expireIn = expireIn
    this.cache = cache.namespace('token')
  }

  async handle(): Promise<string> {
    let token = await this.cache.get<string>({ key: this.email })
    if (!token) {
      token = encryption.encrypt({
        type: this.type,
        email: this.email,
      })

      await this.cache.set({ key: this.email, value: token, ttl: this.expireIn })
    }

    return token
  }
}
