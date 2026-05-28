import { axiosInstance } from '@/lib/http/axiosInstance'
import type { SearchResultEntry, WikiEntry } from './wiki.types'

export const wikiApi = {
  async getRootEntries(): Promise<WikiEntry[]> {
    const response = await axiosInstance.get<WikiEntry[]>('/api/entries', {
      params: { parentId: 'null' },
    })
    return response.data
  },

  async getChildren(parentId: number): Promise<WikiEntry[]> {
    const response = await axiosInstance.get<WikiEntry[]>('/api/entries', {
      params: { parentId },
    })
    return response.data
  },

  async getEntry(id: number): Promise<WikiEntry> {
    const response = await axiosInstance.get<WikiEntry>(`/api/entries/${id}`)
    return response.data
  },

  async createEntry(data: {
    title: string
    content: string
    parentId: number | null
  }): Promise<WikiEntry> {
    const response = await axiosInstance.post<WikiEntry>('/api/entries', data)
    return response.data
  },

  async updateEntry(
    id: number,
    data: { title: string; content: string }
  ): Promise<WikiEntry> {
    const response = await axiosInstance.patch<WikiEntry>(`/api/entries/${id}`, data)
    return response.data
  },

  async deleteEntry(id: number): Promise<void> {
    await axiosInstance.delete(`/api/entries/${id}`)
  },

  async search(query: string): Promise<SearchResultEntry[]> {
    const response = await axiosInstance.get<SearchResultEntry[]>('/api/entries/search', {
      params: { q: query },
    })
    return response.data
  },

  async getAncestors(parentId: number | null): Promise<WikiEntry[]> {
    if (parentId === null) return []
    const parent = await wikiApi.getEntry(parentId)
    const grandparents = await wikiApi.getAncestors(parent.parentId)
    return [...grandparents, parent]
  },
}
