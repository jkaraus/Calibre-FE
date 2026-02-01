import React from 'react'
import {
  TextField,
  InputAdornment,
} from '@mui/material'
import {
  Search as SearchIcon,
} from '@mui/icons-material'

interface SearchInputProps {
  /** Aktuální hodnota vyhledávání */
  value: string
  /** Callback pro změnu hodnoty */
  onChange: (value: string) => void
  /** Placeholder text */
  placeholder?: string
  /** Zda je input v loading stavu */
  disabled?: boolean
  /** Velikost inputu */
  size?: 'small' | 'medium'
}

/**
 * Konzistentní komponenta pro vyhledávání napříč aplikací
 * Používá standardní Material-UI TextField se search ikonou
 */
export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Vyhledávání...',
  disabled = false,
  size = 'small',
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value)
  }

  return (
    <TextField
      size={size}
      fullWidth
      variant="outlined"
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      disabled={disabled}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
      }}
    />
  )
}
