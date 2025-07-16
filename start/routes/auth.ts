import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const SessionController = () => import('#controllers/auth/session_controller')
const RegisterController = () => import('#controllers/auth/register_controller')
const ResendOtpController = () => import('#controllers/auth/resend_otp_controller')
const PasswordResetController = () => import('#controllers/auth/password_reset_controller')

export default function authRoutes() {
  router
    .group(function () {
      router
        .group(function () {
          router.post('/', [SessionController, 'login'])
          router.post('/verify', [SessionController, 'verify'])
        })
        .prefix('login')

      router
        .group(function () {
          router.post('/', [RegisterController, 'signup'])
          router.post('/verify', [RegisterController, 'verify'])
        })
        .prefix('register')

      router.post('/resend_otp', [ResendOtpController, 'index'])

      router
        .group(function () {
          router.post('/', [PasswordResetController, 'request'])
          router.post('/verify', [PasswordResetController, 'verify'])
        })
        .prefix('forgot_password')
    })
    .middleware(middleware.guest())

  router.post('/logout', [SessionController, 'logout']).middleware(middleware.auth())
}
