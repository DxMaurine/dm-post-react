import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import 'animate.css';
import { HashRouter } from 'react-router-dom'; // ganti BrowserRouter dengan HashRouter
import { SettingsProvider } from './context/SettingsContext';
import { ThemeProvider } from './context/theme-provider'; // pastikan path benar

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
      <HashRouter>
        <SettingsProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </SettingsProvider>
      </HashRouter>
  </React.StrictMode>,
);