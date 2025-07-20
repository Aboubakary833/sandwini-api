import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import SendOtpTo, { OtpType } from '#actions/send_otp_to'
import CreateResendOtpToken from '#actions/create_resend_opt_token'
import { loginValidator, otpValidator } from '#validators/auth'
import { authMessages } from '#messages/auth'
import { serverErrorMessages } from '#messages/default'
import { ERROR_CODES, SUCCESS_CODES } from '#enums/status_codes'
import HistoryService from '#services/history_service'
import CacheService from '#services/cache_service'
import { inject } from '@adonisjs/core'

const REDIRECTS = {
  verifyEmail: '/email/verify',
  loginVerify: '/login/verify',
  inactive: '/inactive',
  login: '/login',
  home: '/home',
}

export default class SessionController {
  async login({ request, response }: HttpContext) {
    const { email, password } = await loginValidator.validate(request.all())

    let user: User
    try {
      user = await User.verifyCredentials(email, password)
    } catch {
      return response.unauthorized({
        code: ERROR_CODES.AUTH_FAILED,
        message: authMessages.login.failed,
      })
    }

    if (!user.emailVerifiedAt) {
      return this.handleUnverifiedUser(user, response)
    }

    if (!user.active) {
      await HistoryService.log('user:login_failed', user)

      return response.unauthorized({
        code: ERROR_CODES.ACCOUNT_DISABLED,
        message: authMessages.login.inactive,
        redirectTo: REDIRECTS.inactive,
      })
    }

    const token = await this.sendOtpAndCreateToken(user, OtpType.LOGIN, '2h')

    return response.ok({
      code: SUCCESS_CODES.LOGIN_OTP_SENT,
      resendOTPtoken: token,
      message: authMessages.login.verify,
      redirectTo: REDIRECTS.loginVerify,
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

    if (!user.active) {
      return response.unauthorized({
        code: ERROR_CODES.ACCOUNT_DISABLED,
        message: authMessages.login.inactive,
        redirectTo: REDIRECTS.inactive,
      })
    }

    const token = await User.accessTokens.create(user, [])
    const tokenValue = token.value?.release()

    if (!tokenValue) {
      await HistoryService.log('user:login_failed', user)

      return response.badGateway({
        code: ERROR_CODES.INTERNAL_ERROR,
        message: serverErrorMessages.unexpected,
      })
    }

    await Promise.all([
      cache.from('otp').delete(email),
      cache.from('token').delete(email),
      HistoryService.log('user:login_succeeded', user),
    ])

    return response.ok({
      code: SUCCESS_CODES.LOGIN_SUCCESS,
      token: tokenValue,
      redirectTo: REDIRECTS.home,
    })
  }

  async logout({ auth, response }: HttpContext) {
    const user = auth.user as User

    await Promise.all([HistoryService.log('user:logout', user), auth.use('api').invalidateToken()])

    return response.ok({
      code: SUCCESS_CODES.LOGOUT_SUCCESS,
      message: authMessages.logout.succeeded,
      redirectTo: REDIRECTS.login,
    })
  }

  private async handleUnverifiedUser(user: User, response: HttpContext['response']) {
    const otpSender = new SendOtpTo(user.email, OtpType.REGISTER)
    const tokenCreator = new CreateResendOtpToken(user.email, OtpType.REGISTER, '1d')

    await Promise.all([otpSender.handle(), HistoryService.log('user:login_failed', user)])

    const token = await tokenCreator.handle()

    return response.unauthorized({
      code: ERROR_CODES.EMAIL_NOT_VERIFIED,
      message: authMessages.login.emailNotVerified,
      resendOtpToken: token,
      redirectTo: REDIRECTS.verifyEmail,
    })
  }

  private async sendOtpAndCreateToken(user: User, type: OtpType, expire: string) {
    const otpSender = new SendOtpTo(user.email, type)
    const tokenCreator = new CreateResendOtpToken(user.email, type, expire)

    await otpSender.handle()
    return tokenCreator.handle()
  }
}
