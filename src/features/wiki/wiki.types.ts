export type UserLight = {
  id: number
  firstName: string
  lastName: string
}

export type DirectoryLight = {
  id: number
  name: string
  childCount: number
}

export type RecordLight = {
  id: number
  title: string
}

export type Directory = {
  id: number
  name: string
  parentDirectoryId: number | null
  subDirectories: DirectoryLight[]
  records: RecordLight[]
  createdAt: string
  createdBy: UserLight
  updatedAt: string
  updatedBy: UserLight
}

export type WikiRecord = {
  id: number
  title: string
  content: string
  parentDirectoryId: number
  createdAt: string
  createdBy: UserLight
  updatedAt: string
  updatedBy: UserLight
}

export type RecordSearchResult = {
  id: number
  title: string
  excerpt: string
  parentDirectoryId: number
  parentDirectoryName: string
}
