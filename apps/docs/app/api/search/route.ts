import { source } from '@/lib/source'
import { flexsearchFromSource } from 'fumadocs-core/search/flexsearch'

const searchAPI = flexsearchFromSource(source)

export const { GET } = searchAPI
