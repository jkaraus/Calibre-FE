export const API_ENDPOINTS = {
  BOOKS_RECENT: "/books/recent",
  BOOKS_ALL: "/books",
} as const;

export const QUERY_KEYS = {
  BOOKS: ["books"] as const,
  BOOKS_RECENT: ["books", "recent"] as const,
  BOOKS_ALL: ["books", "all"] as const,
} as const;

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat("cs-CZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
};

export const truncateText = (text: string, maxLength: number): string => {
  return text.length <= maxLength ? text : `${text.slice(0, maxLength)}...`;
};
