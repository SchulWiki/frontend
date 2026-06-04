import { axiosInstance } from '@/lib/http/axiosInstance'
import type { Directory, DirectoryLight, WikiRecord, RecordSearchResult } from './wiki.types'

export const wikiApi = {
  async getRoot(): Promise<Directory> {
    const res = await axiosInstance.get<Directory>('/api/directories/root')
    return res.data
  },

  async getDirectory(id: number): Promise<Directory> {
    const res = await axiosInstance.get<Directory>(`/api/directories/${id}`)
    return res.data
  },

  async createDirectory(name: string, parentDirectoryId: number): Promise<Directory> {
    const res = await axiosInstance.post<Directory>('/api/directories', { name, parentDirectoryId })
    return res.data
  },

  async updateDirectory(id: number, name: string): Promise<Directory> {
    const res = await axiosInstance.patch<Directory>(`/api/directories/${id}`, { name })
    return res.data
  },

  async deleteDirectory(id: number): Promise<void> {
    await axiosInstance.delete(`/api/directories/${id}`)
  },

  async getRecord(id: number): Promise<WikiRecord> {
    const res = await axiosInstance.get<WikiRecord>(`/api/records/${id}`)
    return res.data
  },

  async createRecord(data: {
    title: string
    content: string
    parentDirectoryId: number
  }): Promise<WikiRecord> {
    const res = await axiosInstance.post<WikiRecord>('/api/records', data)
    return res.data
  },

  async updateRecord(id: number, title: string): Promise<WikiRecord> {
    const res = await axiosInstance.patch<WikiRecord>(`/api/records/${id}`, { title })
    return res.data
  },

  async updateRecordContent(id: number, content: string): Promise<WikiRecord> {
    const res = await axiosInstance.patch<WikiRecord>(`/api/records/${id}/content`, { content })
    return res.data
  },

  async deleteRecord(id: number): Promise<void> {
    await axiosInstance.delete(`/api/records/${id}`)
  },

  async searchRecords(query: string): Promise<RecordSearchResult[]> {
    const res = await axiosInstance.get<RecordSearchResult[]>('/api/records/search', {
      params: { q: query },
    })
    return res.data
  },

  async searchDirectories(query: string): Promise<DirectoryLight[]> {
    const res = await axiosInstance.get<DirectoryLight[]>('/api/directories/search', {
      params: { q: query },
    })
    return res.data
  },

  // Recursively fetches parent directories for breadcrumb — stops at root (parentDirectoryId === null)
  async getDirectoryAncestors(
    parentId: number | null
  ): Promise<Array<{ id: number; name: string }>> {
    if (parentId === null) return []
    const dir = await wikiApi.getDirectory(parentId)
    if (dir.parentDirectoryId === null) return []
    const grandParents = await wikiApi.getDirectoryAncestors(dir.parentDirectoryId)
    return [...grandParents, { id: dir.id, name: dir.name }]
  },
}
