import { ResendOtpTokenPayload } from '#actions/create_resend_opt_token'
import SendOtpTo, { OtpType } from '#actions/send_otp_to'
import { ERROR_CODES, SUCCESS_CODES } from '#enums/status_codes'
import { authMessages } from '#messages/auth'
import CacheService from '#services/cache_service'
import { resendOtpValidator } from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'
import encryption from '@adonisjs/core/services/encryption'

export default class ResendOtpController {
  async index({ request, response }: HttpContext) {
    const { token, email } = await resendOtpValidator.validate(request.all())
    const cacheToken = await new CacheService().from('token').get<string>(email)

    if (!cacheToken) {
      return this.tokenExpired(response)
    }

    if (token !== cacheToken) {
      return this.tokenExpired(response)
    }
    const tokenPayload = encryption.decrypt<ResendOtpTokenPayload>(cacheToken)

    if (tokenPayload?.email !== email) {
      return this.tokenInvalid(response)
    }

    if (![OtpType.LOGIN, OtpType.REGISTER].includes(tokenPayload.type)) {
      return this.tokenInvalid(response)
    }
    const sendOtpAction = new SendOtpTo(email, tokenPayload.type)
    await sendOtpAction.handle()

    return response.ok({
      code: SUCCESS_CODES.OTP_CODE_RESENT,
      message: authMessages.resendOTP.succeeded,
    })
  }

  private tokenInvalid(response: HttpContext['response']) {
    return response.gone({
      code: ERROR_CODES.TOKEN_INVALID,
      message: authMessages.resendOTP.sessionExpired,
      redirectTo: '/login',
    })
  }

  private tokenExpired(response: HttpContext['response']) {
    return response.gone({
      code: ERROR_CODES.RESEND_TOKEN_EXPIRED,
      message: authMessages.resendOTP.sessionExpired,
      redirectTo: '/login',
    })
  }
}
