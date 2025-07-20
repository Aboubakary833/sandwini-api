import CachService from '#services/cache_service'
import { OtpType } from './send_otp_to.ts'
import encryption from '@adonisjs/core/services/encryption'

export type ResendOtpTokenPayload = {
  email: string
  type: OtpType
}

export default class CreateResendOtpToken {
  private cache: CachService
  public email: string
  public type: OtpType
  public expireIn: string | number

  constructor(email: string, type: OtpType, expireIn: string | number) {
    this.email = email
    this.type = type
    this.expireIn = expireIn
    this.cache = new CachService().namespace('token')
  }

  async handle(): Promise<string> {
    let token = await this.cache.get<string>(this.email)
    if (!token) {
      token = encryption.encrypt({
        type: this.type,
        email: this.email,
      })

      await this.cache.set(this.email, token, this.expireIn)
    }

    return token
  }
}
