import { defaultValidator } from '#validators/query'
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { LucidModel, ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'

type SortOrder = 'asc' | 'desc'

@inject()
export default class BaseFilterService {
  protected fields: string[] = ['id', 'name', 'created_at']
  protected searchFields: string[] = ['name']
  protected search: string | undefined
  protected sortBy: string = 'name'
  protected sortOrder: SortOrder = 'asc'
  protected page: number = 1
  protected limit: number = 10

  constructor(protected ctx: HttpContext) {
    defaultValidator.validate(ctx.request.qs()).then((params) => {
      this.search = params?.search
      this.sortBy = params?.sort_by ?? 'name'
      this.sortOrder = (params?.sort_order as SortOrder) ?? 'asc'
      this.page = params?.page ?? 1
      this.limit = params?.limit ?? 10
    })
  }

  defaultQuery<T extends LucidModel>(model: T) {
    const query = model.query().select(this.fields)

    if (this.search) {
      query.where(this.applySearch.bind(this))
    }
    return query.orderBy(this.sortBy, this.sortOrder).paginate(this.page, this.limit)
  }

  applySearch<T extends LucidModel>(query: ModelQueryBuilderContract<T, InstanceType<T>>) {
    return query.where((subQuery) => {
      this.searchFields.forEach((field) => {
        subQuery.orWhereLike(field, this.search as string)
      })
    })
  }
}
