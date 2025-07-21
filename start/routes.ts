import router from '@adonisjs/core/services/router'
import authRoutes from './routes/auth.js'
import { apiThrottle } from './limiter.js'
import { middleware } from './kernel.js'
import adminRoutes from './routes/admin.js'

router
  .group(() => {
    authRoutes()

    router
      .group(() => {
        adminRoutes()
      })
      .middleware([middleware.auth(), middleware.verified()])
  })
  .prefix('api/v1')
  .use(apiThrottle)
