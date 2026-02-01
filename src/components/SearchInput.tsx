import React from "react";
import { TextField, InputAdornment } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";

interface SearchInputProps {
  /** Aktuální hodnota vyhledávání */
  value: string;
  /** Callback pro změnu hodnoty */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Zda je input v loading stavu */
  disabled?: boolean;
  /** Velikost inputu */
  size?: "small" | "medium";
}

/**
 * Konzistentní komponenta pro vyhledávání napříč aplikací
 * Používá standardní Material-UI TextField se search ikonou
 */
export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = "Vyhledávání...",
  disabled = false,
  size = "small",
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <TextField
      size={size}
      fullWidth
      variant="outlined"
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      disabled={disabled}
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: 50,
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(10px)",
          transition: "all 0.3s ease-in-out",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.08)",
            transform: "translateY(-1px)",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "primary.main",
              borderWidth: 2,
            },
          },
          "&.Mui-focused": {
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            transform: "translateY(-2px)",
            boxShadow: "0 6px 25px rgba(25, 118, 210, 0.15)",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "primary.main",
              borderWidth: 2,
            },
          },
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "transparent",
          },
        },
        "& .MuiInputBase-input": {
          padding: "12px 16px",
          fontSize: "0.95rem",
          "&::placeholder": {
            opacity: 0.7,
          },
        },
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon
              sx={{
                color: "primary.secondary",
                fontSize: "1.2rem",
                transition: "all 0.2s ease-in-out",
              }}
            />
          </InputAdornment>
        ),
      }}
    />
  );
};
