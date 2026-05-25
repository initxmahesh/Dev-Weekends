import type { TaxonomyTag } from '../types'
import { apiRequest } from './client'

interface ItemResponse<T> {
  data: T
}

export async function fetchTaxonomyTags(): Promise<TaxonomyTag[]> {
  const res = await apiRequest<ItemResponse<TaxonomyTag[]>>('/tags')
  return res.data
}
