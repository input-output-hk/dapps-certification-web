import { PaletteColorOptions, createTheme } from "@mui/material/styles";
import { CSSProperties } from "@mui/material/styles/createMixins";

interface ICustomPaletteColors {
  blue?: PaletteColorOptions; // Extend the PaletteOptions interface
  purple?: PaletteColorOptions;
  green?: PaletteColorOptions;
  white?: PaletteColorOptions;
  gray?: PaletteColorOptions;
  black?: PaletteColorOptions;
}

interface ICustomMixins {
  boxShadowPurple?: CSSProperties;
}

declare module "@mui/material/styles" {
  interface PaletteOptions extends ICustomPaletteColors {}
  interface Mixins extends ICustomMixins {}
}

export const theme = createTheme({
  palette: {
    blue: {
      main: "#3b86ff",
      light: "#cbe0ff",
      dark: "#6591d4",
      contrastText: "#fff",
    },
    purple: {
      main: "#8380BD",
      dark: "#3B3B54",
    },
    green: {
      main: "#6cb33c",
    },
    gray: {
      main: "#43435c",
      light: "#c8c8c8",
      dark: "#8585a1",
    },
    white: {
      main: "#f1f0f7",
    },
    black: {
      main: "#363446",
      dark: "#2c2a3b",
      contrastText: "#fff",
    },
  },
});
