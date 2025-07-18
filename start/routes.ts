import router from '@adonisjs/core/services/router'
import authRoutes from './routes/auth.js'
import { apiThrottle } from './limiter.ts'
import { middleware } from './kernel.ts'
import adminRoutes from './routes/admin.ts'

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
