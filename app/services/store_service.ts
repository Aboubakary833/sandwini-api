import { HttpContext } from '@adonisjs/core/http'
import Service from '#models/service'
import BaseFilterService from './base_filter_service.ts'

export default class StoreService extends BaseFilterService {
  protected status: boolean | undefined
  protected fields: string[] = [
    'id',
    'name',
    'email',
    'phone',
    'address',
    'surface',
    'status',
    'created_at',
  ]
  protected searchFields: string[] = ['name', 'email', 'phone', 'address']

  constructor(protected ctx: HttpContext) {
    super(ctx)
    this.status = ctx.request.input('status', undefined)
  }
  fetch() {
    const query = Service.query().select(this.fields)
    if (this.status !== undefined) query.where('status', this.status)
    if (this.search) {
      query.where(this.applySearch.bind(this))
    }
    return query.orderBy(this.sortBy, this.sortOrder).paginate(this.page, this.limit)
  }
}
