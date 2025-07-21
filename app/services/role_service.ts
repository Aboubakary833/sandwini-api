import { HttpContext } from '@adonisjs/core/http'
import Role from '#models/role'
import BaseFilterService from './base_filter_service.js'
import { ERROR_CODES } from '#enums/status_codes'
import { roleMessages } from '#messages/admin'

export default class RoleService extends BaseFilterService {
  fetch() {
    return this.defaultQuery(Role)
  }

  fetchAll() {
    return Role.query().select(['id', 'name'])
  }

  unauthorizedAction(response: HttpContext['response']) {
    return response.unauthorized({
      code: ERROR_CODES.UNAUTHORIZED,
      message: roleMessages.unauthorizedAction,
    })
  }
}
