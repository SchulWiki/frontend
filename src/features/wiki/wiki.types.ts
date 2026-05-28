export type WikiEntry = {
  id: number
  title: string
  content: string
  authorId: number
  authorName?: string
  parentId: number | null
  updatedAt: string
  childCount?: number
}

export type SearchResultEntry = WikiEntry & {
  excerpt?: string
  ancestors?: Array<{ id: number; title: string }>
}
