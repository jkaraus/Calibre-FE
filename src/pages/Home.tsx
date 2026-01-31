import React, { useState, useMemo } from 'react'
import {
  Container,
  Typography,
  Box,
  Divider,
  IconButton,
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material'
import { useRecentBooks, useBooksCount, useAuthorsCount, useAllBooks, useAuthorBooks } from '../services/api'
import BooksList from '../components/BooksList'

const Home: React.FC = () => {
  const [selectedSeries, setSelectedSeries] = useState<{authorId: number, seriesName: string} | null>(null)
  const [selectedAuthor, setSelectedAuthor] = useState<{authorId: number, authorName: string} | null>(null)
  
  const { data: recentBooks, isLoading: booksLoading, error: booksError } = useRecentBooks({ limit: 9 })
  const { data: allBooks, isLoading: allBooksLoading, error: allBooksError } = useAllBooks()
  const { data: booksCount } = useBooksCount()
  const { data: authorsCount } = useAuthorsCount()
  
  const { data: authorBooks, isLoading: isAuthorBooksLoading, error: authorBooksError } = useAuthorBooks(
    selectedAuthor ? selectedAuthor.authorId : null
  )

  // Handler pro kliknutí na sérii
  const handleSeriesClick = (authorId: number, seriesName: string) => {
    setSelectedSeries({ authorId, seriesName })
    setSelectedAuthor(null) // Reset author selection
  }

  // Handler pro kliknutí na autora
  const handleAuthorClick = (authorId: number, authorName: string) => {
    setSelectedAuthor({ authorId, authorName })
    setSelectedSeries(null) // Reset series selection
  }

  // Handler pro návrat k home
  const handleBackToHome = () => {
    setSelectedSeries(null)
    setSelectedAuthor(null)
  }

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

  return (
    <Container maxWidth={false} sx={{ py: 4, px: 4 }}>
      {!selectedSeries && !selectedAuthor ? (
        // Master view - nejnovější knihy
        <>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
              <Typography variant="h1" component="h1">
                Nejnovější knihy
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {booksCount || '...'} knih
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {authorsCount || '...'} autorů
              </Typography>
            </Box>
          </Box>

          <BooksList 
            books={recentBooks}
            isLoading={booksLoading}
            error={booksError}
            maxDescriptionLength={150}
            maxTags={2}
            onSeriesClick={handleSeriesClick}
            onAuthorClick={handleAuthorClick}
          />
        </>
      ) : selectedSeries ? (
        // Detail view - knihy ze série
        <>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <IconButton onClick={handleBackToHome} sx={{ mr: 2 }}>
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h1" component="h1">
                {selectedSeries.seriesName}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ ml: 2 }}>
                všechny knihy ze série ({seriesBooks.length} {seriesBooks.length === 1 ? 'kniha' : seriesBooks.length < 5 ? 'knihy' : 'knih'})
              </Typography>
            </Box>
            <Divider sx={{ mt: 2 }} />
          </Box>

          <BooksList 
            books={seriesBooks}
            isLoading={allBooksLoading}
            error={allBooksError}
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
              <IconButton onClick={handleBackToHome} sx={{ mr: 2 }}>
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

export default Home