import router from '@adonisjs/core/services/router'

const RoleController = () => import('#controllers/admin/roles_controller')
export default function adminRoutes() {
  router.resource('/roles', RoleController).apiOnly().except(['show'])
}
