import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#4caf50",
    },
    background: {
      default: "#0a0a0a",
      paper: "#0f1a0f",
    },
    text: {
      primary: "#4caf50",
      secondary: "#1a8a1a",
    },
    divider: "#1a3a1a",
  },
  typography: {
    fontFamily: "'Consolas', 'Courier New', monospace",
    fontSize: 13,
    allVariants: {
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    },
  },
});

export default theme;
