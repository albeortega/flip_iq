import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#123f36",
      dark: "#0b2b25",
      contrastText: "#ffffff"
    },
    secondary: {
      main: "#f27a2d",
      dark: "#c95f1e",
      contrastText: "#1b120b"
    },
    background: {
      default: "#f6efe2",
      paper: "#ffffff"
    },
    text: {
      primary: "#12201c",
      secondary: "#64736d"
    }
  },
  shape: {
    borderRadius: 8
  },
  typography: {
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: {
      fontSize: "4.8rem",
      fontWeight: 850,
      letterSpacing: 0,
      lineHeight: 0.96
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
