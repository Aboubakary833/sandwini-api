import CreateResendOtpToken from '#actions/create_resend_opt_token'
import SendOtpTo, { OtpType } from '#actions/send_otp_to'
import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'
import HistoryService from './history_service.js'
import { ERROR_CODES } from '#enums/status_codes'
import { authMessages } from '#messages/auth'
import CacheService from './cache_service.js'
import Role from '#models/role'

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

  async handleCachesDeletionFor(key: string) {
    const cache = new CacheService()
    await Promise.all([cache.from('otp').delete(key), cache.from('token').delete(key)])
  }

  async createAccessTokenFor(user: User) {
    const abilities = this.getAbilitiesFor(user.role)
    const token = await User.accessTokens.create(user, abilities)

    return {
      token: token.value?.release(),
      abilities,
    }
  }

  async deleteAccessTokenFor(user: User) {
    const tokens = await User.accessTokens.all(user)
    tokens.forEach(async (token) => {
      await User.accessTokens.delete(user, token.identifier)
    })
  }

  private getAbilitiesFor(role?: Role) {
    if (!role) return []
    if (role.name === Role.DEFAULTS.ADMIN) return ['*']
    return role.permissions.map((permission) => permission.name)
  }
}
