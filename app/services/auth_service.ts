import CreateResendOtpToken from '#actions/create_resend_opt_token'
import SendOtpTo, { OtpType } from '#actions/send_otp_to'
import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'
import HistoryService from './history_service.ts'
import { ERROR_CODES } from '#enums/status_codes'
import { authMessages } from '#messages/auth'
import CacheService from './cache_service.ts'

export default class AuthService {
  async handleUnverifiedUser(user: User, response: HttpContext['response']) {
    const otpSender = new SendOtpTo(user.email, OtpType.REGISTER)
    const tokenCreator = new CreateResendOtpToken(user.email, OtpType.REGISTER, '1d')

    await Promise.all([otpSender.handle(), HistoryService.log('user:login_failed', user)])

    const token = await tokenCreator.handle()

    return response.unauthorized({
      code: ERROR_CODES.EMAIL_NOT_VERIFIED,
      message: authMessages.login.emailNotVerified,
      resendOtpToken: token,
      redirectTo: '/email/verify',
    })
  }

  async sendOtpAndCreateResendToken(user: User, type: OtpType, expire: string) {
    const otpSender = new SendOtpTo(user.email, type)
    const tokenCreator = new CreateResendOtpToken(user.email, type, expire)

    await otpSender.handle()
    return tokenCreator.handle()
  }

  async createAccessTokenFor(user: User) {
    const token = await User.accessTokens.create(user, [])
    return token.value?.release()
  }

  async handleCachesDeletionFor(key: string) {
    const cache = new CacheService()
    await Promise.all([cache.from('otp').delete(key), cache.from('token').delete(key)])
  }
}
