import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import setupLocatorUI from '@locator/runtime';
import App from './App.jsx';
import './index.css';
import './i18n';
import { AuthProvider } from './context/auth-context.jsx';
import { MediaProvider } from './context/media-context.jsx';
import { PlexProvider } from './context/plex-context.jsx';

if (import.meta.env.DEV) {
  setupLocatorUI();
}

createRoot(document.getElementById('root')).render(
  <BrowserRouter
    future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
  >
    <AuthProvider>
      <MediaProvider>
        <PlexProvider>
          <App />
        </PlexProvider>
      </MediaProvider>
    </AuthProvider>
  </BrowserRouter>,
);
