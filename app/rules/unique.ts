import db from '@adonisjs/lucid/services/db'
import { LucidRow } from '@adonisjs/lucid/types/model'
import vine from '@vinejs/vine'
import { FieldContext } from '@vinejs/vine/types'

/**
 * Options accepted by the unique rule
 */
export type UniqueOptions = {
  table: string
  column: string
  except?: string
}

/**
 * Implementation
 */
async function unique(value: unknown, options: UniqueOptions, field: FieldContext) {
  /**
   * We do not want to deal with non-string
   * values. The "string" rule will handle the
   * the validation.
   */
  if (typeof value !== 'string') {
    return
  }

  const row = (await db
    .from(options.table)
    .select(['id', options.column])
    .where(options.column, value)
    .first()) as LucidRow & { id: string }

  if (options.except && row.id === options.except) return

  if (row) {
    field.report('La valeur fournie est déjà prise.', 'unique', field)
  }
}

export const uniqueRule = vine.createRule(unique)
