import historyMessages from '#messages/history'
import History from '#models/history'
import Role from '#models/role'
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

  async saveRoleCreationAction(user: User, role: Role) {
    History.create({
      userId: user.id,
      type: History.TYPE.CREATE,
      details: historyMessages.role.created.replace('{{ role }}', role.name),
    })
  }

  async saveRoleUpdateAction(user: User, role: Role) {
    History.create({
      userId: user.id,
      type: History.TYPE.UPDATE,
      details: historyMessages.role.updated.replace('{{ role }}', role.name),
    })
  }

  async savedeRoleDeleteAction(user: User, role: Role) {
    History.create({
      userId: user.id,
      type: History.TYPE.DELETE,
      details: historyMessages.role.deleted.replace('{{ role }}', role.name),
    })
  }
}
