import AuthValidator from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'

export default class PasswordResetController {
  async request({ request, response }: HttpContext) {
    const { email, password } = await AuthValidator.resetRequestSchema.validate(request.all())
  }
}
