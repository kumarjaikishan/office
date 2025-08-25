// theme.js (just a helper)
import { createTheme } from "@mui/material/styles";

export const getTheme = (primaryColor = "#115e59") =>
  createTheme({
    palette: {
      primary: {
        main: primaryColor,
      },
    },
  });
