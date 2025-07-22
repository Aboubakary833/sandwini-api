const abilities = {
  ROLE_LIST: 'roles:listing',
  ROLE_CREATE: 'roles:ajout',
  ROLE_UPDATE: 'role:modification',
  ROLE_DELETE: 'role:suppression',

  SERVICE_LIST: 'dépôts:listing',
  SERVICE_CREATE: 'dépôts:ajout',
  SERVICE_UPDATE: 'dépôts:modification',
  SERVICE_DELETE: 'dépôts:suppression',

  USER_LIST: 'utilisateurs:listing',
  USER_CREATE: 'utilisateurs:ajout',
  USER_UPDATE: 'utilisateurs:modification',
  USER_DELETE: 'utilisateurs:suppression',
} as const

export type PermissionType = (typeof abilities)[keyof typeof abilities]

const DIRECTOR_EXCEPTS = ['roles']
const MANAGER_EXCEPTS = [...DIRECTOR_EXCEPTS]

export const allAbilities = Object.values(abilities) as PermissionType[]
export const directorAbilities = allAbilities.map((name) => {
  const namespace = name.split(':')[0]
  return !DIRECTOR_EXCEPTS.includes(namespace)
})
export const managerAbilities = allAbilities.map((name) => {
  const namespace = name.split(':')[0]
  return !MANAGER_EXCEPTS.includes(namespace)
})

export default abilities
