import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#080814",
      dark: "#03030b",
      contrastText: "#ffffff"
    },
    secondary: {
      main: "#d6cbc0",
      dark: "#b9a99a",
      contrastText: "#080814"
    },
    background: {
      default: "#fbfaf8",
      paper: "#ffffff"
    },
    text: {
      primary: "#2c2b2d",
      secondary: "#726d69"
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
