import { createTheme } from "@mui/material/styles";
import { useAppStore } from "../store/appStore";

export const useTheme = () => {
  const isDarkMode = useAppStore((state) => state.isDarkMode);

  return createTheme({
    palette: {
      mode: isDarkMode ? "dark" : "light",
      primary: {
        main: "#1976d2",
        light: "#42a5f5",
        dark: "#1565c0",
      },
      secondary: {
        main: "#dc004e",
        light: "#ff5983",
        dark: "#9a002e",
      },
      info: {
        main: "#0288d1",
        light: "#03a9f4",
      },
      background: {
        default: isDarkMode
          ? "radial-gradient(ellipse at center, #1a1a2e 0%, #16213e 35%, #0f1419 100%)"
          : "radial-gradient(ellipse at center, #ffffff 0%, #f0f4ff 20%, #dce3f5 25%, #c8d1eb 40%, #b4c2e0 55%, #a0b3d5 70%, #8ca4ca 90%)",
        paper: isDarkMode ? "rgba(26, 26, 46, 0.9)" : "#ffffff",
      },
    },
    typography: {
      fontFamily: [
        "system-ui",
        "-apple-system",
        "BlinkMacSystemFont",
        "Segoe UI",
        "Roboto",
        "Ubuntu",
        "Helvetica Neue",
        "Arial",
        "sans-serif",
      ].join(","),
      h1: {
        fontSize: "clamp(1.25rem, 3vw, 1.75rem)",
        fontWeight: 700,
        lineHeight: 1.2,
        letterSpacing: "-0.02em",
        color: isDarkMode ? "#ffffff" : "#1a202c",
        textShadow: isDarkMode
          ? "0 2px 4px rgba(0,0,0,0.3)"
          : "0 1px 2px rgba(0,0,0,0.1)",
      },
      h2: {
        fontSize: "clamp(1.25rem, 3vw, 1.875rem)",
        fontWeight: 600,
        lineHeight: 1.3,
        letterSpacing: "-0.01em",
        color: isDarkMode ? "#e2e8f0" : "#2d3748",
        textShadow: isDarkMode
          ? "0 1px 2px rgba(0,0,0,0.2)"
          : "0 1px 1px rgba(0,0,0,0.05)",
      },
      h3: {
        fontSize: "clamp(1.125rem, 2.5vw, 1.5rem)",
        fontWeight: 600,
        lineHeight: 1.4,
        letterSpacing: "-0.005em",
        color: isDarkMode ? "#cbd5e0" : "#4a5568",
      },
      body1: {
        fontSize: "1rem",
        lineHeight: 1.6,
        color: isDarkMode ? "#a0aec0" : "#718096",
      },
      body2: {
        fontSize: "0.875rem",
        lineHeight: 1.5,
        color: isDarkMode ? "#9ca3af" : "#6b7280",
      },
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: "none",
            borderBottom: "1px solid",
            borderBottomColor: isDarkMode ? "#424242" : "#e0e0e0",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            borderRadius: 8,
            fontWeight: 500,
            transition: "all 0.2s ease-in-out",
          },
          containedPrimary: {
            boxShadow: isDarkMode
              ? "0 2px 8px rgba(25, 118, 210, 0.4)"
              : "0 2px 8px rgba(25, 118, 210, 0.3)",
            "&:hover": {
              boxShadow: isDarkMode
                ? "0 4px 12px rgba(25, 118, 210, 0.5)"
                : "0 4px 12px rgba(25, 118, 210, 0.4)",
              transform: "translateY(-1px)",
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: isDarkMode
              ? "0 1px 4px rgba(0,0,0,0.4)"
              : "0 1px 4px rgba(0,0,0,0.08)",
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            transition: "all 0.2s ease-in-out",
          },
        },
      },
      MuiTable: {
        styleOverrides: {
          root: {
            width: "100%",
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            backgroundColor: isDarkMode ? "#2a2a2a" : "#f5f5f5",
            "& .MuiTableCell-head": {
              fontWeight: "bold",
              padding: "5px 16px",
              backgroundColor: "inherit",
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            padding: "5px 16px",
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            "&.MuiTableRow-root:not(.MuiTableRow-head):hover": {
              backgroundColor: isDarkMode
                ? "rgba(255, 255, 255, 0.08)"
                : "rgba(0, 0, 0, 0.04)",
              cursor: "pointer",
            },
          },
        },
      },
    },
  });
};
