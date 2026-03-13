import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { MusicProvider } from '@/contexts/MusicContext';
import '@/styles/global.css';
import '@/styles/variable.css';

const root = document.getElementById('root');
if (!root) throw new Error('Root not found');

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <MusicProvider>
          <App />
        </MusicProvider>
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>
);