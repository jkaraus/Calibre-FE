import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Grid,
  Chip,
  Button,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Person as PersonIcon,
  DateRange as DateIcon,
  Language as LanguageIcon,
} from "@mui/icons-material";
import { useAppStore } from "../store/appStore";
import type { Book } from "../types/book";

interface BooksListProps {
  books?: Book[];
  isLoading: boolean;
  error?: Error | null;
  showLanguage?: boolean;
  maxDescriptionLength?: number;
  maxTags?: number;
  showFullComment?: boolean;
  onSeriesClick?: (authorId: number, seriesName: string) => void;
  onAuthorClick?: (authorId: number, authorName: string) => void;
}

const BooksList: React.FC<BooksListProps> = ({
  books,
  isLoading,
  error,
  showLanguage = false,
  maxDescriptionLength = 150,
  maxTags: _maxTags = 2,
  showFullComment = false,
  onSeriesClick,
  onAuthorClick,
}) => {
  const { isDarkMode } = useAppStore();
  const [expandedComments, setExpandedComments] = useState<Set<number>>(
    new Set(),
  );

  const toggleComment = (bookId: number) => {
    setExpandedComments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(bookId)) {
        newSet.delete(bookId);
      } else {
        newSet.add(bookId);
      }
      return newSet;
    });
  };
  const formatDate = (dateString: string | null) => {
    if (!dateString) {
      return "Neznámé";
    }
    return new Intl.DateTimeFormat("cs-CZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(dateString));
  };

  const truncateText = (text: string | null | undefined, maxLength: number) => {
    if (!text) {
      return "";
    }
    const plainText = text.replace(/<[^>]*>/g, "");
    return plainText.length <= maxLength
      ? plainText
      : `${plainText.slice(0, maxLength)}...`;
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        Chyba při načítání knih: {error.message}
      </Alert>
    );
  }

  if (!books || books.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="body1" color="text.secondary">
          Žádné knihy nebyly nalezeny.
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      {books.map((book) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={book.id}>
          <Card
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "row",
              boxShadow: isDarkMode
                ? "0 8px 24px rgba(255, 255, 255, 0.08)"
                : "0 8px 24px rgba(0, 0, 0, 0.08)",
              border: isDarkMode
                ? "2px solid rgba(255, 255, 255, 0.15)"
                : "2px solid rgba(0, 0, 0, 0.12)",
              borderRadius: 2,
              p: 1.5,
            }}
          >
            {book.hasCover && (
              <CardMedia
                component="img"
                sx={{
                  width: 135,
                  height: 202,
                  objectFit: "cover",
                  bgcolor: "grey.100",
                  flexShrink: 0,
                  m: 1,
                  borderRadius: 1,
                }}
                image={`/api/book/cover/${book.id}`}
                alt={`Cover obrázek pro ${book.title}`}
              />
            )}
            <Box
              sx={{ display: "flex", flexDirection: "column", width: "100%" }}
            >
              <CardContent sx={{ flexGrow: 1, p: 0.75 }}>
                <Typography
                  variant="h6"
                  component="h3"
                  sx={{
                    mb: 0.25,
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    lineHeight: 1.3,
                    color: "text.primary",
                  }}
                >
                  {book.title}
                </Typography>
                {book.seriesName && (
                  <Typography
                    variant="subtitle2"
                    component="span"
                    onClick={() =>
                      onSeriesClick &&
                      book.authors.length > 0 &&
                      onSeriesClick(book.authors[0].id, book.seriesName || "")
                    }
                    sx={{
                      mb: 0.25,
                      mr: 0.5,
                      cursor: onSeriesClick ? "pointer" : "default",
                      color: isDarkMode ? "#ffffff" : "#000000",
                      textDecoration: "underline",
                      textUnderlineOffset: "3px",
                      fontWeight: 600,
                      "&:hover": {
                        opacity: 0.8,
                      },
                      transition: "opacity 0.2s ease-in-out",
                    }}
                  >
                    {book.seriesName} {book.seriesNumber}
                  </Typography>
                )}

                <Box sx={{ mb: 0.25 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 0.25,
                      flexWrap: "wrap",
                      gap: 0.5,
                    }}
                  >
                    <PersonIcon
                      sx={{
                        mr: 0.5,
                        fontSize: "small",
                        color: "text.secondary",
                      }}
                    />
                    {book.authors.map((author, index) => (
                      <React.Fragment key={author.id}>
                        {index > 0 && (
                          <span style={{ margin: "0 4px" }}>, </span>
                        )}
                        <Typography
                          variant="body2"
                          component="span"
                          onClick={() =>
                            onAuthorClick &&
                            onAuthorClick(author.id, author.name)
                          }
                          sx={{
                            cursor: onAuthorClick ? "pointer" : "default",
                            color: isDarkMode ? "#ffffff" : "#000000",
                            textDecoration: "underline",
                            textUnderlineOffset: "2px",
                            fontWeight: 600,
                            "&:hover": {
                              opacity: 0.8,
                            },
                            transition: "opacity 0.2s ease-in-out",
                          }}
                        >
                          {author.name}
                        </Typography>
                      </React.Fragment>
                    ))}
                  </Box>

                  {book.publishDate && (
                    <Box
                      sx={{ display: "flex", alignItems: "center", mb: 0.5 }}
                    >
                      <DateIcon
                        sx={{
                          mr: 0.5,
                          fontSize: "small",
                          color: "text.secondary",
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                        }}
                      >
                        {formatDate(book.publishDate)}
                      </Typography>
                    </Box>
                  )}

                  {showLanguage && (
                    <Box
                      sx={{ display: "flex", alignItems: "center", mb: 0.5 }}
                    >
                      <LanguageIcon
                        sx={{
                          mr: 0.5,
                          fontSize: "small",
                          color: "text.secondary",
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                        }}
                      >
                        {book.language?.toUpperCase()}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {book.comments && (
                  <Box sx={{ mb: 0.25 }}>
                    {showFullComment || expandedComments.has(book.id) ? (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 0.5 }}
                        dangerouslySetInnerHTML={{ __html: book.comments }}
                      />
                    ) : (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 0.5 }}
                      >
                        {truncateText(book.comments, maxDescriptionLength)}
                      </Typography>
                    )}
                    {!showFullComment &&
                      book.comments &&
                      book.comments.replace(/<[^>]*>/g, "").length >
                        maxDescriptionLength && (
                        <Button
                          size="small"
                          onClick={() => toggleComment(book.id)}
                          sx={{ p: 0, minWidth: "auto", textTransform: "none" }}
                        >
                          {expandedComments.has(book.id)
                            ? "Zobrazit méně"
                            : "Zobrazit více"}
                        </Button>
                      )}
                  </Box>
                )}

                {book.tags.length > 0 && (
                  <Box sx={{ mb: 0.5 }}>
                    {book.tags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        size="small"
                        variant={tag === "READ" ? "filled" : "outlined"}
                        sx={{
                          mr: 0.5,
                          mb: 0.5,
                          ...(tag === "READ"
                            ? {
                                backgroundColor: "success.main",
                                color: "success.contrastText",
                              }
                            : {
                                borderColor: "text.primary",
                                color: "text.primary",
                              }),
                        }}
                      />
                    ))}
                  </Box>
                )}
              </CardContent>

              <CardActions sx={{ pt: 0, justifyContent: "flex-end" }}>
                <Box
                  sx={{
                    display: "flex",
                    gap: 1.5,
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  {book.formats.map((format, index) => (
                    <React.Fragment key={format.id}>
                      {index > 0 && <span style={{ color: "#666" }}>•</span>}
                      <Typography
                        component="a"
                        href={`/api/book/download/${book.id}/${format.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          textDecoration: "underline",
                          color: "primary.main",
                          fontSize: "0.875rem",
                          fontWeight: 500,
                          "&:hover": {
                            opacity: 0.8,
                          },
                          transition: "opacity 0.2s ease-in-out",
                        }}
                      >
                        {format.type}
                      </Typography>
                    </React.Fragment>
                  ))}
                </Box>
              </CardActions>
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default React.memo(BooksList);
