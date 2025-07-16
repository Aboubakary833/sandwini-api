import router from '@adonisjs/core/services/router'
import authRoutes from './routes/auth.js'
import { apiThrottle } from './limiter.ts'

router
  .group(() => {
    authRoutes()
  })
  .prefix('api/v1')
  .use(apiThrottle)
