import SendOtpTo, { OtpType } from '#actions/send_otp_to'
import { UserFactory } from '#database/factories/user_factory'
import { ERROR_CODES, SUCCESS_CODES } from '#enums/status_codes'
import VerificationEmail from '#mails/auth/verification_email'
import { authMessages } from '#messages/auth'
import { validatorMessages } from '#messages/validator'
import cache from '@adonisjs/cache/services/main'
import encryption from '@adonisjs/core/services/encryption'
import mail from '@adonisjs/mail/services/main'
import { test } from '@japa/runner'

test.group('Reset password request', () => {
  test('Reset request should fail and return validation error', async ({ client }) => {
    const response = await client.post('/api/v1/forgot_password').json({
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
    const response = await client.post('/api/v1/forgot_password').json({
      email: user.email,
      password: newPassword,
      password_confirmation: newPassword,
    })

    const [code, cachePassword] = await Promise.all([
      cache.namespace('otp').get<string>({ key: user.email }),
      cache.namespace('reset_password').get<string>({ key: user.email }),
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
      code: ERROR_CODES.RESET_MAIL_SENT,
      message: authMessages.resetPassword.resetMailSent,
      redirect: '/forgot_password/verify',
    })

    cleanup(async () => {
      await cache.namespace('otp').delete({ key: user.email })
      await cache.namespace('reset_password').delete({ key: user.email })
    })
  })
})

test.group('Reset password confirmation', () => {
  test('Verification should fail and return OTP expired message', async ({ client }) => {
    const user = await UserFactory.create()

    const response = await client.post('/api/v1/forgot_password/verify').json({
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
    const otpCacher = cache.namespace('otp')
    await otpCacher.set({ key: user.email, value: sendOtpAction.generateOTP(), ttl: '15m' })

    const response = await client.post('/api/v1/forgot_password/verify').json({
      email: user.email,
      otp: '123456',
    })

    response.assertGone()
    response.assertBody({
      code: ERROR_CODES.OTP_INVALID,
      message: authMessages.otp.invalid,
    })

    cleanup(async () => {
      await otpCacher.delete({ key: user.email })
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
    await cache.namespace('otp').set({ key: user.email, value: code, ttl: '15m' })
    await cache
      .namespace('reset_password')
      .set({ key: user.email, value: encryptedPassword, ttl: '30m' })

    const response = await client.post('/api/v1/forgot_password/verify').json({
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
