const permissions = {
  ROLE_LIST: 'roles:listing',
  ROLE_CREATE: 'roles:ajout',
  ROLE_UPDATE: 'role:modification',
  ROLE_DELETE: 'role:suppression',
  ROLE_GRANT_PERMISSION: 'attribution_de_permissions',

  SERVICE_LIST: 'dépôts:listing',
  SERVICE_CREATE: 'dépôts:ajout',
  SERVICE_UPDATE: 'dépôts:modification',
  SERVICE_DELETE: 'dépôts:suppression',

  USER_LIST: 'utilisateurs:listing',
  USER_CREATE: 'utilisateurs:ajout',
  USER_UPDATE: 'utilisateurs:modification',
  USER_DELETE: 'utilisateurs:suppression',
} as const

export type PermissionType = (typeof permissions)[keyof typeof permissions]

export default permissions
