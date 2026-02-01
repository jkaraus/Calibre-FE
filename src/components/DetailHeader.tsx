import React from "react";
import { Box, Typography, Divider, IconButton } from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";

interface DetailHeaderProps {
  /** Titulek (název série, autora, apod.) */
  title: string;
  /** Popisný text (počet knih, apod.) */
  description: string;
  /** Callback pro navácení zpět */
  onBack: () => void;
  /** Přidatěné paddingu (např. pro Authors stránku) */
  withPadding?: boolean;
}

/**
 * Sdílená komponenta pro detail header s back button a title
 * Používá se na všech stránkách pro zobrazíní detail view
 */
export const DetailHeader: React.FC<DetailHeaderProps> = ({
  title,
  description,
  onBack,
  withPadding = false,
}) => {
  return (
    <Box sx={{ mb: 4, ...(withPadding && { px: 2 }) }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <IconButton onClick={onBack} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h1" component="h1">
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ ml: 2 }}>
          {description}
        </Typography>
      </Box>
      <Divider sx={{ mt: 2 }} />
    </Box>
  );
};
