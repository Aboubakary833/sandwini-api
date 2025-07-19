import CreateResendOtpToken from '#actions/create_resend_opt_token'
import SendOtpTo, { OtpType } from '#actions/send_otp_to'
import { ERROR_CODES, SUCCESS_CODES } from '#enums/status_codes'
import { authMessages } from '#messages/auth'
import User from '#models/user'
import HistoryService from '#services/history_service'
import { otpValidator, registerValidator } from '#validators/auth'
import cache from '@adonisjs/cache/services/main'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class RegisterController {
  async signup({ request, response }: HttpContext) {
    const data = await registerValidator.validate(request.all())
    const user = await User.create(data)

    const sendOtpAction = new SendOtpTo(user.email, OtpType.REGISTER)
    const createResendOtpTokenAction = new CreateResendOtpToken(user.email, OtpType.REGISTER, '1d')

    await Promise.all([HistoryService.log('user:register', user), sendOtpAction.handle()])
    const resendOTPmailToken = await createResendOtpTokenAction.handle()

    return response.ok({
      code: SUCCESS_CODES.ACCOUNT_CREATED,
      messages: authMessages.register.succeeded,
      resendOTPtoken: resendOTPmailToken,
      redirectTo: '/register/verify',
    })
  }

  async verify({ request, response }: HttpContext) {
    const { email, otp } = await otpValidator.validate(request.all())

    const cacheOtp = await cache.namespace('otp').get({ key: email })

    if (!cacheOtp) {
      return response.gone({
        code: ERROR_CODES.OTP_EXPIRED,
        message: authMessages.otp.expired,
      })
    }

    if (otp !== cacheOtp) {
      return response.gone({
        code: ERROR_CODES.OTP_INVALID,
        message: authMessages.otp.invalid,
      })
    }

    const user = await User.findByOrFail('email', email)
    await Promise.all([
      user.markEmailAsVerified(),
      cache.namespace('otp').delete({ key: email }),
      cache.namespace('token').delete({ key: email }),
    ])

    return response.ok({
      code: SUCCESS_CODES.EMAIL_VERIFIED,
      message: authMessages.register.emailVerified,
      redirectTo: '/inactive',
    })
  }
}
