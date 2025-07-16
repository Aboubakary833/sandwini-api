import historyMessages from '#messages/history'
import History from '#models/history'
import User from '#models/user'

export default class HistoryService {
  async saveLoginAction(user: User, succeeded: boolean) {
    const messages = historyMessages.login
    History.create({
      userId: user.id,
      type: History.TYPE.LOGIN,
      details: succeeded ? messages.succeeded : messages.failed,
    })
  }

  async saveLogoutAction(user: User) {
    History.create({
      userId: user.id,
      type: History.TYPE.LOGOUT,
      details: historyMessages.logout,
    })
  }

  async saveRegisterAction(user: User) {
    History.create({
      userId: user.id,
      type: History.TYPE.REGISTER,
      details: historyMessages.register,
    })
  }

  async savePasswordResetAction(user: User) {
    History.create({
      userId: user.id,
      type: History.TYPE.RESET,
      details: historyMessages.passwordReset,
    })
  }
}
