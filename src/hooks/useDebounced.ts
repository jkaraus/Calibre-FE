import { useState, useEffect } from 'react'

/**
 * Hook pro debounced hodnotu - optimalizuje vyhledávání
 * @param value Vstupní hodnota k debounce
 * @param delay Zpoždění v ms (výchozí 150ms)
 * @returns Debounced hodnota
 */
export const useDebounced = <T>(value: T, delay: number = 150): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}
