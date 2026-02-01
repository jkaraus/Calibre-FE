import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Button,
  Stack,
  Fab,
} from "@mui/material";
import {
  Home as HomeIcon,
  MenuBook as BooksIcon,
  Person as PersonIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  KeyboardArrowUp as ArrowUpIcon,
} from "@mui/icons-material";
import { Link, useLocation } from "@tanstack/react-router";
import { useAppStore } from "../store/appStore";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isDarkMode, toggleTheme } = useAppStore();
  const location = useLocation();
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Detekce scroll pozice
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Funkce pro návrat na vrch
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const menuItems = [
    { text: "Domů", icon: <HomeIcon />, path: "/" },
    { text: "Knihy", icon: <BooksIcon />, path: "/books" },
    { text: "Autoři", icon: <PersonIcon />, path: "/authors" },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: isDarkMode
          ? "radial-gradient(ellipse at top, #1a1a2e 0%, #16213e 25%, #0f1419 100%)"
          : "linear-gradient(135deg, #f8f9ff 0%, #e8f4f8 50%, #f0f8ff 100%)",
        backgroundAttachment: "fixed",
      }}
    >
      <AppBar
        position="fixed"
        sx={{
          background: isDarkMode
            ? "rgba(26, 26, 46, 0.9)"
            : "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(15px)",
          borderBottom: isDarkMode
            ? "1px solid rgba(255,255,255,0.08)"
            : "1px solid rgba(0,0,0,0.08)",
          boxShadow: isDarkMode
            ? "0 2px 12px rgba(0,0,0,0.3)"
            : "0 2px 12px rgba(0,0,0,0.08)",
        }}
      >
        <Toolbar
          sx={{
            px: { xs: 2, sm: 3, md: 4 },
            maxWidth: { xs: "100%", lg: "1400px" },
            mx: "auto",
            width: "100%",
          }}
        >
          <Stack direction="row" spacing={0.5} sx={{ flexGrow: 1 }}>
            {menuItems.map((item) => (
              <Button
                key={item.path}
                color="inherit"
                component={Link}
                to={item.path}
                startIcon={item.icon}
                sx={{
                  backgroundColor:
                    location.pathname === item.path
                      ? isDarkMode
                        ? "rgba(255,255,255,0.12)"
                        : "rgba(0,0,0,0.08)"
                      : "transparent",
                  borderRadius: 3,
                  px: 3,
                  py: 1.5,
                  color: isDarkMode ? "rgba(255,255,255,0.95)" : "#1a202c",
                  fontWeight: location.pathname === item.path ? 500 : 400,
                  textTransform: "none",
                  fontSize: "0.95rem",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    backgroundColor: isDarkMode
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(0,0,0,0.05)",
                    transform: "translateY(-1px)",
                    boxShadow: isDarkMode
                      ? "0 2px 8px rgba(0,0,0,0.15)"
                      : "0 4px 12px rgba(0,0,0,0.1)",
                  },
                  "& .MuiButton-startIcon": {
                    marginRight: "8px",
                    transition: "transform 0.2s ease-in-out",
                  },
                  "&:hover .MuiButton-startIcon": {
                    transform: "scale(1.1) rotate(5deg)",
                  },
                }}
              >
                {item.text}
              </Button>
            ))}
          </Stack>

          <IconButton
            color="inherit"
            onClick={toggleTheme}
            sx={{
              ml: 3,
              p: 1.5,
              borderRadius: 2,
              backgroundColor: isDarkMode
                ? "rgba(255,255,255,0.06)"
                : "rgba(0,0,0,0.05)",
              backdropFilter: "blur(10px)",
              border: isDarkMode
                ? "1px solid rgba(255,255,255,0.12)"
                : "1px solid rgba(0,0,0,0.1)",
              color: isDarkMode ? "rgba(255,255,255,0.9)" : "#1a202c",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                backgroundColor: isDarkMode
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.08)",
                transform: "scale(1.05) rotate(180deg)",
                boxShadow: isDarkMode
                  ? "0 2px 8px rgba(0,0,0,0.15)"
                  : "0 4px 12px rgba(0,0,0,0.1)",
              },
              "& svg": {
                fontSize: "1.4rem",
              },
            }}
          >
            {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: 8, // AppBar height
          width: "100%",
          maxWidth: "none",
          position: "relative",
          minHeight: "calc(100vh - 64px)",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: isDarkMode
              ? `radial-gradient(circle at 25% 25%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
                 radial-gradient(circle at 75% 75%, rgba(255, 119, 198, 0.1) 0%, transparent 50%),
                 radial-gradient(circle at 50% 50%, rgba(79, 172, 254, 0.05) 0%, transparent 50%)`
              : `radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
                 radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%),
                 radial-gradient(circle at 40% 40%, rgba(79, 172, 254, 0.08) 0%, transparent 50%)`,
            backgroundSize: "100% 100%, 100% 100%, 100% 100%",
            pointerEvents: "none",
            zIndex: 0,
          },
          "& > *": {
            position: "relative",
            zIndex: 1,
          },
        }}
      >
        {children}
      </Box>

      {/* Scroll to top button */}
      <Fab
        onClick={scrollToTop}
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 1000,
          opacity: showScrollTop ? 1 : 0,
          transform: showScrollTop ? "translateY(0)" : "translateY(100px)",
          transition: "all 0.3s ease-in-out",
          background: isDarkMode
            ? "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)"
            : "linear-gradient(135deg, #5a67d8 0%, #667eea 100%)",
          color: "#ffffff",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
          "&:hover": {
            transform: showScrollTop ? "translateY(-4px)" : "translateY(100px)",
            boxShadow: "0 8px 25px rgba(0, 0, 0, 0.3)",
          },
          "& svg": {
            fontSize: "1.5rem",
            fontWeight: "bold",
          },
        }}
        size="medium"
      >
        <ArrowUpIcon />
      </Fab>
    </Box>
  );
};

export default Layout;
