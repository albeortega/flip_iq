import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#176d64"
    },
    secondary: {
      main: "#b45309"
    },
    background: {
      default: "#f7f8f5",
      paper: "#ffffff"
    },
    text: {
      primary: "#17211f",
      secondary: "#5d6b66"
    }
  },
  shape: {
    borderRadius: 8
  },
  typography: {
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: {
      fontSize: "2.6rem",
      fontWeight: 800,
      letterSpacing: 0,
      lineHeight: 1.05
    },
    h2: {
      fontSize: "1.25rem",
      fontWeight: 750,
      letterSpacing: 0
    },
    button: {
      fontWeight: 700,
      textTransform: "none"
    }
  }
});
