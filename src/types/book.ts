import type { Author } from './author'

export interface Format {
  id: number
  type: string
  fileName: string
}

export interface Book {
  id: number
  title: string
  comments: string
  language: string
  path: string
  hasCover: boolean
  seriesName: string | null
  seriesNumber: number
  publishDate: string | null
  insertDate: string
  authors: Author[]
  formats: Format[]
  tags: string[]
  titleAndSeries: string
}

export interface RecentBooksResponse extends Array<Book> {}

// Query parameters pro recent books endpoint
export interface RecentBooksParams {
  limit?: number
}

// Count API responses
export interface BooksCountResponse extends Number {}
export interface AuthorsCountResponse extends Number {}