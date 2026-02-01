import React from "react";
import { Box, Skeleton, TableRow, TableCell } from "@mui/material";

interface SkeletonLoaderProps {
  /** Typ skeleton loading */
  variant: "books" | "authors" | "cards";
  /** Počet skeleton položek */
  count?: number;
}

/**
 * Univerzální komponenta pro skeleton loading různých typů obsahu
 * Poskytuje konzistentní loading state napříč aplikací
 */
export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant,
  count = 6,
}) => {
  // Books skeleton - pro seznam knih
  if (variant === "books") {
    return (
      <Box sx={{ mt: 3 }}>
        {Array.from({ length: count }).map((_, index) => (
          <Box
            key={index}
            sx={{ mb: 2, p: 2, border: "1px solid #eee", borderRadius: "8px" }}
          >
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="text" width="40%" height={16} sx={{ mt: 1 }} />
            <Skeleton
              variant="rectangular"
              width="100%"
              height={60}
              sx={{ mt: 1 }}
            />
          </Box>
        ))}
      </Box>
    );
  }

  // Authors skeleton - pro tabulku autorů
  if (variant === "authors") {
    return (
      <>
        {Array.from({ length: count }).map((_, index) => (
          <TableRow key={`skeleton-${index}`}>
            <TableCell component="th" scope="row">
              <Skeleton variant="text" width="40%" />
            </TableCell>
            <TableCell>
              <Skeleton variant="text" width="30%" />
            </TableCell>
            <TableCell>
              <Skeleton variant="text" width="60%" />
            </TableCell>
          </TableRow>
        ))}
      </>
    );
  }

  // Cards skeleton - pro grid layout
  if (variant === "cards") {
    return (
      <Box sx={{ mt: 3, display: "grid", gap: 2 }}>
        {Array.from({ length: count }).map((_, index) => (
          <Box
            key={index}
            sx={{ p: 2, border: "1px solid #eee", borderRadius: "8px" }}
          >
            <Skeleton variant="rectangular" width="100%" height={120} />
            <Skeleton variant="text" width="80%" height={20} sx={{ mt: 1 }} />
            <Skeleton variant="text" width="60%" height={16} sx={{ mt: 0.5 }} />
          </Box>
        ))}
      </Box>
    );
  }

  return null;
};
