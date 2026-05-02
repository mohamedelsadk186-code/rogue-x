import client from './client'

export const uploadsApi = {
  uploadProductImages: (files: File[]) => {
    const form = new FormData()
    for (const f of files) form.append('images', f)
    return client.post<{ images: { url: string; public_id?: string }[] }>('/uploads/images', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
