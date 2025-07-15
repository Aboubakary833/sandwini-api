import vine from '@vinejs/vine'
import { FieldContext } from '@vinejs/vine/types'

function numeric(value: unknown, _: any, field: FieldContext) {
  if (Number.isNaN(Number(value))) {
    field.report("La valeur fournie n'est pas une valeur numérique valide.", 'numeric', field)
  }
}

const numericRule = vine.createRule(numeric, {
  implicit: true,
  isAsync: false,
})

export default numericRule
