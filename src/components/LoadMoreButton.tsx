import React from 'react'
import {
  Box,
  CircularProgress,
  Button,
  Typography,
} from '@mui/material'

interface LoadMoreButtonProps {
  /** Zda probíhá načítání */
  isLoading: boolean
  /** Callback pro načtení více položek */
  onLoadMore: () => void
  /** Počet dalších položek k načtení */
  remainingCount: number
  /** Počet položek načtených za jednou */
  pageSize: number
  /** Text pro tlačítko (nepovinné) */
  loadingText?: string
  /** Text pro tlačítko load more (nepovinné) */
  loadMoreText?: string
}

/**
 * Univerzální komponenta pro Load More tlačítko
 * Zobrazuje informace o zbývajících položkách a loading stav
 */
export const LoadMoreButton: React.FC<LoadMoreButtonProps> = ({
  isLoading,
  onLoadMore,
  remainingCount,
  pageSize,
  loadingText = 'Načítání...',
  loadMoreText,
}) => {
  if (remainingCount <= 0) {
    return null
  }

  const itemsToLoad = Math.min(pageSize, remainingCount)
  const defaultLoadMoreText = `Načíst dalších ${itemsToLoad} (${remainingCount} zbývá)`

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
      <Button
        variant="outlined"
        onClick={onLoadMore}
        disabled={isLoading}
        startIcon={isLoading ? <CircularProgress size={16} /> : undefined}
        sx={{
          minWidth: '200px',
          '&:disabled': {
            opacity: 0.6,
          },
        }}
      >
        <Typography variant="body2" component="span">
          {isLoading ? loadingText : (loadMoreText || defaultLoadMoreText)}
        </Typography>
      </Button>
    </Box>
  )
}
