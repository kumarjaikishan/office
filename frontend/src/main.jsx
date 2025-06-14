import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import './index.css'
import App from './App.jsx'
import store from '../store/store.js'
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistStore } from 'redux-persist';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme.js';

let persistor = persistStore(store);
createRoot(document.getElementById('root')).render(
   <Provider store={store}>
      <BrowserRouter >
        <PersistGate persistor={persistor} >
          <ThemeProvider theme={theme}>
            <App />
          </ThemeProvider>
        </PersistGate>
      </BrowserRouter>
  </Provider>
)
