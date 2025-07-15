import SendOtpTo, { OtpType } from '#actions/send_otp_to'
import { authMessages } from '#messages/auth'
import User from '#models/user'
import AuthValidator from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'

export default class RegisterController {
  async signup({ request, response }: HttpContext) {
    const data = await AuthValidator.registerSchema.validate(request.all())
    const user = await User.create(data)
    const sendOtpAction = new SendOtpTo()

    sendOtpAction.handle(user.email, OtpType.REGISTER)

    return response.ok({
      email: user.email,
      messages: authMessages.registered,
    })
  }

  async verify({ request, response }: HttpContext) {
    
  }
}
