import env from '#start/env'
import { BaseMail } from '@adonisjs/mail'

export default class VerificationEmailNotification extends BaseMail {
  subject: string
  email: string
  otp: string
  template: string

  constructor(email: string, subject: string, otp: string, template: string) {
    super()
    this.otp = otp
    this.email = email
    this.template = template
    this.subject = subject
  }

  /**
   * The "prepare" method is called automatically when
   * the email is sent or queued.
   */
  prepare() {
    this.message
      .to(this.email)
      .from(env.get('SMTP_FROM_ADDRESS'))
      .subject(this.subject)
      .htmlView(this.template, { otp: this.otp })
  }
}
