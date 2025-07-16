export const authMessages = {
  otp: {
    expired: 'Le code OTP fourni a expiré.',
    invalid: 'Le code OTP fourni est invalide.',
  },
  login: {
    emailNotVerified: "Votre adresse email n'a pas encore été vérifié.",
    verify: 'Un code de vérification vous a été envoyé par mail.',
    inactive: "Votre compte n'a pas encore été activé par l'administrateur.",
  },

  logout: {
    succeeded: 'Vous avez été déconnecté.',
  },

  register: {
    succeeded: 'Votre inscription a été un succès.',
    emailVerified: 'Votre compte a été vérifié.',
  },

  resendOTP: {
    succeeded: 'Un nouveau mail de vérification vous a été envoyé.',
    sessionExpired: 'Votre session a expiré.',
  },

  unauthorization: {
    forbidden: 'Vous ne pouvez éffectuer cette action étant connecté.',
    verified: 'Votre compte est actuellement vérifié.',
  },

  resetPassword: {
    succeeded: 'Votre mot de passe a été changé. Veuillez vous connecter avec le nouveau.',
    resetMailSent: 'Un email contenant un code vous a été envoyé.',
    sessionExpired: 'Votre session a expiré.',
  },

  otpMailSubject: {
    login: 'Vérification 2FA',
    register: "Vérification de l'adresse email",
    resetPasswordRequest: 'Réinitialisation du mot de passe',
    passwordReset: 'Mot de passe réinitialisé',
  },
}
