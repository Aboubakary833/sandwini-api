import User from '#models/user'
import Service from '#models/service'
import { BasePolicy } from '@adonisjs/bouncer'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class ServicePolicy extends BasePolicy {}
