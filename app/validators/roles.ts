import vine from '@vinejs/vine'

export const storeValidator = vine.compile(
  vine.object({
    name: vine.string().unique({ table: 'roles', column: 'name' }),
  })
)

export const updateValidator = (except: string) => {
  return vine.compile(
    vine.object({
      name: vine.string().unique({ table: 'roles', column: 'name', except }),
    })
  )
}
