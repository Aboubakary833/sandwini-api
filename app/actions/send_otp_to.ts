import VerificationEmail from '#mails/auth/verification_email'
import { authMessages } from '#messages/auth'
import CachService from '#services/cache_service'
import mail from '@adonisjs/mail/services/main'
import { randomBytes, createHash } from 'node:crypto'

export enum OtpType {
  LOGIN = 'login',
  REGISTER = 'register',
  RESET_PASSWORD_REQUEST = 'resetPasswordRequest',
}

export default class SendOtpTo {
  public type: OtpType
  public cache: CachService
  public email: string

  constructor(email: string, type: OtpType) {
    this.email = email
    this.type = type
    this.cache = new CachService().namespace('otp')
  }

  async handle() {
    const subject = authMessages.otpMailSubject[this.type]
    const otp = this.generateOTP()
    const template = `emails/otp/${this.type}`

    await this.cache.set(this.email, otp, '16m')

    if (this.type === OtpType.RESET_PASSWORD_REQUEST) {
      await mail.send(new VerificationEmail(this.email, subject, otp, template))
    } else {
      await mail.sendLater(new VerificationEmail(this.email, subject, otp, template))
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
