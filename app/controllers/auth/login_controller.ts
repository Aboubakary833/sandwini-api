import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import SendOtpTo, { OtpType } from '#actions/send_otp_to'
import cache from '@adonisjs/cache/services/main'
import AuthValidator from '#validators/auth'
import { authMessages } from '#messages/auth'
import { serverErrorMessages } from '#messages/default'

export default class LoginController {
  async attempt({ request, response }: HttpContext) {
    const { email, password } = await AuthValidator.loginSchema.validate(request.all())
    const user = await User.verifyCredentials(email, password)

    if (!user.active) {
      return response.abort(authMessages.login.inactive)
    }

    const sendOtpAction = new SendOtpTo()

    sendOtpAction.handle(user.email, OtpType.LOGIN)

    return response.ok({
      email: user.email,
      message: authMessages.login.verify,
    })
  }

  async verify({ request, response }: HttpContext) {
    const { email, otp } = await AuthValidator.otpSchema.validate(request.all())
    const cacheOtp = await cache.namespace('otp').get({ key: email })

    if (!cacheOtp) {
      return response.gone(authMessages.otp.expired)
    }

    if (otp !== cacheOtp) {
      return response.gone(authMessages.otp.invalid)
    }
    const user = await User.query().where('email', email).firstOrFail()
    const token = await User.accessTokens.create(user as User)

    if (!token.value?.release()) {
      return response.badGateway(serverErrorMessages.unexpected)
    }

    return response.ok({
      token: token.value.release(),
    })
  }
}
