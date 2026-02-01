import React, { useState, useMemo, useCallback } from "react";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
} from "@mui/material";
import {
  MenuBook as BookIcon,
  Group as AuthorsIcon,
} from "@mui/icons-material";
import { useAllAuthors, useAuthorBooks, useAllBooks } from "../services/api";
import { useAppStore } from "../store/appStore";
import {
  SearchInput,
  LoadMoreButton,
  SkeletonLoader,
  DetailView,
} from "../components";
import { useListSearch } from "../hooks/useListSearch";
import { useScrollPosition } from "../hooks/useScrollPosition";
import { formatBookDescription, getBookCountText } from "../utils/localization";
import type { Author } from "../types/author";

// Memoizovaná komponenta pro řádek autora
const AuthorRow = React.memo<{
  author: Author;
  onSelect: (author: Author) => void;
}>(({ author, onSelect }) => (
  <TableRow
    onClick={() => onSelect(author)}
    sx={{ cursor: "pointer", "&:hover": { backgroundColor: "action.hover" } }}
  >
    <TableCell component="th" scope="row">
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Typography variant="body2">{author.sort || author.name}</Typography>
      </Box>
    </TableCell>
    <TableCell>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <BookIcon sx={{ mr: 1, fontSize: "small", color: "text.secondary" }} />
        <Typography variant="body2">
          {author.bookCount} {getBookCountText(author.bookCount)}
        </Typography>
      </Box>
    </TableCell>
    <TableCell>
      <Typography
        variant="body2"
        color="primary.main"
        sx={{ textDecoration: "underline" }}
      >
        Zobrazit knihy
      </Typography>
    </TableCell>
  </TableRow>
));

AuthorRow.displayName = "AuthorRow";

const Authors: React.FC = () => {
  const { isDarkMode } = useAppStore();
  const pageSize = 48; // Počet autorů načtených najednou

  const { data: authors, isLoading, error } = useAllAuthors();
  const { data: allBooks } = useAllBooks();
  const {
    authorsSearchTerm,
    setAuthorsSearchTerm,
    authorsScrollPosition,
    setAuthorsScrollPosition,
  } = useAppStore();
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<{
    authorId: number;
    seriesName: string;
  } | null>(null);
  const [orderBy, setOrderBy] = useState<keyof Author>("sort");
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  const {
    data: authorBooks,
    isLoading: authorBooksLoading,
    error: authorBooksError,
  } = useAuthorBooks(selectedAuthor?.id || null);

  // Scroll position management
  const { saveScrollPosition } = useScrollPosition({
    scrollPosition: authorsScrollPosition,
    setScrollPosition: setAuthorsScrollPosition,
    enableRestore: !selectedAuthor && !selectedSeries,
  });

  // Authors filter function
  const authorsFilterFn = useCallback((author: Author, searchTerm: string) => {
    return author.name?.toLowerCase().includes(searchTerm) ?? false;
  }, []);

  // Authors sort function
  const authorsSortFn = useCallback(
    (a: Author, b: Author) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];

      // Speciální handling pro různé typy dat
      if (orderBy === "bookCount") {
        const numA = typeof aValue === "number" ? aValue : 0;
        const numB = typeof bValue === "number" ? bValue : 0;
        return order === "asc" ? numA - numB : numB - numA;
      }

      // Pro string hodnoty
      const strA = (aValue?.toString() ?? "").toLowerCase();
      const strB = (bValue?.toString() ?? "").toLowerCase();
      const comparison = strA.localeCompare(strB, "cs", { numeric: true });

      return order === "asc" ? comparison : -comparison;
    },
    [orderBy, order],
  );

  // List search with progressive loading pro hlavní seznam autorů
  const {
    filteredItems: filteredAuthors,
    totalCount,
    progressiveLoading: { isLoadingMore, handleLoadMore },
  } = useListSearch({
    items: authors,
    searchTerm: authorsSearchTerm,
    filterFn: authorsFilterFn,
    sortFn: authorsSortFn,
    progressiveLoading: {
      pageSize,
      enableInfiniteScroll: !selectedAuthor && !selectedSeries,
    },
  });

  // Handler pro výběr autora - optimalizováno s useCallback
  const handleAuthorSelect = useCallback(
    (author: Author) => {
      saveScrollPosition();
      setSelectedAuthor(author);
    },
    [saveScrollPosition],
  );

  // Handler pro návrat k seznamu autorů - optimalizováno s useCallback
  const handleBackToAuthors = useCallback(() => {
    setSelectedAuthor(null);
    setSelectedSeries(null);
  }, []);

  // Handler pro kliknutí na sérii
  const handleSeriesClick = useCallback(
    (authorId: number, seriesName: string) => {
      saveScrollPosition();
      setSelectedSeries({ authorId, seriesName });
    },
    [saveScrollPosition],
  );

  // Handler pro návrat ze série k autorovi
  const handleBackToAuthor = useCallback(() => {
    setSelectedSeries(null);
  }, []);

  // Handler pro změnu třídění
  const handleRequestSort = useCallback(
    (property: keyof Author) => {
      const isAsc = orderBy === property && order === "asc";
      setOrder(isAsc ? "desc" : "asc");
      setOrderBy(property);
    },
    [order, orderBy],
  );

  // Filtrování knih podle série
  const seriesBooks = useMemo(() => {
    if (!selectedSeries || !allBooks) {
      return [];
    }

    return allBooks
      .filter((book) => {
        return (
          book.seriesName === selectedSeries.seriesName &&
          book.authors.some((author) => author.id === selectedSeries.authorId)
        );
      })
      .sort((a, b) => {
        // Řazení podle seriesNumber
        const numA = a.seriesNumber || 0;
        const numB = b.seriesNumber || 0;
        return numA - numB;
      });
  }, [allBooks, selectedSeries]);

  // Seřazení knih autora podle seriesNumber
  const sortedAuthorBooks = useMemo(() => {
    if (!authorBooks) {
      return authorBooks;
    }

    return [...authorBooks].sort((a, b) => {
      // Knihy bez série na konec
      if (!a.seriesName && !b.seriesName) {
        return 0;
      }
      if (!a.seriesName) {
        return 1;
      }
      if (!b.seriesName) {
        return -1;
      }

      // Pokud jsou ze stejné série, řaď podle seriesNumber
      if (a.seriesName === b.seriesName) {
        const numA = a.seriesNumber || 0;
        const numB = b.seriesNumber || 0;
        return numA - numB;
      }

      // Jinak řaď podle názvu série
      return a.seriesName.localeCompare(b.seriesName, "cs");
    });
  }, [authorBooks]);

  if (isLoading) {
    return (
      <Box sx={{ py: 4, px: 4, width: "100%" }}>
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 4, px: 4, width: "100%" }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Chyba při načítání autorů: {error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Container
      maxWidth="xl"
      sx={{
        py: { xs: 2, sm: 3, md: 4 },
        px: { xs: 2, sm: 3, md: 4 },
        maxWidth: { xs: "100%", lg: "1400px" },
      }}
    >
      {!selectedAuthor && !selectedSeries ? (
        // Master view - seznam autorů
        <>
          <Box sx={{ mb: 1 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                mb: 2,
                flexWrap: "wrap",
              }}
            >
              <AuthorsIcon
                sx={{
                  fontSize: "2.5rem",
                  color: isDarkMode ? "#ffffff" : "#1a202c",
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
                }}
              />
              <Typography
                variant="h1"
                component="h1"
                sx={{
                  mb: 0,
                  background: isDarkMode
                    ? "linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)"
                    : "linear-gradient(135deg, #1a202c 0%, #2d3748 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Autoři
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  ml: "auto",
                }}
              >
                <Typography variant="body1" color="text.secondary">
                  {isLoading
                    ? "Načítání..."
                    : `Zobrazeno ${filteredAuthors?.length || 0} z ${totalCount} autorů`}
                </Typography>
                {isLoading && <CircularProgress size={16} />}
              </Box>
            </Box>

            <SearchInput
              value={authorsSearchTerm}
              onChange={setAuthorsSearchTerm}
              placeholder="Vyhledejte autora podle jména..."
              disabled={isLoading}
            />
          </Box>

          {filteredAuthors && filteredAuthors.length > 0 ? (
            <Box>
              <TableContainer component={Paper} sx={{ width: "100%" }}>
                <Table sx={{ width: "100%" }} aria-label="authors table">
                  <TableHead>
                    <TableRow
                      sx={{
                        background: isDarkMode
                          ? "rgba(26, 26, 46, 0.9)"
                          : "rgba(255, 255, 255, 0.95)",
                        backdropFilter: "blur(15px)",
                        borderBottom: isDarkMode
                          ? "1px solid rgba(255,255,255,0.08)"
                          : "1px solid rgba(0,0,0,0.08)",
                        "& .MuiTableCell-head": {
                          backgroundColor: "transparent",
                          borderBottom: "none",
                        },
                      }}
                    >
                      <TableCell>
                        <TableSortLabel
                          active={orderBy === "sort"}
                          direction={orderBy === "sort" ? order : "asc"}
                          onClick={() => handleRequestSort("sort")}
                        >
                          Autor
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={orderBy === "bookCount"}
                          direction={orderBy === "bookCount" ? order : "asc"}
                          onClick={() => handleRequestSort("bookCount")}
                        >
                          Počet knih
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>Akce</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredAuthors.map((author) => (
                      <AuthorRow
                        key={author.id}
                        author={author}
                        onSelect={handleAuthorSelect}
                      />
                    ))}

                    {/* Skeleton loading pro načítání dalších autorů */}
                    {isLoadingMore && (
                      <SkeletonLoader variant="authors" count={5} />
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <LoadMoreButton
                isLoading={isLoadingMore}
                onLoadMore={handleLoadMore}
                remainingCount={totalCount - (filteredAuthors?.length || 0)}
                pageSize={pageSize}
                loadingText="Načítání dalších autorů..."
                loadMoreText={`Načíst dalších ${Math.min(pageSize, totalCount - (filteredAuthors?.length || 0))} autorů`}
              />
            </Box>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="text.secondary">
                {authorsSearchTerm.trim()
                  ? "Žádní autoři odpovídající vašemu vyhledávání nebyli nalezeni."
                  : "Žádní autoři nebyly nalezeni."}
              </Typography>
            </Box>
          )}
        </>
      ) : selectedAuthor && !selectedSeries ? (
        // Detail view - knihy autora
        <DetailView
          title={selectedAuthor.name}
          description={formatBookDescription(
            "autora",
            selectedAuthor.bookCount,
            "knihy od tohoto",
          )}
          onBack={handleBackToAuthors}
          books={sortedAuthorBooks}
          isLoading={authorBooksLoading}
          error={authorBooksError}
          withPadding={true}
          booksListProps={{
            showLanguage: true,
            maxDescriptionLength: 200,
            maxTags: 3,
            onSeriesClick: handleSeriesClick,
            onAuthorClick: (authorId) => {
              const author = authors?.find((a) => a.id === authorId);
              if (author) {
                handleAuthorSelect(author);
              }
            },
          }}
        />
      ) : (
        // Series view - knihy ze série
        <DetailView
          title={selectedSeries?.seriesName || ""}
          description={formatBookDescription("série", seriesBooks.length)}
          onBack={handleBackToAuthor}
          books={seriesBooks}
          isLoading={false}
          error={null}
          withPadding={true}
          booksListProps={{
            showLanguage: true,
            maxDescriptionLength: 200,
            maxTags: 3,
          }}
        />
      )}
    </Container>
  );
};

export default Authors;
