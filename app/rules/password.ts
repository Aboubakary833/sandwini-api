import i18nManager from '@adonisjs/i18n/services/main'
import vine from '@vinejs/vine'
import { FieldContext } from '@vinejs/vine/types'

export type PasswordOptions = {
  hasLowerCase?: boolean
  hasUppercase?: boolean
  hasNumbers?: boolean
  hasSymbols?: boolean
}

const t = i18nManager.locale(i18nManager.defaultLocale).t

const checkIfValueHasLowerCaseLetter = (value: string, field: FieldContext) => {
  const regExp = /[a-z]+/
  if (!regExp.test(value)) {
    field.report(t('validator.password.lower'), 'password', field)
  }
}

const checkIfValueHasUpperCaseLetter = (value: string, field: FieldContext) => {
  const regExp = /[A-Z]+/
  if (!regExp.test(value)) {
    field.report(t('validator.password.upper'), 'password', field)
  }
}

const checkIfValueHasDigit = (value: string, field: FieldContext) => {
  const regExp = /[0-9]+/
  if (!regExp.test(value)) {
    field.report(t('validator.password.number'), 'password', field)
  }
}

const checkIfValueHasSymbols = (value: string, field: FieldContext) => {
  const regExp = /[#?!@$%^&*-_]+/
  if (!regExp.test(value)) {
    field.report(t('validator.password.symbol'), 'password', field)
  }
}

function password(
  value: unknown,
  options: PasswordOptions = {
    hasLowerCase: true,
    hasUppercase: true,
    hasNumbers: true,
    hasSymbols: true,
  },
  field: FieldContext
) {
  let { hasLowerCase, hasUppercase, hasNumbers, hasSymbols } = options

  if (hasLowerCase) checkIfValueHasLowerCaseLetter(value as string, field)
  if (hasUppercase) checkIfValueHasUpperCaseLetter(value as string, field)
  if (hasNumbers) checkIfValueHasDigit(value as string, field)
  if (hasSymbols) checkIfValueHasSymbols(value as string, field)
}

export const passwordRule = vine.createRule(password, {
  implicit: true,
  isAsync: false,
})
