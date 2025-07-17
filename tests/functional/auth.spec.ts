import { test } from '@japa/runner'

test.group('Auth', () => {
  test('Login should fails and return validation errors', async ({ client }) => {
    const response = client.post('/login')
  })
})