import router from '@adonisjs/core/services/router'

const LoginController = () => import('#controllers/auth/login_controller')
const RegisterController = () => import('#controllers/auth/register_controller')

export default function authRoutes() {
  router.post('/login', [LoginController, 'attempt'])
  router.post('/verify_otp', [LoginController, 'verify'])
  router.post('/register', [RegisterController])
}
