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
  register: {
    succeeded: 'Votre inscription a été un succès.',
    emailVerified: 'Votre compte a été vérifié.',
  },

  resendOTP: {
    succeeded: "Un nouveau mail de vérification vous a été envoyé.",
    sessionExpired: "Votre session a expiré.",
  },

  unauthorization: {
    forbidden: "Vous ne pouvez éffectuer cette action étant connecté.",
    verified: "Votre compte est actuellement vérifié.",
  }
}
