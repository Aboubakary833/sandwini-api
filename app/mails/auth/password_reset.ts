import { authMessages } from '#messages/auth'
import env from '#start/env'
import { BaseMail } from '@adonisjs/mail'

export default class PasswordReset extends BaseMail {
  subject: string
  email: string

  constructor(email: string) {
    super()
    this.email = email
    this.subject = authMessages.otpMailSubject.passwordReset
    this.from = env.get('SMTP_FROM_ADDRESS')
  }

  /**
   * The "prepare" method is called automatically when
   * the email is sent or queued.
   */
  prepare() {
    this.message.to(this.email).htmlView('emails/passwordReset')
  }
}
