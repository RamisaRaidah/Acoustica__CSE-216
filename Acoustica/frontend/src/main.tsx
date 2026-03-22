import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ScrollProvider } from '@/contexts/ScrollContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import '@/styles/global.css';
import '@/styles/variable.css';

const root = document.getElementById('root');
if (!root) throw new Error('Root not found');

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <ScrollProvider>
          <App />
        </ScrollProvider>
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>
);