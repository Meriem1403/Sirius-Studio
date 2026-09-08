import type { MockupClientChoice } from '../auth/types'

export const MOCKUP_CHOICE_LABELS: Record<MockupClientChoice, string> = {
  pending: 'En attente de votre retour',
  quote_requested: 'Devis demandé',
  revision_colors: 'Révision couleurs et ambiance',
  revision_layout: 'Révision mise en page',
  revision_content: 'Révision contenus',
  revision_typography: 'Révision typographies',
  revision_other: 'Autre révision',
  new_direction: 'Nouvelle direction créative',
  pause_project: 'Projet en pause',
  abandon: 'Projet abandonné',
}

export const SATISFIED_OPTIONS = [
  {
    choice: 'quote_requested' as const,
    title: 'Demander un devis',
    description: 'La maquette me convient, je souhaite passer à l\'étape suivante.',
    icon: 'check',
  },
]

export const REVISION_OPTIONS = [
  {
    choice: 'revision_colors' as const,
    title: 'Couleurs et ambiance',
    description: 'Ajuster la palette, les contrastes ou l\'atmosphère générale.',
  },
  {
    choice: 'revision_layout' as const,
    title: 'Mise en page',
    description: 'Réorganiser les blocs, sections ou la hiérarchie visuelle.',
  },
  {
    choice: 'revision_content' as const,
    title: 'Textes et contenus',
    description: 'Modifier les formulations, titres ou messages clés.',
  },
  {
    choice: 'revision_typography' as const,
    title: 'Typographies',
    description: 'Explorer d\'autres polices ou tailles de texte.',
  },
  {
    choice: 'revision_other' as const,
    title: 'Autre précision',
    description: 'Décrire librement ce que vous souhaitez ajuster.',
  },
]

export const UNSATISFIED_OPTIONS = [
  {
    choice: 'new_direction' as const,
    title: 'Nouvelle direction',
    description: 'Repartir sur une approche créative différente.',
  },
  {
    choice: 'pause_project' as const,
    title: 'Mettre en pause',
    description: 'Suspendre le projet temporairement et reprendre plus tard.',
  },
  {
    choice: 'abandon' as const,
    title: 'Abandonner le projet',
    description: 'Arrêter la collaboration sur ce projet.',
  },
]

export function isRevisionChoice(choice: MockupClientChoice) {
  return choice.startsWith('revision_')
}

export function isFinalChoice(choice: MockupClientChoice) {
  return choice !== 'pending'
}
