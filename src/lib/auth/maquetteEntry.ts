/** URL d’inscription avec parcours maquette (compte + demande). */
export const SIGNUP_MAQUETTE_URL = '/inscription'

export const LOGIN_MAQUETTE_URL = '/connexion?next=%2Fespace-client%2Fnouvelle-demande'

export function isMaquetteSignupFlow(searchParams: URLSearchParams) {
  return searchParams.get('flow') === 'maquette' || searchParams.get('intent') === 'maquette'
}
