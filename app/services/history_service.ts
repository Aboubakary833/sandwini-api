// app/services/history_service.ts

import History from '#models/history'
import messages from '#messages/history'
import type User from '#models/user'

export default class HistoryService {
  static async log(type: keyof typeof messages, user: User, data: Record<string, any> = {}) {
    const template = messages[type]

    const details = template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => {
      return data[key] ?? ''
    })

    const baseType = type.split(':')[1]
    const key = HistoryService.getTypeKey(baseType)

    await History.create({
      userId: user.id,
      type: History.TYPE[key],
      details,
    })
  }

  static getTypeKey(dirtyType: string) {
    if (Object.keys(History.TYPE).includes(dirtyType.toUpperCase())) {
      return dirtyType.toUpperCase() as keyof typeof History.TYPE
    }

    if (dirtyType.endsWith('succeeded') || dirtyType.endsWith('failed')) {
      dirtyType = dirtyType.replaceAll(/_succeeded|_failed/g, '')
    }
    return dirtyType.slice(0, -1).toUpperCase() as keyof typeof History.TYPE
  }
}
