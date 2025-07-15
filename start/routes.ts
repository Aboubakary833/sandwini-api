import router from '@adonisjs/core/services/router'
import authRoutes from './routes/auth.js'

router
  .group(() => {
    authRoutes()
  })
  .prefix('api/v1')
