import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createRouter,
  RouterProvider,
  createRootRoute,
  createRoute,
  Outlet,
} from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

import { queryClient } from "./services/queryClient";
import { useTheme } from "./styles/theme";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Books from "./pages/Books";
import Authors from "./pages/Authors";

// Define the root route
const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

// Define index route
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
});

// Define books route
const booksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/books",
  component: Books,
});

// Define authors route
const authorsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/authors",
  component: Authors,
});

// Create the route tree
const routeTree = rootRoute.addChildren([indexRoute, booksRoute, authorsRoute]);

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export function App() {
  const theme = useTheme();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
