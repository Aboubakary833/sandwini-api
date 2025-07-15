import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import SendOtpTo, { OtpType } from '#actions/send_otp_to'
import cache from '@adonisjs/cache/services/main'
import AuthValidator from '#validators/auth'
import { authMessages } from '#messages/auth'
import { serverErrorMessages } from '#messages/default'
import CreateResendOtpToken from '#actions/create_resend_opt_token'
import { ERROR_CODES, SUCCESS_CODES } from '#enums/status_codes'

export default class LoginController {
  async attempt({ request, response }: HttpContext) {
    const { email, password } = await AuthValidator.loginSchema.validate(request.all())
    const user = await User.verifyCredentials(email, password)
    let sendOtpAction = new SendOtpTo(email, OtpType.LOGIN)
    let createResendOtpTokenAction = new CreateResendOtpToken(email, OtpType.LOGIN, '2h')

    // If user email is not verified, send him a verification mail
    if (!user.emailVerifiedAt) {
      sendOtpAction.type = OtpType.REGISTER
      createResendOtpTokenAction.type = OtpType.REGISTER
      createResendOtpTokenAction.expireIn = '1d'

      await sendOtpAction.handle()

      const token = await createResendOtpTokenAction.handle()

      return response.unauthorized({
        code: ERROR_CODES.EMAIL_NOT_VERIFIED,
        message: authMessages.login.emailNotVerified,
        resendOtpToken: token,
        redirectTo: '/email/verify',
      })
    }

    if (!user.active) {
      return response.unauthorized({
        code: ERROR_CODES.ACCOUNT_DISABLED,
        message: authMessages.login.inactive,
        redirectTo: '/inactive',
      })
    }
    await sendOtpAction.handle()

    const token = await createResendOtpTokenAction.handle()

    return response.ok({
      code: SUCCESS_CODES.LOGIN_OTP_SENT,
      resendOtpToken: token,
      message: authMessages.login.verify,
    })
  }

  async verify({ request, response }: HttpContext) {
    const { email, otp } = await AuthValidator.otpSchema.validate(request.all())
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
    const user = await User.query().where('email', email).firstOrFail()
    const token = await User.accessTokens.create(user as User, [
      //abilities coming soon
    ])

    if (!token.value?.release()) {
      return response.badGateway({
        code: ERROR_CODES.INTERNAL_ERROR,
        message: serverErrorMessages.unexpected,
      })
    }

    await cache.namespace('otp').delete({ key: email })
    await cache.namespace('token').delete({ key: email })

    return response.ok({
      code: SUCCESS_CODES.LOGIN_SUCCESS,
      token: token.value.release(),
    })
  }
}
