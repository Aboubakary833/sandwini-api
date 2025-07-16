import { ResendOtpTokenPayload } from '#actions/create_resend_opt_token'
import SendOtpTo, { OtpType } from '#actions/send_otp_to'
import { ERROR_CODES, ErrorCode, SUCCESS_CODES } from '#enums/status_codes'
import { authMessages } from '#messages/auth'
import { resendOtpValidator } from '#validators/auth'
import cache from '@adonisjs/cache/services/main'
import type { HttpContext } from '@adonisjs/core/http'
import encryption from '@adonisjs/core/services/encryption'

export default class ResendOtpController {
  async index({ request, response }: HttpContext) {
    const { token, email } = await resendOtpValidator.validate(request.all())
    const cacheToken = await cache.namespace('token').get({ key: email })
    const errorResponseBody = {
      code: ERROR_CODES.RESEND_TOKEN_EXPIRED as ErrorCode,
      message: authMessages.resendOTP.sessionExpired,
      redirectTo: '/login',
    }

    if (!cacheToken) {
      return response.gone(errorResponseBody)
    }

    if (token !== cacheToken) {
      return response.gone(errorResponseBody)
    }
    const tokenPayload = encryption.decrypt<ResendOtpTokenPayload>(cacheToken)

    if (tokenPayload?.email !== email) {
      errorResponseBody.code = ERROR_CODES.TOKEN_INVALID
      return response.gone(errorResponseBody)
    }

    if (![OtpType.LOGIN, OtpType.REGISTER].includes(tokenPayload.type)) {
      errorResponseBody.code = ERROR_CODES.TOKEN_INVALID
      return response.gone(errorResponseBody)
    }
    const sendOtpAction = new SendOtpTo(email, tokenPayload.type)
    await sendOtpAction.handle()

    return response.ok({
      code: SUCCESS_CODES.OTP_CODE_RESENT,
      message: authMessages.resendOTP.succeeded,
    })
  }
}
