import router from '@adonisjs/core/services/router'

const RoleController = () => import('#controllers/admin/roles_controller')
const StoreController = () => import('#controllers/admin/stores_controller')

export default function adminRoutes() {
  router.get('/roles/all', [RoleController, 'all'])
  router.resource('/roles', RoleController).apiOnly().except(['show'])
  router.resource('/services', StoreController).apiOnly().except(['show'])
}
