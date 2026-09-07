export type UserRole = 'client' | 'admin'

export interface User {
  id: string
  email: string
  name: string
  company?: string
  role: UserRole
}

export interface Session {
  user: User
  remember: boolean
  createdAt: string
}

export interface RegisterInput {
  name: string
  email: string
  password: string
  company?: string
}

export type ProjectStatus = 'maquette' | 'en_cours' | 'validation' | 'livre'

export interface ClientProject {
  id: string
  userId: string
  title: string
  type: string
  status: ProjectStatus
  progress: number
  updatedAt: string
  nextStep: string
}

export interface ClientActivity {
  id: string
  userId: string
  label: string
  date: string
  type: 'message' | 'file' | 'status'
}
