import SendOtpTo, { OtpType } from '#actions/send_otp_to'
import { ERROR_CODES, SUCCESS_CODES } from '#enums/status_codes'
import PasswordReset from '#mails/auth/password_reset'
import { authMessages } from '#messages/auth'
import User from '#models/user'
import CacheService from '#services/cache_service'
import HistoryService from '#services/history_service'
import { otpValidator, resetPasswordValidator } from '#validators/auth'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import encryption from '@adonisjs/core/services/encryption'
import mail from '@adonisjs/mail/services/main'

const REDIRECTS = {
  base: '/forgot_password',
  verify: '/forgot_password/verify',
  login: '/login',
}

@inject()
export default class PasswordResetController {
  constructor(protected cache: CacheService) {}

  async request({ request, response }: HttpContext) {
    const { email, password } = await resetPasswordValidator.validate(request.all())
    const user = await User.findBy('email', email)

    if (!user) {
      return response.ok({
        code: SUCCESS_CODES.RESET_MAIL_SENT,
        message: authMessages.resetPassword.resetMailSent,
        redirect: REDIRECTS.verify,
      })
    }

    const sendOtpAction = new SendOtpTo(email, OtpType.RESET_PASSWORD_REQUEST)
    const hashedPassword = encryption.encrypt(password)

    await Promise.all([
      this.cache.to('reset_password').set(email, hashedPassword, '30m'),
      sendOtpAction.handle(),
    ])

    return response.ok({
      code: SUCCESS_CODES.RESET_MAIL_SENT,
      message: authMessages.resetPassword.resetMailSent,
      redirect: REDIRECTS.verify,
    })
  }

  async verify({ request, response }: HttpContext) {
    const { email, otp } = await otpValidator.validate(request.all())

    const [otpCache, passwordCache] = await Promise.all([
      this.cache.from('otp').get<string>(email),
      this.cache.from('reset_password').get<string>(email),
    ])

    if (!otpCache) {
      return response.gone({
        code: ERROR_CODES.OTP_EXPIRED,
        message: authMessages.otp.expired,
        redirectTo: REDIRECTS.base,
      })
    }

    if (otp !== otpCache) {
      return response.gone({
        code: ERROR_CODES.OTP_INVALID,
        message: authMessages.otp.invalid,
        redirectTo: REDIRECTS.base,
      })
    }

    if (!passwordCache) {
      return response.gone({
        code: ERROR_CODES.SESSION_EXPIRED,
        message: authMessages.resetPassword.sessionExpired,
        redirectTo: REDIRECTS.base,
      })
    }

    const user = await User.findByOrFail('email', email)
    const decryptedPassword = encryption.decrypt<string>(passwordCache)
    if (!decryptedPassword) {
      return response.gone({
        code: ERROR_CODES.INTERNAL_ERROR,
        message: authMessages.resetPassword.unexpected,
        redirectTo: REDIRECTS.base,
      })
    }
    user.password = decryptedPassword

    await Promise.all([
      user.save(),
      this.cache.from('otp').delete(email),
      this.cache.from('reset_password').delete(email),
      mail.send(new PasswordReset(email)),
      HistoryService.log('user:reset', user),
    ])

    return response.ok({
      code: SUCCESS_CODES.PASSWORD_CHANGED,
      message: authMessages.resetPassword.succeeded,
      redirectTo: REDIRECTS.login,
    })
  }
}
