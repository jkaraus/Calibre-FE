import React, { useState, useMemo, useCallback } from 'react'
import {
  Container,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material'
import { useAllBooks, useAuthorBooks } from '../services/api'
import { useAppStore } from '../store/appStore'
import BooksList from '../components/BooksList'
import { SearchInput, LoadMoreButton, SkeletonLoader, DetailView } from '../components'
import { useListSearch } from '../hooks/useListSearch'
import { useScrollPosition } from '../hooks/useScrollPosition'
import { formatBookDescription } from '../utils/localization'
import type { Book } from '../types/book'

const Books: React.FC = () => {
  const pageSize = 48 // Počet knih načtených najednou (dělitelné 3 kvůli layoutu)
  
  const { data: books, isLoading, error } = useAllBooks()
  const { booksSearchTerm, setBooksSearchTerm, booksScrollPosition, setBooksScrollPosition } = useAppStore()
  const [selectedSeries, setSelectedSeries] = useState<{authorId: number, seriesName: string} | null>(null)
  const [selectedAuthor, setSelectedAuthor] = useState<{authorId: number, authorName: string} | null>(null)
  
  const { data: authorBooks, isLoading: isAuthorBooksLoading, error: authorBooksError } = useAuthorBooks(
    selectedAuthor ? selectedAuthor.authorId : null
  )
  
  // Explicit type assertion pro books
  const typedBooks = books as Book[] | undefined

  // Scroll position management
  const { saveScrollPosition } = useScrollPosition({
    scrollPosition: booksScrollPosition,
    setScrollPosition: setBooksScrollPosition,
    enableRestore: !selectedSeries && !selectedAuthor,
  })

  // List search with progressive loading pro hlavní seznam knih
  const booksFilterFn = useCallback((book: Book, searchTerm: string) => {
    return (
      (book.title?.toLowerCase().includes(searchTerm) ?? false) ||
      (book.authors?.some(author => 
        author.name?.toLowerCase().includes(searchTerm) ?? false
      ) ?? false) ||
      (book.tags?.some(tag => tag.toLowerCase().includes(searchTerm)) ?? false) ||
      (book.seriesName?.toLowerCase().includes(searchTerm) ?? false) ||
      (book.language?.toLowerCase().includes(searchTerm) ?? false)
    )
  }, [])

  const {
    filteredItems: filteredBooks,
    totalCount,
    progressiveLoading: { isLoadingMore, handleLoadMore }
  } = useListSearch({
    items: typedBooks,
    searchTerm: booksSearchTerm,
    filterFn: booksFilterFn,
    progressiveLoading: {
      pageSize,
      enableInfiniteScroll: !selectedSeries && !selectedAuthor,
    },
  })

  // Handler pro kliknutí na sérii - optimalizováno s useCallback
  const handleSeriesClick = useCallback((authorId: number, seriesName: string) => {
    saveScrollPosition()
    setSelectedSeries({ authorId, seriesName })
    setSelectedAuthor(null) // Reset author selection
  }, [saveScrollPosition])

  // Handler pro kliknutí na autora - optimalizováno s useCallback
  const handleAuthorClick = useCallback((authorId: number, authorName: string) => {
    saveScrollPosition()
    setSelectedAuthor({ authorId, authorName })
    setSelectedSeries(null) // Reset series selection
  }, [saveScrollPosition])

  // Handler pro návrat k seznamu knih - optimalizováno s useCallback
  const handleBackToBooks = useCallback(() => {
    setSelectedSeries(null)
    setSelectedAuthor(null)
  }, [])

  // Filtrování knih podle série
  const seriesBooks = useMemo(() => {
    if (!selectedSeries || !typedBooks) {
      return []
    }
    
    return typedBooks
      .filter(book => {
        return book.seriesName === selectedSeries.seriesName &&
               book.authors.some(author => author.id === selectedSeries.authorId)
      })
      .sort((a, b) => {
        // Řazení podle seriesNumber
        const numA = a.seriesNumber || 0
        const numB = b.seriesNumber || 0
        return numA - numB
      })
  }, [typedBooks, selectedSeries])

  return (
    <Container maxWidth={false} sx={{ py: 4, px: 4 }}>
      {!selectedSeries && !selectedAuthor ? (
        // Master view - seznam všech knih
        <>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 2 }}>
              <Typography variant="h1" component="h1">
                Knihovna
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {isLoading ? 'Načítání...' : `Zobrazeno ${filteredBooks?.length || 0} z ${totalCount} knih`}
              </Typography>
              {isLoading && <CircularProgress size={16} />}
            </Box>
            
            <SearchInput
              value={booksSearchTerm}
              onChange={setBooksSearchTerm}
              placeholder="Vyhledejte knihu podle názvu, autora, tagů nebo jazyka..."
              disabled={isLoading}
            />
          </Box>

          <BooksList 
            books={filteredBooks}
            isLoading={isLoading && (!typedBooks || (typedBooks?.length || 0) === 0)}
            error={error}
            showLanguage={true}
            maxDescriptionLength={200}
            maxTags={3}
            onSeriesClick={handleSeriesClick}
            onAuthorClick={handleAuthorClick}
          />
          
          <LoadMoreButton
            isLoading={isLoadingMore}
            onLoadMore={handleLoadMore}
            remainingCount={totalCount - (filteredBooks?.length || 0)}
            pageSize={pageSize}
            loadingText="Načítání více knih..."
            loadMoreText={`Načíst další knihy (+${Math.min(pageSize, totalCount - (filteredBooks?.length || 0))})`}
          />
          
          {/* Skeleton loading pro další knihy */}
          {isLoadingMore && (
            <SkeletonLoader variant="books" count={6} />
          )}
        </>
      ) : selectedSeries ? (
        // Detail view - knihy ze série
        <DetailView
          title={selectedSeries.seriesName}
          description={formatBookDescription("série", seriesBooks?.length || 0)}
          onBack={handleBackToBooks}
          books={seriesBooks}
          isLoading={isLoading}
          error={error}
          booksListProps={{
            showLanguage: true,
            maxDescriptionLength: 200,
            maxTags: 3,
          }}
        />
      ) : selectedAuthor ? (
        // Detail view - knihy vybraného autora
        <DetailView
          title={selectedAuthor.authorName}
          description={formatBookDescription("autora", authorBooks?.length || 0)}
          onBack={handleBackToBooks}
          books={authorBooks}
          isLoading={isAuthorBooksLoading}
          error={authorBooksError}
          booksListProps={{
            showLanguage: true,
            maxDescriptionLength: 200,
            maxTags: 3,
            onSeriesClick: handleSeriesClick,
          }}
        />
      ) : null}
    </Container>
  )
}

export default Books