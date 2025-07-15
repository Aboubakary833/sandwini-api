import { ERROR_CODES } from '#enums/status_codes'
import { authMessages } from '#messages/auth'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class GuestMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const { auth, response } = ctx
    if (auth.user) {
      return response.abort(
        {
          code: ERROR_CODES.FORBIDDEN,
          message: authMessages.unauthorization.forbidden,
        },
        403
      )
    }
    await next()
  }
}
