import SendOtpTo, { OtpType } from '#actions/send_otp_to'
import { UserFactory } from '#database/factories/user_factory'
import { ERROR_CODES, SUCCESS_CODES } from '#enums/status_codes'
import VerificationEmail from '#mails/auth/verification_email'
import { authMessages } from '#messages/auth'
import { validatorMessages } from '#messages/validator'
import CacheService from '#services/cache_service'
import mail from '@adonisjs/mail/services/main'
import { test } from '@japa/runner'

test.group('Registration', () => {
  test('Registration should fail and return validator errors', async ({ client }) => {
    const response = await client.post('/api/v1/register').json({
      name: 'John Doe',
      email: 'johndoe@gmail.com',
      password: '1234',
      password_confirmation: '1234',
    })

    response.assertStatus(422)
    response.assertBody({
      errors: [
        {
          field: 'password',
          message: validatorMessages['password.minLength'].replace('{{ min }}', '8'),
          rule: 'minLength',
          meta: {
            min: 8,
          },
        },
      ],
    })
  })

  test('Registration should succeed and send email verification message', async ({
    client,
    assert,
  }) => {
    const { mails } = mail.fake()
    const email = 'johndoe@gmail.com'
    const response = await client.post('/api/v1/register').json({
      name: 'John Doe',
      email,
      password: 'John@wicked14',
      password_confirmation: 'John@wicked14',
    })

    const cache = new CacheService()
    const code = await cache.from('otp').get<string>(email)
    const token = await cache.from('token').get<string>(email)
    mails.assertQueued(VerificationEmail, (message) => {
      assert.equal(message.email, email)
      assert.equal(message.otp, code)
      assert.equal(message.subject, authMessages.otpMailSubject.register)
      assert.equal(message.template, 'emails/otp/register')

      return true
    })
    mails.assertQueuedCount(1)

    response.assertOk()
    response.assertBody({
      code: SUCCESS_CODES.ACCOUNT_CREATED,
      messages: authMessages.register.succeeded,
      resendOTPtoken: token,
      redirectTo: '/register/verify',
    })
  })
})

test.group('Email verification', () => {
  test('Verification should fail and return OTP expired message', async ({ client }) => {
    const user = await UserFactory.create()

    const response = await client.post('/api/v1/register/verify').json({
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
    const user = await UserFactory.create()

    const sendOtpAction = new SendOtpTo(user.email, OtpType.REGISTER)
    const cache = new CacheService().namespace('otp')
    await cache.set(user.email, sendOtpAction.generateOTP(), '15m')

    const response = await client.post('/api/v1/register/verify').json({
      email: user.email,
      otp: '123456',
    })

    response.assertGone()
    response.assertBody({
      code: ERROR_CODES.OTP_INVALID,
      message: authMessages.otp.invalid,
    })

    cleanup(async () => {
      await cache.delete(user.email)
    })
  })

  test('Verification should succeed', async ({ client, assert }) => {
    const user = await UserFactory.merge({
      password: 'Marvel@1234',
    }).create()

    const sendOtpAction = new SendOtpTo(user.email, OtpType.REGISTER)
    const code = sendOtpAction.generateOTP()
    await new CacheService().to('otp').set(user.email, code, '15m')

    const response = await client.post('/api/v1/register/verify').json({
      email: user.email,
      otp: code,
    })

    await user.refresh()

    response.assertOk()
    response.assertBodyContains({
      code: SUCCESS_CODES.EMAIL_VERIFIED,
      message: authMessages.register.emailVerified,
      redirectTo: '/inactive',
    })

    assert.isNotNull(user.emailVerifiedAt)
  })
})
