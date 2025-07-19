import vine from '@vinejs/vine'

export const createValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(5).maxLength(150),
    email: vine.string().email().maxLength(254).unique({ table: 'services', column: 'email' }),
    phone: vine.string().numeric().maxLength(25).unique({ table: 'services', column: 'phone' }),
    address: vine.string().minLength(5).maxLength(512),
    surface: vine.number(),
    status: vine.boolean().optional(),
  })
)

export const updateValidator = (except: string) => {
  return vine.compile(
    vine.object({
      name: vine.string().minLength(5).maxLength(150),
      email: vine
        .string()
        .email()
        .maxLength(254)
        .unique({ table: 'services', column: 'email', except }),
      phone: vine
        .string()
        .numeric()
        .maxLength(25)
        .unique({ table: 'services', column: 'phone', except }),
      address: vine.string().minLength(5).maxLength(512),
      surface: vine.number(),
      status: vine.boolean().optional(),
    })
  )
}
