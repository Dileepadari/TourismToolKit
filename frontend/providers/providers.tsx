'use client';

import { ApolloProvider } from '@apollo/client/react';
import { ThemeProvider } from './ThemeProvider';
import client from '../graphql/client';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './AuthProvider';
import { LanguageProvider } from './LanguageProvider';
import { PreferenceSync } from './PreferenceSync';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider client={client}>
      <ThemeProvider
        defaultTheme="light"storageKey="tourism-theme">
        <AuthProvider>
          <LanguageProvider>
            {/* Innermost: needs auth, language and theme all available. */}
            <PreferenceSync>
              {children}
              <Toaster position="top-right" />
            </PreferenceSync>
          </LanguageProvider>
        </AuthProvider>
      </ThemeProvider>
    </ApolloProvider>
  );
}