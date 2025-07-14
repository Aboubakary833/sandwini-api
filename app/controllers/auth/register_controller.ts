import SendOtpTo, { OtpType } from '#actions/send_otp_to'
import User from '#models/user'
import AuthValidator from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'

export default class RegisterController {
  async signup({ i18n, request, response }: HttpContext) {
    const data = await AuthValidator.registerSchema.validate(request.all())
    const user = await User.create(data)
    const sendOtpAction = new SendOtpTo()

    sendOtpAction.handle(user.email, OtpType.REGISTER)

    return response.ok({
      email: user.email,
      messages: i18n.t('messages.registered'),
    })
  }

  async verify({ i18n, request, response }: HttpContext) {
    
  }
}
