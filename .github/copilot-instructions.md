# Copilot Instructions - React Book Library

## Architecture Overview
This is a modern React book library application built with performance optimizations for browsing Calibre book databases. The app follows a layered architecture:

- **API Layer**: `services/api.ts` - Centralized fetch utilities with proxy configuration via Vite (`/api` → `http://localhost:5022`)
- **State Management**: Zustand store (`store/appStore.ts`) for global UI state + TanStack Query for server state caching
- **Routing**: TanStack Router with file-based route definitions in `main.tsx`
- **UI**: Material-UI v6 with custom theme system supporting dark/light mode
- **Shared Hooks**: Custom hooks in `hooks/` for common functionality (debouncing, progressive loading, scroll position management)
- **Reusable Components**: Shared components in `components/` for consistent UI patterns

## Shared Hooks & Components Architecture

### Core Hooks
- **`useDebounced(value, delay)`**: Debounced values with 150ms default delay for search optimization
- **`useProgressiveLoading(props)`**: Progressive loading with infinite scroll, page size management, and loading states
- **`useScrollPosition(props)`**: Automatic scroll position saving and restoration for navigation
- **`useListSearch(props)`**: Combined debounced search, filtering, sorting, and progressive loading for lists

### Reusable Components
- **`SearchInput`**: Consistent search input with Material-UI styling and search icon
- **`LoadMoreButton`**: Standardized load more button with loading states and item counts
- **`SkeletonLoader`**: Universal skeleton loading for different content types (books, authors, cards)
- **`DetailHeader`**: Consistent header for detail views with back button and title
- **`DetailView`**: Complete detail view component combining DetailHeader with BooksList

### Utility Functions
- **`formatBookDescription`**: Czech localized book count descriptions (e.g., "všechny knihy ze série (5 knih)")
- **`getBookCountText`**: Proper Czech pluralization for book counts (kniha/knihy/knih)

## Performance Patterns

### Progressive Loading & Infinite Scroll
All listing pages use the `useListSearch` and `useProgressiveLoading` hooks:
- Start with 20 items, expand by pageSize (48) with user interaction
- Automatic infinite scroll when scroll threshold reached (200px from bottom)
- Manual "Load More" buttons as fallback
- Skeleton loading during incremental loads

### Debounced Search
All search inputs use `useDebounced` hook:
- 150ms delay to prevent excessive API calls
- Automatic reset of display count when search term changes
- Search across multiple fields (title, author, tags, series, language)

### State Persistence
Global search terms and scroll positions preserved across navigation:
```typescript
// In appStore.ts - maintains search/scroll state
booksSearchTerm: string
authorsSearchTerm: string
booksScrollPosition: number
authorsScrollPosition: number
```

### Optimized Filtering & Sorting
- Filter functions defined with `useCallback` for performance
- Sort functions with Czech locale support (`cs`, numeric: true)
- Type-safe filtering with optional chaining and null coalescing

## Component Development Guidelines

### New List Pages
When creating new listing pages, use this pattern:
```typescript
const {
  filteredItems,
  totalCount,
  progressiveLoading: { isLoadingMore, handleLoadMore }
} = useListSearch({
  items: data,
  searchTerm: searchTermFromStore,
  filterFn: useCallback((item, term) => /* filter logic */, []),
  sortFn: useCallback((a, b) => /* sort logic */, [sortBy, sortOrder]),
  progressiveLoading: { pageSize: 48, enableInfiniteScroll: true },
})
```

### Scroll Position Management
For pages with navigation to detail views:
```typescript
const { saveScrollPosition } = useScrollPosition({
  scrollPosition: scrollPositionFromStore,
  setScrollPosition: setScrollPositionInStore,
  enableRestore: !isInDetailView,
})

const handleNavigateToDetail = useCallback(() => {
  saveScrollPosition()
  // navigate to detail
}, [saveScrollPosition])
```

### Consistent Detail Views
Use `DetailView` component for all detail pages (series, author views):
```tsx
<DetailView
  title="Serie Name"
  description={formatBookDescription("série", bookCount)}
  onBack={handleBack}
  books={books}
  isLoading={isLoading}
  error={error}
  withPadding={true} // for pages needing extra padding
  booksListProps={{
    showLanguage: true,
    maxDescriptionLength: 200,
    maxTags: 3,
    onSeriesClick: handleSeriesClick,
    onAuthorClick: handleAuthorClick,
  }}
/>
```

### Czech Localization Utilities
Use proper Czech pluralization and formatting:
```typescript
import { formatBookDescription, getBookCountText } from '../utils/localization'

// Correct Czech pluralization
const description = formatBookDescription("série", count) // "všechny knihy ze série (5 knih)"
const bookText = getBookCountText(count) // "kniha", "knihy", or "knih"
```

### Loading States
Use appropriate `SkeletonLoader` variants:
- `"books"` - For book listings with card layouts
- `"authors"` - For table-based author listings  
- `"cards"` - For generic card-based content

## Development Workflows

### Starting Development
```bash
npm run dev  # Starts Vite dev server with proxy to localhost:5022
```

### API Integration
The app expects a Calibre API server on port 5022. Vite proxy configuration handles CORS:
```typescript
// vite.config.ts
proxy: { '/api': { target: 'http://localhost:5022' } }
```

## Data Flow Patterns

### Query Keys Convention
Organized hierarchical query keys in `utils/constants.ts`:
```typescript
QUERY_KEYS = {
  BOOKS: ['books'],
  BOOKS_RECENT: ['books', 'recent'],
  BOOKS_ALL: ['books', 'all'],
}
```

### Error Handling
Custom `useNotification` hook provides consistent error messaging with auto-dismiss timers (3s success, 5s errors).

### Type Safety
Comprehensive TypeScript types in `types/` folder with explicit interface definitions for Book, Author, and Format entities. API responses use type assertions for runtime safety.

## Component Patterns

### Layout Structure
- `Layout.tsx` provides consistent navigation with theme toggle
- Pages follow container pattern: `Container` → content sections
- Responsive grid layouts (3-column on desktop, adaptive on mobile)

### Event Handling
- All event handlers use `useCallback` for performance optimization
- Click handlers passed as props for series/author navigation
- Scroll event listeners with throttling for infinite scroll

## Localization
Czech language throughout with consistent terminology:
- "Knihy" (Books), "Autoři" (Authors), "O aplikaci" (About)
- Date formatting using Czech locale (`cs-CZ`)
- Error messages and notifications in Czech
- Proper Czech pluralization rules in UI text

## Performance Best Practices
- Use `React.memo` for expensive list item components (e.g., `AuthorRow`)
- Implement `useCallback` for all event handlers and filter/sort functions
- Use optional chaining (`?.`) and nullish coalescing (`??`) for safe data access
- Progressive loading prevents rendering large lists at once
- Skeleton loading provides immediate visual feedback

When adding new features, follow these established patterns for consistency with the existing codebase. Use the shared hooks and components to maintain performance and UX consistency.