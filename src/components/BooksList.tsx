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
  maxTags = 2,
  showFullComment = false,
  onSeriesClick,
  onAuthorClick,
}) => {
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
    if (!dateString) {return "Neznámé";}
    return new Intl.DateTimeFormat("cs-CZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(dateString));
  };

  const truncateText = (text: string | null | undefined, maxLength: number) => {
    if (!text) {return "";}
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
    <Grid container spacing={3}>
      {books.map((book) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={book.id}>
          <Card sx={{ height: "100%", display: "flex", flexDirection: "row" }}>
            {book.hasCover && (
              <CardMedia
                component="img"
                sx={{
                  width: 140,
                  height: 210,
                  objectFit: "cover",
                  bgcolor: "grey.100",
                  flexShrink: 0,
                  m: 2,
                  borderRadius: 2,
                }}
                image={`/api/book/cover/${book.id}`}
                alt={`Cover obrázek pro ${book.title}`}
              />
            )}
            <Box
              sx={{ display: "flex", flexDirection: "column", width: "100%" }}
            >
              <CardContent sx={{ flexGrow: 1, p: 1.5 }}>
                <Typography variant="h6" component="h3" sx={{ mb: 0.5 }}>
                  {book.title}
                </Typography>
                {book.seriesName && (
                  <Typography
                    variant="subtitle2"
                    color="primary"
                    sx={{
                      mb: 0.5,
                      cursor: onSeriesClick ? "pointer" : "default",
                      textDecoration: onSeriesClick ? "underline" : "none",
                      "&:hover": onSeriesClick
                        ? {
                          backgroundColor: "action.hover",
                        }
                        : {},
                    }}
                    onClick={() =>
                      onSeriesClick &&
                      book.authors.length > 0 &&
                      onSeriesClick(book.authors[0].id, book.seriesName || "")
                    }
                  >
                    {book.seriesName} {book.seriesNumber}
                  </Typography>
                )}

                <Box sx={{ mb: 0.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 0.25 }}>
                    <PersonIcon sx={{ mr: 1, fontSize: "small" }} />
                    <Typography variant="body2">
                      {book.authors.map((author, index) => (
                        <React.Fragment key={author.id}>
                          {index > 0 && ", "}
                          <span
                            style={{
                              cursor: onAuthorClick ? "pointer" : "default",
                              textDecoration: onAuthorClick
                                ? "underline"
                                : "none",
                              color: onAuthorClick ? "primary.main" : "inherit",
                            }}
                            onClick={() =>
                              onAuthorClick &&
                              onAuthorClick(author.id, author.name)
                            }
                            onMouseEnter={(e) =>
                              onAuthorClick &&
                              ((e.target as HTMLElement).style.backgroundColor =
                                "rgba(0, 0, 0, 0.04)")
                            }
                            onMouseLeave={(e) =>
                              onAuthorClick &&
                              ((e.target as HTMLElement).style.backgroundColor =
                                "transparent")
                            }
                          >
                            {author.name}
                          </span>
                        </React.Fragment>
                      ))}
                    </Typography>
                  </Box>

                  {book.publishDate && (
                    <Box
                      sx={{ display: "flex", alignItems: "center", mb: 0.25 }}
                    >
                      <DateIcon sx={{ mr: 1, fontSize: "small" }} />
                      <Typography variant="body2">
                        {formatDate(book.publishDate)}
                      </Typography>
                    </Box>
                  )}

                  {showLanguage && (
                    <Box
                      sx={{ display: "flex", alignItems: "center", mb: 0.25 }}
                    >
                      <LanguageIcon sx={{ mr: 1, fontSize: "small" }} />
                      <Typography
                        variant="body2"
                        sx={{ textTransform: "uppercase" }}
                      >
                        {book.language}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {book.comments && (
                  <Box sx={{ mb: 0.5 }}>
                    {showFullComment || expandedComments.has(book.id) ? (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        paragraph
                        dangerouslySetInnerHTML={{ __html: book.comments }}
                      />
                    ) : (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        paragraph
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
                  <Box sx={{ mb: 1 }}>
                    {book.tags.slice(0, maxTags).map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                    {book.tags.length > maxTags && (
                      <Typography variant="caption" color="text.secondary">
                        +{book.tags.length - maxTags}{" "}
                        {maxTags === 2 ? "" : "dalších"}
                      </Typography>
                    )}
                  </Box>
                )}
              </CardContent>

              <CardActions>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {book.formats.map((format) => (
                    <Button
                      key={format.id}
                      size="small"
                      variant="outlined"
                      href={`/api/book/download/${book.id}/${format.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {format.type}
                    </Button>
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
