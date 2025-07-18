import vine from '@vinejs/vine'

export const defaultValidator = vine.compile(
  vine.object({
    search: vine
      .string()
      .escape()
      .maxLength(100)
      .regex(/^[\p{L}\p{N}\s'’\-.,!?()]+$/u)
      .optional(),
    sort_by: vine.string().trim().optional(),
    sort_order: vine.string().trim().in(['asc', 'desc']).optional(),
    page: vine.number().min(1).optional(),
    limit: vine.number().min(10).optional(),
  })
)
