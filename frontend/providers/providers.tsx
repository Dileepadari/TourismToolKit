'use client';

import { ApolloProvider } from '@apollo/client';
import { ThemeProvider } from './ThemeProvider';
import client from '../graphql/client';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './AuthProvider';
import { LanguageProvider } from './LanguageProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider client={client}>
      <ThemeProvider
        defaultTheme="light"
        storageKey="tourism-theme"
      >
        <AuthProvider>
          <LanguageProvider>
            {children}
            <Toaster 
              position="top-right"
            />
          </LanguageProvider>
        </AuthProvider>
      </ThemeProvider>
    </ApolloProvider>
  );
}