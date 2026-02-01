import { useQuery } from "@tanstack/react-query";
import type { Book, RecentBooksParams } from "../types/book";
import type { Author } from "../types/author";

// API endpoints - using Vite proxy
const BOOKS_API_BASE_URL = "/api";

// Common fetch configuration
const defaultFetchOptions: RequestInit = {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
  mode: "cors",
};

// Generic API fetch utility
const fetchFromAPI = async <T>(endpoint: string): Promise<T> => {
  const url = `${BOOKS_API_BASE_URL}${endpoint}`;

  try {
    // console.log("Fetching from:", url);
    const response = await fetch(url, defaultFetchOptions);

    // console.log("Response status:", response.status);

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    // console.log(
    //   "Received data length:",
    //   Array.isArray(data) ? data.length : "N/A",
    // );
    return data;
  } catch (error) {
    console.error("API fetch error:", error);
    throw error;
  }
};

// Books API functions
const fetchRecentBooks = async (
  params: RecentBooksParams = {},
): Promise<Book[]> => {
  const { limit = 10 } = params;
  return fetchFromAPI<Book[]>(`/books/recent?limit=${limit}`);
};

const fetchAllBooks = async (): Promise<Book[]> => {
  return fetchFromAPI<Book[]>("/books");
};

const fetchBooksCount = async (): Promise<number> => {
  return fetchFromAPI<number>("/books/count");
};

const fetchAuthorsCount = async (): Promise<number> => {
  return fetchFromAPI<number>("/authors/count");
};

const fetchAllAuthors = async (): Promise<Author[]> => {
  return fetchFromAPI<Author[]>("/authors");
};

const fetchAuthorBooks = async (authorId: number): Promise<Book[]> => {
  return fetchFromAPI<Book[]>(`/author/books/${authorId}`);
};

// Books React Query hooks
export const useRecentBooks = (params: RecentBooksParams = {}) => {
  return useQuery({
    queryKey: ["books", "recent", params],
    queryFn: () => fetchRecentBooks(params),
    staleTime: 30 * 60 * 1000, // 30 minut - data jsou stála
    gcTime: 60 * 60 * 1000, // 1 hodina - uchování v cache
  });
};

export const useAllBooks = () => {
  return useQuery({
    queryKey: ["books", "all"],
    queryFn: fetchAllBooks,
    staleTime: 30 * 60 * 1000, // 30 minut - data jsou stála
    gcTime: 60 * 60 * 1000, // 1 hodina - uchování v cache
  });
};

export const useBooksCount = () => {
  return useQuery({
    queryKey: ["books", "count"],
    queryFn: fetchBooksCount,
    staleTime: 30 * 60 * 1000, // 30 minut - data jsou stála
    gcTime: 60 * 60 * 1000, // 1 hodina - uchování v cache
  });
};

export const useAuthorsCount = () => {
  return useQuery({
    queryKey: ["authors", "count"],
    queryFn: fetchAuthorsCount,
    staleTime: 30 * 60 * 1000, // 30 minut - data jsou stála
    gcTime: 60 * 60 * 1000, // 1 hodina - uchování v cache
  });
};

export const useAllAuthors = () => {
  return useQuery({
    queryKey: ["authors", "all"],
    queryFn: fetchAllAuthors,
    staleTime: 30 * 60 * 1000, // 30 minut - data jsou stála
    gcTime: 60 * 60 * 1000, // 1 hodina - uchování v cache
  });
};

export const useAuthorBooks = (authorId: number | null) => {
  return useQuery({
    queryKey: ["author", "books", authorId],
    queryFn: () => fetchAuthorBooks(authorId!),
    enabled: !!authorId,
    staleTime: 30 * 60 * 1000, // 30 minut - data jsou stála
    gcTime: 60 * 60 * 1000, // 1 hodina - uchování v cache
  });
};
