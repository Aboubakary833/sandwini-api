import { FORBIDDEN_MESSAGE } from '#decorators/authorize'
import { ERROR_CODES } from '#enums/status_codes'
import { ApiResponse } from '@japa/api-client'

// constants
export const BASE_PATH = '/api/v1'

export function assertForbidden(responses: ApiResponse[]) {
  responses.forEach((response) => {
    response.assertForbidden()
    response.assertBody({
      code: ERROR_CODES.FORBIDDEN,
      message: FORBIDDEN_MESSAGE,
    })
  })
}
