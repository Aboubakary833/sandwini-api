import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import SendOtpTo, { OtpType } from '#actions/send_otp_to'
import cache from '@adonisjs/cache/services/main'
import AuthValidator from '#validators/auth'
import { authMessages } from '#messages/auth'
import { serverErrorMessages } from '#messages/default'
import CreateResendOtpToken from '#actions/create_resend_opt_token'
import { ERROR_CODES, SUCCESS_CODES } from '#enums/status_codes'
import HistoryService from '#services/history_service'

export default class SessionController {
  constructor(protected historyService: HistoryService) {}

  async login({ request, response }: HttpContext) {
    const { email, password } = await AuthValidator.loginSchema.validate(request.all())
    const user = await User.verifyCredentials(email, password)
    let sendOtpAction = new SendOtpTo(email, OtpType.LOGIN)
    let createResendOtpTokenAction = new CreateResendOtpToken(email, OtpType.LOGIN, '2h')

    // If user email is not verified, send him a verification mail
    if (!user.emailVerifiedAt) {
      sendOtpAction.type = OtpType.REGISTER
      createResendOtpTokenAction.type = OtpType.REGISTER
      createResendOtpTokenAction.expireIn = '1d'

      await Promise.all([sendOtpAction.handle(), this.historyService.saveLoginAction(user, false)])
      const token = await createResendOtpTokenAction.handle()

      return response.unauthorized({
        code: ERROR_CODES.EMAIL_NOT_VERIFIED,
        message: authMessages.login.emailNotVerified,
        resendOtpToken: token,
        redirectTo: '/email/verify',
      })
    }

    if (!user.active) {
      await this.historyService.saveLoginAction(user, false)

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
      resendOTPtoken: token,
      message: authMessages.login.verify,
      redirectTo: '/login/verify',
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
    const user = await User.findByOrFail('email', email)
    const token = await User.accessTokens.create(user as User, [
      //abilities coming soon
    ])

    if (!token.value?.release()) {
      await this.historyService.saveLoginAction(user, false)

      return response.badGateway({
        code: ERROR_CODES.INTERNAL_ERROR,
        message: serverErrorMessages.unexpected,
      })
    }

    await Promise.all([
      cache.namespace('otp').delete({ key: email }),
      cache.namespace('token').delete({ key: email }),
    ])

    await this.historyService.saveLoginAction(user, true)

    return response.ok({
      code: SUCCESS_CODES.LOGIN_SUCCESS,
      token: token.value.release(),
      redirectTo: '/home',
    })
  }

  async logout({ auth, response }: HttpContext) {
    await this.historyService.saveLogoutAction(auth.user as User)
    await auth.use('api').invalidateToken()

    return response.ok({
      code: SUCCESS_CODES.LOGOUT_SUCCESS,
      message: authMessages.logout.succeeded,
      redirectTo: '/login',
    })
  }
}
