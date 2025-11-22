// Ensures Apollo Client always targets the correct GraphQL endpoint.
'use client';

import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// Resolve and normalize GraphQL endpoint.
// Accepts env var with or without trailing /graphql and guarantees final URI ends with /graphql.
function resolveGraphQLEndpoint() {
  const raw = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:8000/graphql';
  // Trim whitespace
  let cleaned = raw.trim();
  if (!cleaned) cleaned = 'http://localhost:8000/graphql';
  // Remove trailing slashes for consistent handling
  cleaned = cleaned.replace(/\/+$/,'');
  // Append /graphql if not present (case-sensitive match sufficient)
  if (!/\/graphql$/.test(cleaned)) {
    cleaned = cleaned + '/graphql';
  }
  return cleaned;
}

const httpLink = createHttpLink({
  uri: resolveGraphQLEndpoint(),
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

// Debug log (will be stripped/minified in production builds)
if (typeof window !== 'undefined') {
  // eslint-disable-next-line no-console
  console.debug('[Apollo] GraphQL endpoint:', resolveGraphQLEndpoint());
}