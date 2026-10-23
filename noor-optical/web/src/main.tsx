import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { AuthProvider } from './lib/auth';
import { CartProvider } from './lib/cart';
import { FavoritesProvider } from './lib/favorites';
import { I18nProvider } from './lib/i18n';
import { SettingsProvider } from './lib/settings';
import './styles/index.css';

const container = document.getElementById('root');
if (!container) throw new Error('Root container is missing');

createRoot(container).render(
  <StrictMode>
    <BrowserRouter>
      <I18nProvider>
        <SettingsProvider>
          <AuthProvider>
            <CartProvider>
              <FavoritesProvider>
                <App />
              </FavoritesProvider>
            </CartProvider>
          </AuthProvider>
        </SettingsProvider>
      </I18nProvider>
    </BrowserRouter>
  </StrictMode>,
);
