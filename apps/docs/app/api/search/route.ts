import { flexsearchFromSource } from 'fumadocs-core/search/flexsearch'

import { source } from '@/lib/source'

const searchAPI = flexsearchFromSource(source)

export const { GET } = searchAPI
