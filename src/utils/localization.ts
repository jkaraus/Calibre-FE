/**
 * Pomocné funkce pro český lokalizace a pluralizaci
 */

/**
 * Vrátí správný český tvar pro počet knih
 * @param count Počet knih
 * @returns Správný český tvar (kniha/knihy/knih)
 */
export const getBookCountText = (count: number): string => {
  if (count === 1) {
    return "kniha";
  }
  if (count >= 2 && count <= 4) {
    return "knihy";
  }
  return "knih";
};

/**
 * Vrátí český popis s počtem knih (např. "všechny knihy ze série (5 knih)")
 * @param type Typ ("série", "autora", apod.)
 * @param count Počet knih
 * @param prefix Prefix ("všechny knihy ze", "knihy od tohoto", apod.)
 * @returns Formátovaný český popis
 */
export const formatBookDescription = (
  type: string,
  count: number,
  prefix: string = "všechny knihy",
): string => {
  const bookText = getBookCountText(count);
  return `${prefix} ${type} (${count} ${bookText})`;
};
