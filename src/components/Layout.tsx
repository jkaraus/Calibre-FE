import React from "react";
import { AppBar, Toolbar, IconButton, Box, Button, Stack } from "@mui/material";
import {
  Home as HomeIcon,
  Info as InfoIcon,
  MenuBook as BooksIcon,
  Person as PersonIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
} from "@mui/icons-material";
import { Link, useLocation } from "@tanstack/react-router";
import { useAppStore } from "../store/appStore";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isDarkMode, toggleTheme } = useAppStore();
  const location = useLocation();

  const menuItems = [
    { text: "Domů", icon: <HomeIcon />, path: "/" },
    { text: "Knihy", icon: <BooksIcon />, path: "/books" },
    { text: "Autoři", icon: <PersonIcon />, path: "/authors" },
    { text: "O aplikaci", icon: <InfoIcon />, path: "/about" },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="fixed">
        <Toolbar>
          <Stack direction="row" spacing={1} sx={{ flexGrow: 1 }}>
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
                      ? "rgba(255,255,255,0.1)"
                      : "transparent",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.08)",
                    color: "white",
                  },
                }}
              >
                {item.text}
              </Button>
            ))}
          </Stack>

          <IconButton color="inherit" onClick={toggleTheme}>
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
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
