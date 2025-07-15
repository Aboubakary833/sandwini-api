import vine, { SimpleMessagesProvider, VineString } from '@vinejs/vine'
import { uniqueRule, UniqueOptions } from '#rules/unique'
import { existsRule, ExistsOptions } from '#rules/exists'
import { PasswordOptions, passwordRule } from '#rules/password'
import numericRule from '#rules/numeric'
import { validatorFields, validatorMessages } from '#messages/validator'

declare module '@vinejs/vine' {
  interface VineString {
    unique(options: UniqueOptions): this
    exists(options: ExistsOptions): this
    password(options?: PasswordOptions): this
    numeric(): this
  }
}

VineString.macro('unique', function (this: VineString, options: UniqueOptions) {
  return this.use(uniqueRule(options))
})

VineString.macro('exists', function (this: VineString, options: ExistsOptions) {
  return this.use(existsRule(options))
})

VineString.macro('password', function (this: VineString, options?: PasswordOptions) {
  return this.use(passwordRule(options))
})

VineString.macro('numeric', function (this: VineString) {
  return this.use(numericRule())
})

vine.messagesProvider = new SimpleMessagesProvider(validatorMessages, validatorFields)
