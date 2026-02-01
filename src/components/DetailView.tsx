import React from 'react'
import { Box } from '@mui/material'
import BooksList from './BooksList'
import { DetailHeader } from './DetailHeader'
import type { Book } from '../types/book'

interface DetailViewProps {
  /** Titulek detail view */
  title: string
  /** Popisný text */
  description: string
  /** Callback pro navácení zpět */
  onBack: () => void
  /** Knihy k zobrazení */
  books: Book[] | undefined
  /** Loading stav */
  isLoading: boolean
  /** Chyba */
  error: any
  /** Přidatěné paddingu pro obsah */
  withPadding?: boolean
  /** Props pro BooksList */
  booksListProps?: {
    showLanguage?: boolean
    maxDescriptionLength?: number
    maxTags?: number
    onSeriesClick?: (authorId: number, seriesName: string) => void
    onAuthorClick?: (authorId: number, authorName?: string) => void
  }
}

/**
 * Univerzální komponenta pro detail view s header a BooksList
 * Sdílí se mezi všemi stránkami pro konzistentní UX
 */
export const DetailView: React.FC<DetailViewProps> = ({
  title,
  description,
  onBack,
  books,
  isLoading,
  error,
  withPadding = false,
  booksListProps = {},
}) => {
  const {
    showLanguage = true,
    maxDescriptionLength = 200,
    maxTags = 3,
    onSeriesClick,
    onAuthorClick,
  } = booksListProps

  return (
    <>
      <DetailHeader
        title={title}
        description={description}
        onBack={onBack}
        withPadding={withPadding}
      />
      
      <Box sx={{ ...(withPadding && { px: 2 }) }}>
        <BooksList 
          books={books}
          isLoading={isLoading}
          error={error}
          showLanguage={showLanguage}
          maxDescriptionLength={maxDescriptionLength}
          maxTags={maxTags}
          onSeriesClick={onSeriesClick}
          onAuthorClick={onAuthorClick}
        />
      </Box>
    </>
  )
}
