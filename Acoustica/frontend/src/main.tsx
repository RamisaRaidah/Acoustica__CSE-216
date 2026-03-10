import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '/src/styles/global.css';

const root=document.getElementById('root');
if(!root) throw new Error('Root not found');

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);