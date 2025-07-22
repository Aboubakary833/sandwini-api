import { HttpContext } from '@adonisjs/core/http'
import { PermissionType } from '#constants/permissions'
import { ERROR_CODES } from '#enums/status_codes'

const DEFAULT_MESSAGE = "Vous n'êtes pas autorisé à éffectuer cette action."

/**
 * authorize is an ability check decorator. It check if the current authenticated user
 * has he right to perform the current action(http request).
 */
export default function authorize(ability: PermissionType, message?: string) {
  return (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const result = await originalMethod.apply(this, args)
      const { auth, response } = args[0] as HttpContext
      const user = auth.user

      if (!user?.currentAccessToken?.allows(ability)) {
        return response.forbidden({
          code: ERROR_CODES.FORBIDDEN,
          message: message ?? DEFAULT_MESSAGE,
        })
      }

      return result
    }

    return descriptor
  }
}
