import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import store from "../store/store.js";
import { Provider, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";
import { ThemeProvider } from "@mui/material/styles";
import { getTheme } from "./theme.js";
import { AnimatePresence, LayoutGroup } from "framer-motion";

let persistor = persistStore(store);

// ✅ ThemeWrapper handles theme + useSelector
const ThemeWrapper = ({ children }) => {
  const primaryColor = useSelector((state) => state.user.primaryColor) || "#115e59";
  const theme = getTheme(primaryColor);

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <BrowserRouter>
      <PersistGate persistor={persistor}>
        <LayoutGroup>
          <AnimatePresence mode="wait">
            <ThemeWrapper>
              <App />
            </ThemeWrapper>
          </AnimatePresence>
        </LayoutGroup>
      </PersistGate>
    </BrowserRouter>
  </Provider>
);
