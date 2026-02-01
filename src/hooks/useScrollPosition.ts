import { useEffect, useCallback } from 'react'

interface UseScrollPositionProps {
  /** Aktuální pozice scrollu ze store */
  scrollPosition: number
  /** Funkce pro nastavení pozice do store */
  setScrollPosition: (position: number) => void
  /** Zda je povolené obnovení pozice (např. ne v detailním režimu) */
  enableRestore?: boolean
  /** Zpoždění pro obnovení pozice v ms (výchozí 100) */
  restoreDelay?: number
}

/**
 * Hook pro správu scroll pozic - ukládání a obnovování
 * Automaticky obnovuje pozici při návratu ze subpages
 */
export const useScrollPosition = ({
  scrollPosition,
  setScrollPosition,
  enableRestore = true,
  restoreDelay = 100,
}: UseScrollPositionProps) => {
  // Obnovení scroll pozice při návratu z detailu
  useEffect(() => {
    if (enableRestore && scrollPosition > 0) {
      // Použijeme setTimeout, aby se scroll nastavil až po vykreslení obsahu
      setTimeout(() => {
        window.scrollTo({ top: scrollPosition, behavior: 'auto' })
      }, restoreDelay)
    }
  }, [enableRestore, scrollPosition, restoreDelay])

  // Handler pro uložení aktuální scroll pozice
  const saveScrollPosition = useCallback(() => {
    setScrollPosition(window.scrollY)
  }, [setScrollPosition])

  return {
    saveScrollPosition,
  }
}
