import { UserFactory } from '#database/factories/user_factory'
import Role from '#models/role'
import User from '#models/user'
import { assertForbidden, BASE_PATH } from '#tests/global'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import { test } from '@japa/runner'

test.group('Role management', () => {
  test('user without role abilities cannot perform actions on roles', async ({ client }) => {
    const user = await UserFactory.merge({ active: true }).create()
    await user.markEmailAsVerified()

    const listResponse = await client.get(`${BASE_PATH}/roles`).loginAs(user, [])
    const storeResponse = await client
      .post(`${BASE_PATH}/roles`)
      .json({ name: 'tester', permissions: ['role:create'] })
      .loginAs(user, [])

    assertForbidden([listResponse, storeResponse])
  })

  test('admin should be able to list and filter roles', async ({ client, assert }) => {
    const admin = (await User.first()) as User
    let body: ReturnType<ModelPaginatorContract<Role>['toJSON']>

    const defaultResponse = await client.get(`${BASE_PATH}/roles`).loginAs(admin)
    const searchResponse = await client.get(`${BASE_PATH}/roles?search=Manager`).loginAs(admin)
    const sortingResponse = await client
      .get(`${BASE_PATH}/roles?sort_by=name&sort_order=desc`)
      .loginAs(admin)

    body = searchResponse.body()
    defaultResponse.assertBodyContains({
      meta: {
        total: 3,
        perPage: 10,
        currentPage: 1,
        lastPage: 1,
        firstPage: 1,
        firstPageUrl: '/?page=1',
        lastPageUrl: '/?page=1',
        nextPageUrl: null,
        previousPageUrl: null,
      },
    })

    assert.equal((body.data[0] as Role).name, 'Manager')
    body = sortingResponse.body()
    assert.equal((body.data[0] as Role).name, 'Manager')
    assert.equal((body.data[1] as Role).name, 'Gestionnaire')
  })
})
