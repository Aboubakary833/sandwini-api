import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const LoginController = () => import('#controllers/auth/login_controller')
const RegisterController = () => import('#controllers/auth/register_controller')
const ResendOtpController = () => import('#controllers/auth/resend_otp_controller')

export default function authRoutes() {
  router
    .group(function () {
      router
        .group(function () {
          router.post('/', [LoginController, 'attempt'])
          router.post('/verify', [LoginController, 'verify'])
        })
        .prefix('login')

      router
        .group(function () {
          router.post('/', [RegisterController, 'signup'])
          router.post('/verify', [RegisterController, 'verify'])
        })
        .prefix('register')

      router.post('/resend_otp', [ResendOtpController, 'index'])
    })
    .middleware(middleware.guest())
}
