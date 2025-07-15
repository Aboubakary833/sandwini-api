import db from '@adonisjs/lucid/services/db'
import { LucidRow } from '@adonisjs/lucid/types/model'
import vine from '@vinejs/vine'
import { FieldContext } from '@vinejs/vine/types'

/**
 * Options accepted by the exists rule
 */
export type ExistsOptions = {
  table: string
  column: string
}

/**
 * Implementation
 */
async function exists(value: unknown, options: ExistsOptions, field: FieldContext) {
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
    .select(options.column)
    .where(options.column, value)
    .first()) as LucidRow

  if (!row) {
    field.report("La valeur fournie n'existe pas.", 'exists', field)
  }
}

export const existsRule = vine.createRule(exists)
