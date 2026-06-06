import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#31564d",
      dark: "#17362f",
      contrastText: "#ffffff"
    },
    secondary: {
      main: "#c7a567",
      dark: "#a88445",
      contrastText: "#20332f"
    },
    background: {
      default: "#fbf7ef",
      paper: "#fffdf8"
    },
    text: {
      primary: "#20332f",
      secondary: "#6d746d"
    }
  },
  shape: {
    borderRadius: 8
  },
  typography: {
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: {
      fontSize: "3rem",
      fontWeight: 850,
      letterSpacing: 0,
      lineHeight: 1
    },
    h2: {
      fontSize: "1.5rem",
      fontWeight: 800,
      letterSpacing: 0
    },
    button: {
      fontWeight: 700,
      textTransform: "none"
    }
  }
});
