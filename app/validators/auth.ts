import vine from '@vinejs/vine'

export default class AuthValidator {
  static loginSchema = vine.compile(
    vine.object({
      email: vine.string().email().exists({ table: 'users', column: 'email' }),
      password: vine.string(),
    })
  )

  static otpSchema = vine.compile(
    vine.object({
      email: vine.string().email().exists({ table: 'users', column: 'email' }),
      otp: vine.string().fixedLength(6),
    })
  )

  static registerSchema = vine.compile(
    vine.object({
      name: vine.string().trim().maxLength(150),
      email: vine.string().email().unique({ table: 'users', column: 'email' }),
      password: vine.string().trim().password().confirmed(),
    })
  )
}
