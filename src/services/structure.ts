export interface ProjectNode {
  id: string
  name: string
  path: string
  kind: 'folder' | 'file' | 'data'
  description: string
  stage?: string
  badge?: string
  example?: string
  exampleLabel?: string
  children?: ProjectNode[]
  count?: number
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function countNodes(node: ProjectNode): number {
  return 1 + (node.children ?? []).reduce((sum, child) => sum + countNodes(child), 0)
}

export async function getProjectStructure(): Promise<ProjectNode> {
  let response: Response
  try {
    response = await fetch(`${API_URL}/api/v1/structure`)
  } catch {
    throw new Error('Backend bilan bog‘lanib bo‘lmadi. Python serverini ishga tushiring.')
  }
  if (!response.ok) throw new Error(`API xatoligi: ${response.status}`)
  const tree = await response.json() as ProjectNode
  return { ...tree, count: countNodes(tree) }
}
