const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export interface LearningContent {
  frontend: LearningRow[]
  backend: LearningRow[]
  request_flow: RequestStep[]
  technologies: Technology[]
}

export interface LearningRow {
  name: string
  description: string
}

export interface RequestStep {
  step: number
  where: string
  what: string
}

export interface Technology {
  area: string
  technology: string
  purpose: string
}

export async function getLearningContent(): Promise<LearningContent> {
  const response = await fetch(`${API_URL}/api/v1/learning-content`)
  if (!response.ok) throw new Error(`O‘quv materialini olishda API xatosi: ${response.status}`)
  return response.json() as Promise<LearningContent>
}
