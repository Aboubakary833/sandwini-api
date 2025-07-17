import app from '@adonisjs/core/services/app'
import { HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import { errors as authErrors } from '@adonisjs/auth'
import { errors as limiterErrors } from '@adonisjs/limiter'
import { exceptionMessages } from '#messages/default'
import { ERROR_CODES } from '#enums/status_codes'

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !app.inProduction

  /**
   * The method is used for handling errors and returning
   * response to the client
   */
  async handle(error: unknown, ctx: HttpContext) {
    if (error instanceof limiterErrors.E_TOO_MANY_REQUESTS) {
      const responseBody = {
        code: ERROR_CODES.TOO_MANY_REQUESTS,
        message: exceptionMessages.rateLimitter,
      }
      const headers = error.getDefaultHeaders()

      Object.keys(headers).forEach((header) => {
        ctx.response.header(header, headers[header])
      })

      return ctx.response.status(error.status).send(responseBody)
    }

    if (error instanceof authErrors.E_INVALID_CREDENTIALS) {
      const message = exceptionMessages.invalidCredentials
      return ctx.response.status(400).send({
        code: ERROR_CODES.INVALID_CREDENTIALS,
        message,
      })
    }

    return super.handle(error, ctx)
  }

  /**
   * The method is used to report error to the logging service or
   * the third party error monitoring service.
   *
   * @note You should not attempt to send a response from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}
