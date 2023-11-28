import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import { StyledEngineProvider, ThemeProvider, CssBaseline, Box, CircularProgress } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { ConfirmProvider } from "material-ui-confirm";

import App from "./app/App";
import reportWebVitals from "./reportWebVitals";
import store, { persistor } from "store/store";

import "./index.css";

const rootElement = document.getElementById("root") as HTMLElement;
const root = ReactDOM.createRoot(rootElement);

export const theme = createTheme({
  typography: {
    fontFamily: "'Montserrat', sans-serif",
  },
  palette: {
    primary: {
      main: '#A3A0FB',
    },
  },
  components: {
    MuiPopover: {
      defaultProps: {
        container: rootElement,
      },
    },
    MuiPopper: {
      defaultProps: {
        container: rootElement,
      },
    },
    MuiDialog: {
      defaultProps: {
        container: rootElement,
      },
    },
    MuiModal: {
      defaultProps: {
        container: rootElement,
      },
    },
  },
});

const Loading = () => (
  <Box className="w-screen h-screen flex items-center justify-center bg-slate-app">
    <CircularProgress color="secondary" size={100} />
  </Box>
);

root.render(
  <BrowserRouter basename={process.env.PUBLIC_URL}>
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ConfirmProvider>
          <Provider store={store}>
            <PersistGate loading={<Loading />} persistor={persistor}>
              <App />
            </PersistGate>
          </Provider>
        </ConfirmProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
