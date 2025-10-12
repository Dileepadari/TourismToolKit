'use client';

import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// HTTP Link
const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:8000/graphql',
});

// Auth Link - Add JWT token to headers
const authLink = setContext((_, { headers }) => {
  // Get the authentication token from local storage if it exists
  let token = null;
  
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('authToken');
  }

  // Return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

// Apollo Client instance
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // Cache policies for specific queries if needed
          getPlaces: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
          getUserDictionary: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});

export default client;