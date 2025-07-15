export const validatorMessages = {
  'required': 'Ce champ est obligatoire.',
  'string': 'La valeur de ce champ doit être une chaine de caractères.',
  'email': "L'adresse email fourni est invalide.",
  'minLength': "Ce champ doit être long d'au minimum {{ min }} caractères.",
  'maxLength': "Ce champ doit être long d'au maximum {{ max }} caractères.",
  'fixedLength': 'Ce champ doit être long de {{ length }} caractères.',
  'date': 'La date fournie est invalide.',
  'unique': 'La valeur fournie est déjà prise.',
  'exists': "Il n'existe aucune donnée correspondante à cette valeur.",
  'numeric': "La valeur fournie n'est pas une valeur numérique valide.",
  'confirmed': 'Le champ {{ field }} doit être confirmer.',

  'email.unique': "L'adresse email fournie est déjà prise.",
  'email.exists': "Il n'existe aucune correspondante à cette adresse email.",
  'password.minLength': "Le mot de passe doit être long d'au minimum {{ min }} caractères.",
  'password.maxLength': "Le mot de passe doit être long d'au maximum {{ max }} caractères.",
}

export const validatorFields = {
  email: 'addresse email',
  name: 'nom',
  password: 'mot de passe',
  password_confirmation: 'Confirmer le mot de passe'
}
