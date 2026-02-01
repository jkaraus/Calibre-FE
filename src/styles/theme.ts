import { createTheme } from "@mui/material/styles";
import { useAppStore } from "../store/appStore";

export const useTheme = () => {
  const isDarkMode = useAppStore((state) => state.isDarkMode);

  return createTheme({
    palette: {
      mode: isDarkMode ? "dark" : "light",
      primary: {
        main: "#1976d2",
      },
      secondary: {
        main: "#dc004e",
      },
      background: {
        default: isDarkMode ? "#121212" : "#f5f5f5",
        paper: isDarkMode ? "#1e1e1e" : "#ffffff",
      },
    },
    typography: {
      fontFamily: [
        "Inter",
        "-apple-system",
        "BlinkMacSystemFont",
        "Segoe UI",
        "Roboto",
        "Helvetica Neue",
        "Arial",
        "sans-serif",
      ].join(","),
      h1: {
        fontSize: "2.125rem",
        fontWeight: 500,
      },
      h2: {
        fontSize: "1.5rem",
        fontWeight: 500,
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
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: isDarkMode
              ? "0 2px 8px rgba(0,0,0,0.3)"
              : "0 2px 8px rgba(0,0,0,0.1)",
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
