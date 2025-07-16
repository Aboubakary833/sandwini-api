import vine from '@vinejs/vine'

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email().exists({ table: 'users', column: 'email' }),
    password: vine.string(),
  })
)

export const otpValidator = vine.compile(
  vine.object({
    email: vine.string().email().exists({ table: 'users', column: 'email' }),
    otp: vine.string().fixedLength(6),
  })
)

export const resendOtpValidator = vine.compile(
  vine.object({
    email: vine.string().email().exists({ table: 'users', column: 'email' }),
    token: vine.string(),
  })
)

export const registerValidator = vine.compile(
  vine.object({
    name: vine.string().trim().maxLength(150),
    email: vine.string().email().unique({ table: 'users', column: 'email' }),
    password: vine.string().minLength(8).maxLength(16).password().confirmed(),
  })
)

export const resetPasswordValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
    password: vine.string().password().confirmed(),
  })
)
