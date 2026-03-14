import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { MusicProvider } from '@/contexts/MusicContext';
import { ScrollProvider } from '@/contexts/ScrollContext';
import '@/styles/global.css';
import '@/styles/variable.css';

const root = document.getElementById('root');
if (!root) throw new Error('Root not found');

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <MusicProvider>
          <ScrollProvider>
            <App />
          </ScrollProvider>
        </MusicProvider>
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>
);