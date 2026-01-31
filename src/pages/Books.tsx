import React, { useState, useMemo, useEffect, useCallback } from 'react'
import {
  Container,
  Typography,
  Box,
  TextField,
  InputAdornment,
  Divider,
  IconButton,
  CircularProgress,
  Skeleton,
} from '@mui/material'
import {
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material'
import { useAllBooks, useAuthorBooks } from '../services/api'
import { useAppStore } from '../store/appStore'
import BooksList from '../components/BooksList'
import type { Book } from '../types/book'

const Books: React.FC = () => {
  const pageSize = 48 // Počet knih načtených najednou (dělitelné 3 kvůli layoutů)
  
  const { data: books, isLoading, error } = useAllBooks()
  const { booksSearchTerm, setBooksSearchTerm, booksScrollPosition, setBooksScrollPosition } = useAppStore()
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [selectedSeries, setSelectedSeries] = useState<{authorId: number, seriesName: string} | null>(null)
  const [selectedAuthor, setSelectedAuthor] = useState<{authorId: number, authorName: string} | null>(null)
  const [displayCount, setDisplayCount] = useState(20) // Počáteční počet zobrazených knih
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  
  const { data: authorBooks, isLoading: isAuthorBooksLoading, error: authorBooksError } = useAuthorBooks(
    selectedAuthor ? selectedAuthor.authorId : null
  )
  
  // Explicit type assertion pro books
  const typedBooks = books as Book[] | undefined

  // Inicializace debounced term ze store při mounztu
  useEffect(() => {
    setDebouncedSearchTerm(booksSearchTerm)
  }, [])
  
  // Obnovení scroll pozice při návratu z detailu
  useEffect(() => {
    if (!selectedSeries && !selectedAuthor && booksScrollPosition > 0) {
      // Použijeme setTimeout, aby se scroll nastavil až po vykreslení obsahu
      setTimeout(() => {
        window.scrollTo({ top: booksScrollPosition, behavior: 'auto' })
      }, 100)
    }
  }, [selectedSeries, selectedAuthor, booksScrollPosition])

  // Handler pro načtení více knih
  const handleLoadMore = useCallback(async () => {
    setIsLoadingMore(true)
    // Simulujeme krátké zpoždění pro UX
    await new Promise(resolve => setTimeout(resolve, 200))
    setDisplayCount(prev => prev + pageSize)
    setIsLoadingMore(false)
  }, [])

  // Reset displayCount při změně filtrů
  useEffect(() => {
    setDisplayCount(20)
  }, [debouncedSearchTerm, selectedSeries])

  // Debounce efekt pro vyhledávání - rychlejší odezva
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(booksSearchTerm)
    }, 150)

    return () => {
      clearTimeout(timer)
    }
  }, [booksSearchTerm])

  // Handling input s useCallback pro optimalizaci
  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setBooksSearchTerm(value)
  }, [setBooksSearchTerm])

  // Handler pro kliknutí na sérii - optimalizováno s useCallback
  const handleSeriesClick = useCallback((authorId: number, seriesName: string) => {
    // Uložení aktuální scroll pozice před přechodem na detail
    setBooksScrollPosition(window.scrollY)
    setSelectedSeries({ authorId, seriesName })
    setSelectedAuthor(null) // Reset author selection
  }, [setBooksScrollPosition])

  // Handler pro kliknutí na autora - optimalizováno s useCallback
  const handleAuthorClick = useCallback((authorId: number, authorName: string) => {
    // Uložení aktuální scroll pozice před přechodem na detail
    setBooksScrollPosition(window.scrollY)
    setSelectedAuthor({ authorId, authorName })
    setSelectedSeries(null) // Reset series selection
  }, [setBooksScrollPosition])

  // Handler pro návrat k seznamu knih - optimalizováno s useCallback
  const handleBackToBooks = useCallback(() => {
    setSelectedSeries(null)
    setSelectedAuthor(null)
  }, [])

  // Filtrování knih s debounce nebo podle série - optimalizované s progressive loading
  const { filteredBooks, totalCount } = useMemo(() => {
    if (!typedBooks) {
      return { filteredBooks: undefined, totalCount: 0 }
    }
    
    let result: Book[] = []
    
    // Pokud je vybrána série, filtruj podle série
    if (selectedSeries) {
      result = typedBooks
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
    }
    // Pokud není vyhledávací termín, zobraz všechny knihy
    else if (!debouncedSearchTerm.trim()) {
      result = typedBooks
    }
    // Filtrování podle vyhledávacího termínu
    else {
      const search = debouncedSearchTerm.toLowerCase()
      result = typedBooks.filter(book => {
        return (
          (book.title?.toLowerCase().includes(search) ?? false) ||
          (book.authors?.some(author => 
            author.name?.toLowerCase().includes(search) ?? false
          ) ?? false) ||
          (book.tags?.some(tag => tag.toLowerCase().includes(search)) ?? false) ||
          (book.seriesName?.toLowerCase().includes(search) ?? false) ||
          (book.language?.toLowerCase().includes(search) ?? false)
        )
      })
    }
    
    // Progressive loading - zobraz jen prvních N knih
    const displayBooks = result.slice(0, displayCount)
    
    return { filteredBooks: displayBooks, totalCount: result.length }
  }, [typedBooks, debouncedSearchTerm, selectedSeries, displayCount])
  
  // Infinite scroll - automatické načítání při dosažení konce stránky
  useEffect(() => {
    const handleScroll = () => {
      // Pouze na hlavní stránce (ne v detailech)
      if (selectedSeries || selectedAuthor) return
      
      const scrollTop = window.pageYOffset
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      
      // Pokud jsme 200px od konce stránky a neloadujeme už
      if (scrollTop + windowHeight >= documentHeight - 200 && !isLoadingMore) {
        // Kontrola, zda máme ještě co načíst
        if (filteredBooks && filteredBooks.length < totalCount) {
          handleLoadMore()
        }
      }
    }
    
    // Přidání scroll listeneru jen na hlavní stránce
    if (!selectedSeries && !selectedAuthor) {
      window.addEventListener('scroll', handleScroll, { passive: true })
      
      return () => {
        window.removeEventListener('scroll', handleScroll)
      }
    }
  }, [selectedSeries, selectedAuthor, isLoadingMore, filteredBooks, totalCount, handleLoadMore])

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
            
            <TextField
              size="small"
              fullWidth
              variant="outlined"
              placeholder="Vyhledejte knihu podle názvu, autora, tagů nebo jazyka..."
              value={booksSearchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
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
          
          {/* Load More Button */}
          {!isLoading && filteredBooks && totalCount > (filteredBooks?.length || 0) && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                style={{
                  padding: '12px 24px',
                  backgroundColor: isLoadingMore ? '#ccc' : '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isLoadingMore ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {isLoadingMore ? (
                  <>
                    <CircularProgress size={16} sx={{ mr: 1, color: 'white' }} />
                    Načítání...
                  </>
                ) : (
                  `Načíst další knihy (+${Math.min(pageSize, totalCount - filteredBooks.length)})`
                )}
              </button>
            </Box>
          )}
          
          {/* Skeleton loading pro další knihy */}
          {isLoadingMore && (
            <Box sx={{ mt: 3 }}>
              {Array.from({ length: 6 }).map((_, index) => (
                <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: '8px' }}>
                  <Skeleton variant="text" width="60%" height={24} />
                  <Skeleton variant="text" width="40%" height={16} sx={{ mt: 1 }} />
                  <Skeleton variant="rectangular" width="100%" height={60} sx={{ mt: 1 }} />
                </Box>
              ))}
            </Box>
          )}
        </>
      ) : selectedSeries ? (
        // Detail view - knihy ze série
        <>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <IconButton onClick={handleBackToBooks} sx={{ mr: 2 }}>
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h1" component="h1">
                {selectedSeries.seriesName}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ ml: 2 }}>
                všechny knihy ze série ({filteredBooks?.length || 0} {(filteredBooks?.length === 1) ? 'kniha' : (filteredBooks?.length && filteredBooks.length < 5) ? 'knihy' : 'knih'})
              </Typography>
            </Box>
            <Divider sx={{ mt: 2 }} />
          </Box>

          <BooksList 
            books={filteredBooks}
            isLoading={isLoading}
            error={error}
            showLanguage={true}
            maxDescriptionLength={200}
            maxTags={3}
          />
        </>
      ) : selectedAuthor ? (
        // Detail view - knihy vybraného autora
        <>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <IconButton onClick={handleBackToBooks} sx={{ mr: 2 }}>
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h1" component="h1">
                {selectedAuthor.authorName}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ ml: 2 }}>
                všechny knihy autora ({authorBooks?.length || 0} {(authorBooks?.length === 1) ? 'kniha' : (authorBooks?.length && authorBooks.length < 5) ? 'knihy' : 'knih'})
              </Typography>
            </Box>
            <Divider sx={{ mt: 2 }} />
          </Box>

          <BooksList 
            books={authorBooks}
            isLoading={isAuthorBooksLoading}
            error={authorBooksError}
            showLanguage={true}
            maxDescriptionLength={200}
            maxTags={3}
            onSeriesClick={handleSeriesClick}
          />
        </>
      ) : null}
    </Container>
  )
}

export default Books