import User from '#models/user';
import { loginValidator, twoFactorValidator } from '#validators/auth/login';
import type { HttpContext } from '@adonisjs/core/http';
import SendOtpTo from '../../actions/send_otp_to.js';
import cache from '@adonisjs/cache/services/main';

export default class LoginController {

  async attempt({ request, response }: HttpContext) {
    const { email, password } = await loginValidator.validate(request.all());
    const user = await User.verifyCredentials(email, password);
    const sendOtpAction = new SendOtpTo();

    sendOtpAction.handle(user.email);

    return response.ok({
      email: user.email,
      message: 'Un mail de vérification vous a été envoyé par mail.',
    });
  }

  async verify({ request, response }: HttpContext) {
    const { email, otp } = await twoFactorValidator.validate(request.all());
    const cacheOtp = await cache.namespace('otp').get({key: email});

    if (!cacheOtp) {
      return response.gone(
        'Le code OTP fourni a expiré.',
      );
    }

    if (otp !== cacheOtp) {
      return response.gone(
        'Le code OTP fourni est invalide.',
      );
    }
    const user = await User.query().where('email', email).firstOrFail();
    const token = await User.accessTokens.create(
      user as User,
    );

    if (!token.value?.release()) {
      return response.gone(
        'Une erreur inattendue est survenu. Veuillez reessayer.'
      );
    }

    return response.ok({
      token: token.value.release(),
    });

  }

}
