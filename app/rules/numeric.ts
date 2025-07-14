import i18nManager from '@adonisjs/i18n/services/main'
import vine from '@vinejs/vine'
import { FieldContext } from '@vinejs/vine/types'

const t = i18nManager.locale(i18nManager.defaultLocale).t

function numeric(value: unknown, _: any, field: FieldContext) {
  if (Number.isNaN(Number(value))) {
    field.report(t('validator.numeric'), 'numeric', field)
  }
}

const numericRule = vine.createRule(numeric, {
  implicit: true,
  isAsync: false,
})

export default numericRule
