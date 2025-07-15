import env from '#start/env'
import cache from '@adonisjs/cache/services/main'
import { CacheProvider } from '@adonisjs/cache/types'
import mail from '@adonisjs/mail/services/main'
import { randomBytes, createHash } from 'node:crypto'

export enum OtpType {
  LOGIN = 'login',
  REGISTER = 'register',
}

export default class SendOtpTo {
  public type: OtpType
  public cache: CacheProvider
  public email: string

  constructor(email: string, type: OtpType) {
    this.email = email
    this.type = type
    this.cache = cache.namespace('otp')
  }

  async handle() {
    if (await this.cache.has({ key: this.email })) {
      await this.cache.delete({ key: this.email })
    }
    const otp = this.generateOTP()
    const template = `emails/otp/${this.type}`

    await this.cache.set({ key: this.email, value: otp, ttl: '16m' })

    await mail.sendLater((message) => {
      message
        .to(this.email)
        .from(env.get('SMTP_FROM_ADDRESS'))
        .subject('Verification')
        .htmlView(template, { otp })
    })
  }

  generateOTP(length: number = 6): string {
    const buffer = randomBytes(64)
    const otp = (Number.parseInt(createHash('sha256').update(buffer).digest('hex'), 16) % 1_000_000)
      .toString()
      .slice(0, length)

    return otp.padStart(length, '0')
  }
}
