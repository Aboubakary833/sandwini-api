import SendOtpTo, { OtpType } from '#actions/send_otp_to'
import { UserFactory } from '#database/factories/user_factory'
import { ERROR_CODES, SUCCESS_CODES } from '#enums/status_codes'
import VerificationEmail from '#mails/auth/verification_email'
import { authMessages } from '#messages/auth'
import { validatorMessages } from '#messages/validator'
import CacheService from '#services/cache_service'
import { BASE_PATH } from '#tests/global'
import encryption from '@adonisjs/core/services/encryption'
import mail from '@adonisjs/mail/services/main'
import { test } from '@japa/runner'

test.group('Reset password request', () => {
  test('Reset request should fail and return validation error', async ({ client }) => {
    const response = await client.post(`${BASE_PATH}/forgot_password`).json({
      email: 'johndoe@gmail.com',
      password: 'J@hnWicked1234',
      password_confirmation: '',
    })

    response.assertStatus(422)
    response.assertBody({
      errors: [
        {
          field: 'password',
          message: validatorMessages.confirmed.replace('{{ field }}', 'mot de passe'),
          meta: {
            otherField: 'password_confirmation',
          },
          rule: 'confirmed',
        },
      ],
    })
  })

  test('Reset request should succeed and send confirmation message', async ({
    client,
    assert,
    cleanup,
  }) => {
    const user = await UserFactory.create()
    const newPassword = 'J@hnWicked1234'
    const { mails } = mail.fake()
    const response = await client.post(`${BASE_PATH}/forgot_password`).json({
      email: user.email,
      password: newPassword,
      password_confirmation: newPassword,
    })
    const cache = new CacheService()

    const [code, cachePassword] = await Promise.all([
      cache.from('otp').get<string>(user.email),
      cache.from('reset_password').get<string>(user.email),
    ])
    const decryptedPassword = encryption.decrypt<string>(cachePassword)

    assert.equal(decryptedPassword, newPassword)

    mails.assertSent(VerificationEmail, (email) => {
      const message = email.message

      assert.equal(email.otp, code)
      assert.equal(email.template, 'emails/otp/resetPasswordRequest')
      message.assertTo(user.email)
      message.assertSubject(authMessages.otpMailSubject.resetPasswordRequest)

      return true
    })

    response.assertOk()
    response.assertBody({
      code: SUCCESS_CODES.RESET_MAIL_SENT,
      message: authMessages.resetPassword.resetMailSent,
      redirect: '/forgot_password/verify',
    })

    cleanup(async () => {
      await cache.from('otp').delete(user.email)
      await cache.from('reset_password').delete(user.email)
    })
  })
})

test.group('Reset password confirmation', () => {
  test('Verification should fail and return OTP expired message', async ({ client }) => {
    const user = await UserFactory.create()

    const response = await client.post(`${BASE_PATH}/forgot_password/verify`).json({
      email: user.email,
      otp: '123456',
    })

    response.assertGone()
    response.assertBody({
      code: ERROR_CODES.OTP_EXPIRED,
      message: authMessages.otp.expired,
      redirectTo: '/forgot_password',
    })
  })

  test('Verification should fail and return OTP invalid message', async ({ client, cleanup }) => {
    const user = await UserFactory.create()

    const sendOtpAction = new SendOtpTo(user.email, OtpType.RESET_PASSWORD_REQUEST)
    const cache = new CacheService().namespace('otp')
    await cache.set(user.email, sendOtpAction.generateOTP(), '15m')

    const response = await client.post(`${BASE_PATH}/forgot_password/verify`).json({
      email: user.email,
      otp: '123456',
    })

    response.assertGone()
    response.assertBody({
      code: ERROR_CODES.OTP_INVALID,
      message: authMessages.otp.invalid,
      redirectTo: '/forgot_password',
    })

    cleanup(async () => {
      await cache.delete(user.email)
    })
  })

  test('Verification should succeed and inform user to login with new password', async ({
    client,
    assert,
  }) => {
    let user = await UserFactory.merge({
      password: 'Marvel@1234',
    }).create()

    const newPassword = 'J@hnWicked1234'
    const encryptedPassword = encryption.encrypt(newPassword)
    const sendOtpAction = new SendOtpTo(user.email, OtpType.RESET_PASSWORD_REQUEST)
    const code = sendOtpAction.generateOTP()
    const cache = new CacheService()

    await Promise.all([
      cache.to('otp').set(user.email, code, '15m'),
      cache.to('reset_password').set(user.email, encryptedPassword, '30m'),
    ])

    const response = await client.post(`${BASE_PATH}/forgot_password/verify`).json({
      email: user.email,
      otp: code,
    })

    user = await user.refresh()
    assert.isTrue(await user.verifyPassword(newPassword))

    response.assertOk()
    response.assertBody({
      code: SUCCESS_CODES.PASSWORD_CHANGED,
      message: authMessages.resetPassword.succeeded,
      redirectTo: '/login',
    })
  })
})
