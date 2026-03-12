import React from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";
import UFC from "./components/UFC";
import "./scss/App.scss";

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="app-root">
        <UFC />
      </div>
    </ThemeProvider>
  );
}
