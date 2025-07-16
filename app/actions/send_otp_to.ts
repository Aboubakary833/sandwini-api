import VerificationEmailNotification from '#mails/verification_email_notification'
import { authMessages } from '#messages/auth'
import cache from '@adonisjs/cache/services/main'
import { CacheProvider } from '@adonisjs/cache/types'
import mail from '@adonisjs/mail/services/main'
import { randomBytes, createHash } from 'node:crypto'

export enum OtpType {
  LOGIN = 'login',
  REGISTER = 'register',
  RESET_PASSWORD_REQUEST = 'resetPasswordRequest',
  PASSWORD_RESET = 'passwordReset',
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
    const subject = authMessages.otpMailSubject[this.type]
    const otp = this.generateOTP()
    const template = `emails/otp/${this.type}`

    await this.cache.set({ key: this.email, value: otp, ttl: '16m' })

    if ([OtpType.LOGIN, OtpType.REGISTER].includes(this.type)) {
      await mail.sendLater(new VerificationEmailNotification(this.email, subject, otp, template))
    } else {
      await mail.send(new VerificationEmailNotification(this.email, subject, otp, template))
    }
  }

  generateOTP(length: number = 6): string {
    const buffer = randomBytes(64)
    const otp = (Number.parseInt(createHash('sha256').update(buffer).digest('hex'), 16) % 1_000_000)
      .toString()
      .slice(0, length)

    return otp.padStart(length, '0')
  }
}
