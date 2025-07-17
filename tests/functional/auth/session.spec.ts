import SendOtpTo, { OtpType } from '#actions/send_otp_to'
import { UserFactory } from '#database/factories/user_factory'
import { ERROR_CODES, SUCCESS_CODES } from '#enums/status_codes'
import VerificationEmail from '#mails/auth/verification_email'
import { authMessages } from '#messages/auth'
import { exceptionMessages } from '#messages/default'
import { validatorMessages } from '#messages/validator'
import User from '#models/user'
import cache from '@adonisjs/cache/services/main'
import mail from '@adonisjs/mail/services/main'
import { test } from '@japa/runner'
import { DateTime } from 'luxon'

test.group('Login attempt', () => {
  test('Login should fail and return validation errors', async ({ client }) => {
    const response = await client.post('api/v1/login').json({
      email: 'jonathan.com',
      password: '1234',
    })

    response.assertUnprocessableEntity()
    response.assertBody({
      errors: [
        {
          message: validatorMessages.email,
          rule: 'email',
          field: 'email',
        },
      ],
    })
  })

  test('Login should fail and return invalid credential errors', async ({ client }) => {
    const response = await client.post('api/v1/login').json({
      email: 'jonathan@gmail.com',
      password: '1234',
    })

    response.assertStatus(400)
    response.assertBody({
      code: ERROR_CODES.INVALID_CREDENTIALS,
      message: exceptionMessages.invalidCredentials,
    })
  })

  test('Login should fail for unverified user', async ({ client, assert, cleanup }) => {
    const user = await UserFactory.merge({ password: 'Marvel@1234' }).create()
    const { mails } = await mail.fake()
    const response = await client.post('/api/v1/login').json({
      email: user.email,
      password: 'Marvel@1234',
    })

    const code = await cache.namespace('otp').get<string>({ key: user.email })
    const token = await cache.namespace('token').get<string>({ key: user.email })

    mails.assertQueued(VerificationEmail, (email) => {
      assert.equal(email.email, user.email)
      assert.equal(email.otp, code)
      assert.equal(email.subject, authMessages.otpMailSubject.register)

      return true
    })
    mails.assertQueuedCount(1)

    response.assertUnauthorized()
    response.assertBody({
      code: ERROR_CODES.EMAIL_NOT_VERIFIED,
      message: authMessages.login.emailNotVerified,
      resendOtpToken: token,
      redirectTo: '/email/verify',
    })

    cleanup(async () => {
      mail.restore()
      await Promise.all([
        cache.namespace('otp').delete({ key: user.email }),
        cache.namespace('token').delete({ key: user.email }),
      ])
    })
  })

  test('Login should fail for inactive user', async ({ client }) => {
    const user = await UserFactory.merge({
      emailVerifiedAt: DateTime.now(),
      password: 'Marvel@1234',
    }).create()
    const response = await client.post('/api/v1/login').json({
      email: user.email,
      password: 'Marvel@1234',
    })

    response.assertUnauthorized()
    response.assertBody({
      code: ERROR_CODES.ACCOUNT_DISABLED,
      message: authMessages.login.inactive,
      redirectTo: '/inactive',
    })
  })

  test('Login should succeed and system should send email verification code', async ({
    client,
    assert,
    cleanup,
  }) => {
    const user = await UserFactory.merge({
      emailVerifiedAt: DateTime.now(),
      password: 'Marvel@1234',
      active: true,
    }).create()
    const { mails } = mail.fake()
    const response = await client.post('/api/v1/login').json({
      email: user.email,
      password: 'Marvel@1234',
    })

    const code = await cache.namespace('otp').get<string>({ key: user.email })
    const token = await cache.namespace('token').get<string>({ key: user.email })

    mails.assertQueued(VerificationEmail, (email) => {
      assert.equal(email.email, user.email)
      assert.equal(email.otp, code)
      assert.equal(email.subject, authMessages.otpMailSubject.login)

      return true
    })

    response.assertOk()
    response.assertBody({
      code: SUCCESS_CODES.LOGIN_OTP_SENT,
      resendOTPtoken: token,
      message: authMessages.login.verify,
      redirectTo: '/login/verify',
    })

    cleanup(async () => {
      mail.restore()
      await Promise.all([
        cache.namespace('otp').delete({ key: user.email }),
        cache.namespace('token').delete({ key: user.email }),
      ])
    })
  })
})

test.group('Login 2FA verification', () => {
  test('Verification should fail and return OTP expired message', async ({ client }) => {
    const user = await UserFactory.merge({
      emailVerifiedAt: DateTime.now(),
      password: 'Marvel@1234',
      active: true,
    }).create()

    const response = await client.post('/api/v1/login/verify').json({
      email: user.email,
      otp: '123456',
    })

    response.assertGone()
    response.assertBody({
      code: ERROR_CODES.OTP_EXPIRED,
      message: authMessages.otp.expired,
    })
  })

  test('Verification should fail and return OTP invalid message', async ({ client, cleanup }) => {
    const user = await UserFactory.merge({
      emailVerifiedAt: DateTime.now(),
      password: 'Marvel@1234',
      active: true,
    }).create()

    const sendOtpAction = new SendOtpTo(user.email, OtpType.LOGIN)
    const otpCacher = cache.namespace('otp')
    await otpCacher.set({ key: user.email, value: sendOtpAction.generateOTP(), ttl: '15m' })

    const response = await client.post('/api/v1/login/verify').json({
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

  test('Verification should succeed', async ({ client }) => {
    const user = await UserFactory.merge({
      emailVerifiedAt: DateTime.now(),
      password: 'Marvel@1234',
      active: true,
    }).create()

    const sendOtpAction = new SendOtpTo(user.email, OtpType.LOGIN)
    const otpCacher = cache.namespace('otp')
    const code = sendOtpAction.generateOTP()
    await otpCacher.set({ key: user.email, value: code, ttl: '15m' })

    const response = await client.post('/api/v1/login/verify').json({
      email: user.email,
      otp: code,
    })

    response.assertOk()
    response.assertBodyContains({
      code: SUCCESS_CODES.LOGIN_SUCCESS,
      redirectTo: '/home',
    })
  })
})

test.group('Déconnexion', () => {
  test('User should be able to logout at any time', async ({ client, assert }) => {
    const user = await UserFactory.merge({
      emailVerifiedAt: DateTime.now(),
      password: 'Marvel@1234',
      active: true,
    }).create()

    const response = await client.post('/api/v1/logout').loginAs(user)
    const tokens = await User.accessTokens.all(user)

    response.assertOk()
    response.assertBody({
      code: SUCCESS_CODES.LOGOUT_SUCCESS,
      message: authMessages.logout.succeeded,
      redirectTo: '/login',
    })
    assert.equal(tokens.length, 0)
  })
})
