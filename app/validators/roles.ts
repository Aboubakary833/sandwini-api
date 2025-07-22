import vine from '@vinejs/vine'

export const storeValidator = vine.compile(
  vine.object({
    name: vine.string().unique({ table: 'roles', column: 'name' }),
    permissions: vine.array(vine.string()),
  })
)

export const updateValidator = (except: string) => {
  return vine.compile(
    vine.object({
      name: vine.string().unique({ table: 'roles', column: 'name', except }),
      permissions: vine.array(vine.string()),
    })
  )
}
