import Role from '#models/role'
import BaseFilterService from './base_filter_service.ts'

export default class RoleService extends BaseFilterService {
  fetch() {
    return this.defaultQuery(Role)
  }
}
