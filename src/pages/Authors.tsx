import React, { useState, useMemo, useEffect, useCallback } from 'react'
import {
  Container,
  Typography,
  Box,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Skeleton,
} from '@mui/material'
import {
  Search as SearchIcon,
  Person as PersonIcon,
  MenuBook as BookIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material'
import { useAllAuthors, useAuthorBooks, useAllBooks } from '../services/api'
import { useAppStore } from '../store/appStore'
import BooksList from '../components/BooksList'
import type { Author } from '../types/author'

// Memoizovaná komponenta pro řádek autora
const AuthorRow = React.memo<{
  author: Author
  onSelect: (author: Author) => void
}>(({ author, onSelect }) => (
  <TableRow onClick={() => onSelect(author)}>
    <TableCell component="th" scope="row">
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="body2">
          {author.sort || author.name}
        </Typography>
      </Box>
    </TableCell>
    <TableCell>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <BookIcon sx={{ mr: 1, fontSize: 'small', color: 'text.secondary' }} />
        <Typography variant="body2">
          {author.bookCount} {author.bookCount === 1 ? 'kniha' : author.bookCount < 5 ? 'knihy' : 'knih'}
        </Typography>
      </Box>
    </TableCell>
    <TableCell>
      <Typography variant="body2" color="primary.main" sx={{ textDecoration: 'underline' }}>
        Zobrazit knihy
      </Typography>
    </TableCell>
  </TableRow>
))

AuthorRow.displayName = 'AuthorRow'

const Authors: React.FC = () => {
  const pageSize = 48 // Počet autorů načtených najednou
  
  const { data: authors, isLoading, error } = useAllAuthors()
  const { data: allBooks } = useAllBooks()
  const { authorsSearchTerm, setAuthorsSearchTerm, authorsScrollPosition, setAuthorsScrollPosition } = useAppStore()
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null)
  const [selectedSeries, setSelectedSeries] = useState<{authorId: number, seriesName: string} | null>(null)
  const [orderBy, setOrderBy] = useState<keyof Author>('sort')
  const [order, setOrder] = useState<'asc' | 'desc'>('asc')
  const [displayCount, setDisplayCount] = useState(20) // Počáteční počet zobrazených autorů
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  
  const { data: authorBooks, isLoading: authorBooksLoading, error: authorBooksError } = useAuthorBooks(selectedAuthor?.id || null)

  // Inicializace debounced term ze store při mounztu
  useEffect(() => {
    setDebouncedSearchTerm(authorsSearchTerm)
  }, [])
  
  // Obnovení scroll pozice při návratu z detailu
  useEffect(() => {
    if (!selectedAuthor && !selectedSeries && authorsScrollPosition > 0) {
      // Použijeme setTimeout, aby se scroll nastavil až po vykreslení obsahu
      setTimeout(() => {
        window.scrollTo({ top: authorsScrollPosition, behavior: 'auto' })
      }, 100)
    }
  }, [selectedAuthor, selectedSeries, authorsScrollPosition])

  // Handler pro načtení více autorů
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
  }, [debouncedSearchTerm])

  // Debounce efekt pro vyhledávání - rychlejší odezva
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(authorsSearchTerm)
    }, 150)

    return () => {
      clearTimeout(timer)
    }
  }, [authorsSearchTerm])

  // Handling input s useCallback pro optimalizaci
  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setAuthorsSearchTerm(value)
  }, [setAuthorsSearchTerm])

  // Handler pro výběr autora - optimalizováno s useCallback
  const handleAuthorSelect = useCallback((author: Author) => {
    // Uložení aktuální scroll pozice před přechodem na detail
    setAuthorsScrollPosition(window.scrollY)
    setSelectedAuthor(author)
  }, [setAuthorsScrollPosition])

  // Handler pro návrat k seznamu autorů - optimalizováno s useCallback
  const handleBackToAuthors = useCallback(() => {
    setSelectedAuthor(null)
    setSelectedSeries(null)
  }, [])

  // Handler pro kliknutí na sérii
  const handleSeriesClick = useCallback((authorId: number, seriesName: string) => {
    // Uložení aktuální scroll pozice před přechodem na detail
    setAuthorsScrollPosition(window.scrollY)
    setSelectedSeries({ authorId, seriesName })
  }, [setAuthorsScrollPosition])

  // Handler pro návrat ze série k autorovi
  const handleBackToAuthor = useCallback(() => {
    setSelectedSeries(null)
  }, [])

  // Handler pro změnu třídění
  const handleRequestSort = useCallback((property: keyof Author) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }, [order, orderBy])

  // Filtrování a třídění autorů s debounce - optimalizované s progressive loading
  const { filteredAuthors, totalCount } = useMemo(() => {
    if (!authors) {
      return { filteredAuthors: authors, totalCount: 0 }
    }
    
    let result = authors
    
    // Pokud není vyhledávací termín, zobraz všechny autory
    if (debouncedSearchTerm.trim()) {
      const search = debouncedSearchTerm.toLowerCase()
      result = authors.filter(author => {
        // Použijeme optional chaining a explicitní kontrolu
        return author.name?.toLowerCase().includes(search) ?? false
      })
    }
    
    // Setřídění podle vybraného sloupce
    const sorted = result.sort((a, b) => {
      const aValue = a[orderBy]
      const bValue = b[orderBy]
      
      // Speciální handling pro různé typy dat
      if (orderBy === 'bookCount') {
        const numA = typeof aValue === 'number' ? aValue : 0
        const numB = typeof bValue === 'number' ? bValue : 0
        return order === 'asc' ? numA - numB : numB - numA
      }
      
      // Pro string hodnoty
      const strA = (aValue?.toString() ?? '').toLowerCase()
      const strB = (bValue?.toString() ?? '').toLowerCase()
      const comparison = strA.localeCompare(strB, 'cs', { numeric: true })
      
      return order === 'asc' ? comparison : -comparison
    })
    
    // Progressive loading - zobraz jen prvních N autorů
    const displayAuthors = sorted.slice(0, displayCount)
    
    return { filteredAuthors: displayAuthors, totalCount: sorted.length }
  }, [authors, debouncedSearchTerm, order, orderBy, displayCount])
  
  // Infinite scroll - automatické načítání při dosažení konce stránky
  useEffect(() => {
    const handleScroll = () => {
      // Pouze na hlavní stránce (ne v detailech)
      if (selectedAuthor || selectedSeries) return
      
      const scrollTop = window.pageYOffset
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      
      // Pokud jsme 200px od konce stránky a neloadujeme už
      if (scrollTop + windowHeight >= documentHeight - 200 && !isLoadingMore) {
        // Kontrola, zda máme ještě co načíst
        if (filteredAuthors && filteredAuthors.length < totalCount) {
          handleLoadMore()
        }
      }
    }
    
    // Přidání scroll listeneru jen na hlavní stránce
    if (!selectedAuthor && !selectedSeries) {
      window.addEventListener('scroll', handleScroll, { passive: true })
      
      return () => {
        window.removeEventListener('scroll', handleScroll)
      }
    }
  }, [selectedAuthor, selectedSeries, isLoadingMore, filteredAuthors, totalCount, handleLoadMore])

  // Filtrování knih podle série
  const seriesBooks = useMemo(() => {
    if (!selectedSeries || !allBooks) {
      return []
    }
    
    return allBooks
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
  }, [allBooks, selectedSeries])

  // Seřazení knih autora podle seriesNumber
  const sortedAuthorBooks = useMemo(() => {
    if (!authorBooks) {
      return authorBooks
    }
    
    return [...authorBooks].sort((a, b) => {
      // Knihy bez série na konec
      if (!a.seriesName && !b.seriesName) return 0
      if (!a.seriesName) return 1
      if (!b.seriesName) return -1
      
      // Pokud jsou ze stejné série, řaď podle seriesNumber
      if (a.seriesName === b.seriesName) {
        const numA = a.seriesNumber || 0
        const numB = b.seriesNumber || 0
        return numA - numB
      }
      
      // Jinak řaď podle názvu série
      return a.seriesName.localeCompare(b.seriesName, 'cs')
    })
  }, [authorBooks])

  if (isLoading) {
    return (
      <Box sx={{ py: 4, px: 4, width: '100%' }}>
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ py: 4, px: 4, width: '100%' }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Chyba při načítání autorů: {error.message}
        </Alert>
      </Box>
    )
  }

  return (
    <Container maxWidth={false} sx={{ py: 4, px: 4 }}>
      {!selectedAuthor && !selectedSeries ? (
        // Master view - seznam autorů
        <>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 2 }}>
              <Typography variant="h1" component="h1">
                Autoři
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {isLoading ? 'Načítání...' : `Zobrazeno ${filteredAuthors?.length || 0} z ${totalCount} autorů`}
              </Typography>
              {isLoading && <CircularProgress size={16} />}
            </Box>
            
            <TextField
              size="small"
              fullWidth
              variant="outlined"
              placeholder="Vyhledejte autora podle jména..."
              value={authorsSearchTerm}
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

          {filteredAuthors && filteredAuthors.length > 0 ? (
            <Box>
              <TableContainer component={Paper} sx={{ width: '100%' }}>
                <Table sx={{ width: '100%' }} aria-label="authors table">
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <TableSortLabel
                          active={orderBy === 'sort'}
                          direction={orderBy === 'sort' ? order : 'asc'}
                          onClick={() => handleRequestSort('sort')}
                        >
                          Autor
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={orderBy === 'bookCount'}
                          direction={orderBy === 'bookCount' ? order : 'asc'}
                          onClick={() => handleRequestSort('bookCount')}
                        >
                          Počet knih
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>Akce</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredAuthors.map((author) => (
                      <AuthorRow
                        key={author.id}
                        author={author}
                        onSelect={handleAuthorSelect}
                      />
                    ))}
                    
                    {/* Skeleton loading pro načítání dalších autorů */}
                    {isLoadingMore && (
                      <>
                        {Array.from({ length: 5 }, (_, index) => (
                          <TableRow key={`skeleton-${index}`}>
                            <TableCell component="th" scope="row">
                              <Skeleton variant="text" width="40%" />
                            </TableCell>
                            <TableCell>
                              <Skeleton variant="text" width="30%" />
                            </TableCell>
                            <TableCell>
                              <Skeleton variant="text" width="60%" />
                            </TableCell>
                          </TableRow>
                        ))}
                      </>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {/* Load More tlačítko */}
              {filteredAuthors.length < totalCount && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Box
                    component="button"
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    sx={{
                      border: '1px solid',
                      borderColor: 'primary.main',
                      borderRadius: 1,
                      backgroundColor: 'transparent',
                      color: 'primary.main',
                      padding: '8px 16px',
                      cursor: isLoadingMore ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      '&:hover': {
                        backgroundColor: isLoadingMore ? 'transparent' : 'primary.main',
                        color: isLoadingMore ? 'primary.main' : 'white',
                      },
                      '&:disabled': {
                        opacity: 0.6,
                      },
                    }}
                  >
                    {isLoadingMore && <CircularProgress size={16} />}
                    {isLoadingMore ? 'Načítání dalších autorů...' : `Načíst dalších ${Math.min(pageSize, totalCount - filteredAuthors.length)} autorů (${totalCount - filteredAuthors.length} zbývá)`}
                  </Box>
                </Box>
              )}
            </Box>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="text.secondary">
                {debouncedSearchTerm.trim() ? 'Žádní autoři odpovídající vašemu vyhledávání nebyli nalezeni.' : 'Žádní autoři nebyly nalezeni.'}
              </Typography>
            </Box>
          )}
        </>
      ) : selectedAuthor && !selectedSeries ? (
        // Detail view - knihy autora
        <>
          <Box sx={{ mb: 4, px: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <IconButton onClick={handleBackToAuthors} sx={{ mr: 2 }}>
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h1" component="h1">
                {selectedAuthor.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ ml: 2 }}>
                knihy od tohoto autora ({selectedAuthor.bookCount} {selectedAuthor.bookCount === 1 ? 'kniha' : selectedAuthor.bookCount < 5 ? 'knihy' : 'knih'})
              </Typography>
            </Box>
            <Divider sx={{ mt: 2 }} />
          </Box>

          <Box sx={{ px: 2 }}>
            <BooksList 
              books={sortedAuthorBooks}
              isLoading={authorBooksLoading}
              error={authorBooksError}
              showLanguage={true}
              maxDescriptionLength={200}
              maxTags={3}
              onSeriesClick={handleSeriesClick}
              onAuthorClick={(authorId) => {
                const author = authors?.find(a => a.id === authorId)
                if (author) {
                  handleAuthorSelect(author)
                }
              }}
            />
          </Box>
        </>
      ) : (
        // Series view - knihy ze série
        <>
          <Box sx={{ mb: 4, px: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <IconButton onClick={handleBackToAuthor} sx={{ mr: 2 }}>
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h1" component="h1">
                {selectedSeries?.seriesName}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ ml: 2 }}>
                všechny knihy ze série ({seriesBooks.length} {seriesBooks.length === 1 ? 'kniha' : seriesBooks.length < 5 ? 'knihy' : 'knih'})
              </Typography>
            </Box>
            <Divider sx={{ mt: 2 }} />
          </Box>

          <Box sx={{ px: 2 }}>
            <BooksList 
              books={seriesBooks}
              isLoading={false}
              error={null}
              showLanguage={true}
              maxDescriptionLength={200}
              maxTags={3}
            />
          </Box>
        </>
      )}
    </Container>
  )
}

export default Authors