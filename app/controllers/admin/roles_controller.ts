import { ERROR_CODES, SUCCESS_CODES } from '#enums/status_codes'
import { roleMessages } from '#messages/admin'
import Role from '#models/role'
import User from '#models/user'
import HistoryService from '#services/history_service'
import RoleService from '#services/role_service'
import { storeValidator, updateValidator } from '#validators/roles'
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'

@inject()
export default class RolesController {
  constructor(protected roleService: RoleService) {}

  async all() {
    const roles = await this.roleService.fetchAll()

    return {
      data: roles,
    }
  }

  async index() {
    const roles = await this.roleService.fetch()

    return roles.toJSON()
  }

  async store({ auth, request, response }: HttpContext) {
    const { name } = await storeValidator.validate(request.all())
    const role = await Role.create({ name })
    const user = auth.user as User

    await HistoryService.log('role:created', user, { role: role.name })

    return response.ok({
      code: SUCCESS_CODES.ROLE_CREATED,
      message: roleMessages.created,
    })
  }

  async update({ auth, params, request, response }: HttpContext) {
    const role = await Role.find(params.id)
    if (!role) {
      return response.gone({
        code: ERROR_CODES.RESOURCE_NOT_FOUND,
        message: roleMessages.notFound,
      })
    }
    const { name } = await updateValidator(role.id).validate(request.all())
    const user = auth.user as User
    role.name = name
    await Promise.all([role.save(), HistoryService.log('role:edited', user, { role: name })])

    return response.ok({
      code: SUCCESS_CODES.ROLE_UPDATED,
      message: roleMessages.updated,
    })
  }

  async destroy({ auth, params, response }: HttpContext) {
    const role = await Role.find(params.id ?? '')
    if (!role) {
      return response.gone({
        code: ERROR_CODES.RESOURCE_NOT_FOUND,
        message: roleMessages.notFound,
      })
    }
    await Promise.all([
      HistoryService.log('role:deleted', auth.user as User, { role: role.name }),
      role.delete(),
    ])

    return response.ok({
      code: SUCCESS_CODES.ROLE_DELETED,
      message: roleMessages.deleted,
    })
  }
}
