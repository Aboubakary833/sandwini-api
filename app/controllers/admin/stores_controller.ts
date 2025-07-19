import { ERROR_CODES, SUCCESS_CODES } from '#enums/status_codes'
import { serviceMessages } from '#messages/admin'
import Service from '#models/service'
import User from '#models/user'
import HistoryService from '#services/history_service'
import StoreService from '#services/store_service'
import { createValidator, updateValidator } from '#validators/service'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class StoreController {
  constructor(
    protected storeService: StoreService,
    protected historyService: HistoryService
  ) {}
  /**
   * Display a list of resource
   */
  async index() {
    const services = await this.storeService.fetch()

    return services.toJSON()
  }

  /**
   * Handle form submission for the create action
   */
  async store({ auth, request, response }: HttpContext) {
    const formData = await createValidator.validate(request.all())
    const service = await Service.create(formData)
    const user = auth.user as User

    await this.historyService.saveServiceCreateAction(user, service)

    return response.ok({
      code: SUCCESS_CODES.SERVICE_CREATED,
      message: serviceMessages.created,
    })
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ auth, request, params, response }: HttpContext) {
    const service = await Service.find(params.id)
    if (!service) {
      return response.gone({
        code: ERROR_CODES.RESOURCE_NOT_FOUND,
        message: serviceMessages.notFound,
      })
    }
    const formData = await updateValidator(service.id).validate(request.all())
    const user = auth.user as User

    await Promise.all([
      service.merge(formData).save(),
      this.historyService.saveServiceUpdateAction(user, service),
    ])

    return response.ok({
      code: SUCCESS_CODES.SERVICE_UPDATED,
      message: serviceMessages.updated,
    })
  }
  /**
   * Delete record
   */
  async destroy({ params, response }: HttpContext) {
    const service = await Service.find(params.id)
    if (!service) {
      return response.gone({
        code: ERROR_CODES.RESOURCE_NOT_FOUND,
        message: serviceMessages.notFound,
      })
    }

    await service.delete()

    return response.ok({
      code: SUCCESS_CODES.SERVICE_DELETED,
      message: serviceMessages.deleted,
    })
  }
}
