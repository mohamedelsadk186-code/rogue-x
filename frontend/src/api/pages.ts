import client from './client'

export interface CmsPage {
  id: number
  title: string
  slug: string
  description?: string
  content?: string
  seo_title?: string
  seo_description?: string
  is_published?: number
  created_at?: string
  updated_at?: string
  created_by_name?: string
  updated_by_name?: string
}

export const pagesApi = {
  publicList: () => client.get<CmsPage[]>('/pages/public'),
  publicGet: (slug: string) => client.get<CmsPage>(`/pages/public/${slug}`),

  adminList: () => client.get<CmsPage[]>('/pages'),
  adminCreate: (data: Partial<CmsPage>) => client.post<CmsPage>('/pages', data),
  adminUpdate: (id: number, data: Partial<CmsPage>) => client.put<CmsPage>(`/pages/${id}`, data),
  adminDelete: (id: number) => client.delete(`/pages/${id}`),
}
