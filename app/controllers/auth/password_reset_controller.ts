import SendOtpTo, { OtpType } from '#actions/send_otp_to'
import { ERROR_CODES, SUCCESS_CODES } from '#enums/status_codes'
import PasswordReset from '#mails/auth/password_reset'
import { authMessages } from '#messages/auth'
import User from '#models/user'
import HistoryService from '#services/history_service'
import AuthValidator from '#validators/auth'
import cache from '@adonisjs/cache/services/main'
import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'
import mail from '@adonisjs/mail/services/main'

export default class PasswordResetController {
  constructor(protected historyService: HistoryService) {}

  async request({ request, response }: HttpContext) {
    const { email, password } = await AuthValidator.resetRequestSchema.validate(request.all())
    const user = await User.findBy('email', email)

    const responseBody = {
      code: ERROR_CODES.RESET_MAIL_SENT,
      message: authMessages.resetPassword.resetMailSent,
      redirect: '/forgot_password/verify',
    }

    if (!user) {
      return response.ok(responseBody)
    }

    const resetCache = cache.namespace('reset_password')
    const sendOtpAction = new SendOtpTo(email, OtpType.RESET_PASSWORD_REQUEST)

    await Promise.all([
      resetCache.set({ key: email, value: hash.make(password), ttl: '30m' }),
      sendOtpAction.handle(),
    ])

    return response.ok(responseBody)
  }

  async verify({ request, response }: HttpContext) {
    const { email, otp } = await AuthValidator.otpSchema.validate(request.all())

    const cacheOtp = await cache.namespace('otp').get<string>({ key: email })
    const cachePassword = await cache.namespace('reset_password').get<string>({ key: email })

    if (!cacheOtp) {
      return response.gone({
        code: ERROR_CODES.OTP_EXPIRED,
        message: authMessages.otp.expired,
        redirectTo: '/forgot_password',
      })
    }

    if (cacheOtp !== otp) {
      return response.gone({
        code: ERROR_CODES.OTP_INVALID,
        message: authMessages.otp.invalid,
      })
    }

    if (!cachePassword) {
      return response.gone({
        code: ERROR_CODES.SESSION_EXPIRED,
        message: authMessages.resetPassword.sessionExpired,
        redirectTo: '/forgot_password',
      })
    }
    const user = await User.findByOrFail('email', email)
    user.password = cachePassword

    await Promise.all([
      user.save(),
      cache.namespace('otp').delete({ key: email }),
      cache.namespace('reset_password').delete({ key: email }),
      mail.send(new PasswordReset(email)),
      this.historyService.savePasswordResetAction(user),
    ])

    return response.ok({
      code: SUCCESS_CODES.PASSWORD_CHANGED,
      message: authMessages.resetPassword.succeeded,
      redirectTo: '/login',
    })
  }
}
