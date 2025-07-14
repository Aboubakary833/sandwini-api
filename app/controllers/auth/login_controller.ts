import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import SendOtpTo, { OtpType } from '#actions/send_otp_to'
import cache from '@adonisjs/cache/services/main'
import AuthValidator from '#validators/auth'

export default class LoginController {
  async attempt({ i18n, request, response }: HttpContext) {
    const { email, password } = await AuthValidator.loginSchema.validate(request.all())
    const user = await User.verifyCredentials(email, password)
    const sendOtpAction = new SendOtpTo()

    sendOtpAction.handle(user.email, OtpType.LOGIN)

    return response.ok({
      email: user.email,
      message: i18n.t('messages.login.verify'),
    })
  }

  async verify({ i18n, request, response }: HttpContext) {
    const { email, otp } = await AuthValidator.otpSchema.validate(request.all())
    const cacheOtp = await cache.namespace('otp').get({ key: email })

    if (!cacheOtp) {
      return response.gone(i18n.t('messages.otp.expired'))
    }

    if (otp !== cacheOtp) {
      return response.gone(i18n.t('messages.invalid'))
    }
    const user = await User.query().where('email', email).firstOrFail()
    const token = await User.accessTokens.create(user as User)

    if (!token.value?.release()) {
      return response.badGateway(i18n.t('messages.unexpectedError'))
    }

    return response.ok({
      token: token.value.release(),
    })
  }
}
