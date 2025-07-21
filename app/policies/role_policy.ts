import User from '#models/user'
import Role from '#models/role'
import { BasePolicy } from '@adonisjs/bouncer'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class RolePolicy extends BasePolicy {
	list(user: User): AuthorizerResponse {
		
	}
}
