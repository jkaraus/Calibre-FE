import { useState, useEffect, useCallback } from "react";

interface UseProgressiveLoadingProps {
  /** Celkový počet dostupných položek */
  totalItems: number;
  /** Počet položek načtených za jednou (výchozí 48) */
  pageSize?: number;
  /** Počáteční počet zobrazených položek (výchozí 20) */
  initialDisplayCount?: number;
  /** Vzdálenost od konce stránky pro spuštění načítání (výchozí 200px) */
  scrollThreshold?: number;
  /** Zda je infinite scroll aktivní (výchozí true) */
  enableInfiniteScroll?: boolean;
  /** Dependencies pro reset displayCount */
  resetDeps?: unknown[];
}

interface UseProgressiveLoadingReturn {
  /** Aktuální počet zobrazených položek */
  displayCount: number;
  /** Zda probíhá načítání více položek */
  isLoadingMore: boolean;
  /** Funkce pro ruční načtení více položek */
  handleLoadMore: () => Promise<void>;
  /** Zda jsou k dispozici další položky */
  hasMore: boolean;
}

/**
 * Hook pro progressive loading s infinite scroll
 * Automaticky spravuje počet zobrazených položek a infinite scroll
 */
export const useProgressiveLoading = ({
  totalItems,
  pageSize = 48,
  initialDisplayCount = 20,
  scrollThreshold = 200,
  enableInfiniteScroll = true,
  resetDeps = [],
}: UseProgressiveLoadingProps): UseProgressiveLoadingReturn => {
  const [displayCount, setDisplayCount] = useState(initialDisplayCount);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Reset displayCount při změně dependencies - používáme flag pro sledování změn
  const [lastResetDeps, setLastResetDeps] = useState<unknown[]>(resetDeps);

  // Kontrola změn dependencies a reset
  const depsChanged =
    resetDeps.some((dep, index) => dep !== lastResetDeps[index]) ||
    resetDeps.length !== lastResetDeps.length;

  if (depsChanged) {
    setDisplayCount(initialDisplayCount);
    setLastResetDeps(resetDeps);
  }

  // Handler pro načtení více položek
  const handleLoadMore = useCallback(async () => {
    setIsLoadingMore(true);
    // Simulujeme krátké zpoždění pro UX
    await new Promise((resolve) => setTimeout(resolve, 200));
    setDisplayCount((prev) => prev + pageSize);
    setIsLoadingMore(false);
  }, [pageSize]);

  // Infinite scroll efekt
  useEffect(() => {
    if (!enableInfiniteScroll) {
      return;
    }

    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Pokud jsme scrollThreshold px od konce stránky a neloadujeme už
      if (
        scrollTop + windowHeight >= documentHeight - scrollThreshold &&
        !isLoadingMore
      ) {
        // Kontrola, zda máme ještě co načíst
        if (displayCount < totalItems) {
          handleLoadMore();
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [
    displayCount,
    totalItems,
    isLoadingMore,
    handleLoadMore,
    enableInfiniteScroll,
    scrollThreshold,
  ]);

  const hasMore = displayCount < totalItems;

  return {
    displayCount,
    isLoadingMore,
    handleLoadMore,
    hasMore,
  };
};
