import { OtpType } from '#actions/send_otp_to'
import { ERROR_CODES, SUCCESS_CODES } from '#enums/status_codes'
import { authMessages } from '#messages/auth'
import User from '#models/user'
import AuthService from '#services/auth_service'
import CacheService from '#services/cache_service'
import HistoryService from '#services/history_service'
import { otpValidator, registerValidator } from '#validators/auth'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

const REDIRECTS = {
  verifyRegister: '/register/verify',
  afterVerification: '/inactive',
}

@inject()
export default class RegisterController {
  constructor(private authService: AuthService) {}

  async signup({ request, response }: HttpContext) {
    const data = await registerValidator.validate(request.all())
    const user = await User.create(data)

    const otpToken = await this.authService.sendOtpAndCreateResendToken(
      user,
      OtpType.REGISTER,
      '1d'
    )

    await HistoryService.log('user:register', user)

    return response.ok({
      code: SUCCESS_CODES.ACCOUNT_CREATED,
      messages: authMessages.register.succeeded,
      resendOTPtoken: otpToken,
      redirectTo: REDIRECTS.verifyRegister,
    })
  }

  @inject()
  async verify({ request, response }: HttpContext, cache: CacheService) {
    const { email, otp } = await otpValidator.validate(request.all())
    const cacheOtp = await cache.from('otp').get(email)

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

    await user.markEmailAsVerified()
    this.authService.handleCachesDeletionFor(email)

    return response.ok({
      code: SUCCESS_CODES.EMAIL_VERIFIED,
      message: authMessages.register.emailVerified,
      redirectTo: REDIRECTS.afterVerification,
    })
  }
}
