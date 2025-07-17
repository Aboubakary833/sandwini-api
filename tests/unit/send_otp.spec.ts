import SendOtpTo, { OtpType } from '#actions/send_otp_to'
import { test } from '@japa/runner'

test.group('SendOtp action class', () => {
  test('generateOTP generate 6 digits OTP code by default', async ({ assert }) => {
    const SendOtpAction = new SendOtpTo('johndoe@gmail.com', OtpType.LOGIN)
    const code = SendOtpAction.generateOTP()
    assert.isNumber(Number(code))
    assert.equal(code.length, 6)
  })

  test('generateOTP can generate any length of OTP code', async ({ assert }) => {
    const SendOtpAction = new SendOtpTo('johndoe@gmail.com', OtpType.LOGIN)
    let code = SendOtpAction.generateOTP(4)
    assert.equal(code.length, 4)
    code = SendOtpAction.generateOTP(8)
    assert.equal(code.length, 8)
  })
})
