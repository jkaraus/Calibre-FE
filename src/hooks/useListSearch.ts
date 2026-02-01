import { useMemo } from 'react'
import { useDebounced } from './useDebounced'
import { useProgressiveLoading } from './useProgressiveLoading'

interface UseListSearchProps<T> {
  /** Zdrojová data pro vyhledávání */
  items: T[] | undefined
  /** Aktuální vyhledávací termín */
  searchTerm: string
  /** Funkce pro filtrování položek */
  filterFn: (item: T, searchTerm: string) => boolean
  /** Funkce pro řazení položek (nepovinné) */
  sortFn?: (a: T, b: T) => number
  /** Nastavení progressive loading */
  progressiveLoading?: {
    pageSize?: number
    initialDisplayCount?: number
    enableInfiniteScroll?: boolean
  }
}

interface UseListSearchReturn<T> {
  /** Filtrované a stránkované položky */
  filteredItems: T[] | undefined
  /** Celkový počet nalezených položek */
  totalCount: number
  /** Debounced vyhledávací termín */
  debouncedSearchTerm: string
  /** Progressive loading hook hodnoty */
  progressiveLoading: {
    displayCount: number
    isLoadingMore: boolean
    handleLoadMore: () => Promise<void>
    hasMore: boolean
  }
}

/**
 * Univerzální hook pro vyhledávání v seznamech s progressive loading
 * Kombinuje debounced search, filtrování, řazení a progressive loading
 */
export const useListSearch = <T>({
  items,
  searchTerm,
  filterFn,
  sortFn,
  progressiveLoading = {},
}: UseListSearchProps<T>): UseListSearchReturn<T> => {
  const {
    pageSize = 48,
    initialDisplayCount = 20,
    enableInfiniteScroll = true,
  } = progressiveLoading

  // Debounced search term
  const debouncedSearchTerm = useDebounced(searchTerm, 150)

  // Filtrování a řazení
  const processedItems = useMemo(() => {
    if (!items) {
      return { filtered: undefined, totalCount: 0 }
    }

    let result = items

    // Filtrování podle search term
    if (debouncedSearchTerm.trim()) {
      result = items.filter(item => filterFn(item, debouncedSearchTerm.toLowerCase()))
    }

    // Řazení pokud je definováno
    if (sortFn) {
      result = [...result].sort(sortFn)
    }

    return { filtered: result, totalCount: result.length }
  }, [items, debouncedSearchTerm, filterFn, sortFn])

  // Progressive loading
  const progressiveLoadingHook = useProgressiveLoading({
    totalItems: processedItems.totalCount,
    pageSize,
    initialDisplayCount,
    enableInfiniteScroll,
    resetDeps: [debouncedSearchTerm],
  })

  // Stránkování výsledků
  const paginatedItems = useMemo(() => {
    if (!processedItems.filtered) {
      return undefined
    }

    return processedItems.filtered.slice(0, progressiveLoadingHook.displayCount)
  }, [processedItems.filtered, progressiveLoadingHook.displayCount])

  return {
    filteredItems: paginatedItems,
    totalCount: processedItems.totalCount,
    debouncedSearchTerm,
    progressiveLoading: progressiveLoadingHook,
  }
}
