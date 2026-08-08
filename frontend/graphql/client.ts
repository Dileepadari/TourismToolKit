// Apollo Client singleton. Every page in this app is a client component, so a
// module-scope client is sufficient - there is no SSR/RSC data fetching yet.
'use client';

import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

/**
 * Resolve and normalise the GraphQL endpoint.
 *
 * Accepts the env var with or without a trailing `/graphql` and guarantees the
 * final URI ends with it. Note this is a NEXT_PUBLIC_* value, so it is inlined at
 * *build* time - setting it at container runtime has no effect (see the
 * NEXT_PUBLIC_GRAPHQL_URL build arg in frontend/Dockerfile).
 */
export function resolveGraphQLEndpoint(): string {
  const raw = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:8000/graphql';
  let cleaned = raw.trim();
  if (!cleaned) cleaned = 'http://localhost:8000/graphql';
  cleaned = cleaned.replace(/\/+$/, '');
  if (!/\/graphql$/.test(cleaned)) {
    cleaned = `${cleaned}/graphql`;
  }
  return cleaned;
}

// v4 removed createHttpLink in favour of the HttpLink constructor.
//
// There is no auth link any more. Credentials are HttpOnly cookies the browser
// attaches on its own, so nothing here ever touches a token - which is the whole
// point: script cannot read the session, so an XSS cannot steal it.
//
// `credentials: 'include'` is what makes the browser send those cookies to the
// API when it is on a different origin. The backend allows it via
// `allow_credentials=True` for the configured origins only.
const httpLink = new HttpLink({
  uri: resolveGraphQLEndpoint(),
  credentials: 'include',
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // These lists are replaced wholesale on refetch rather than merged,
          // so a deleted entry does not linger in the cache.
          getPlaces: { merge: (_existing, incoming) => incoming },
          getUserDictionary: { merge: (_existing, incoming) => incoming },
          getDictionaryEntries: { merge: (_existing, incoming) => incoming },
        },
      },
    },
  }),
  // No global `errorPolicy: 'all'`. It made every GraphQL error return partial
  // data with no visible failure - which is precisely why a query for a field
  // the schema never had (`getSupportedLanguages`) went unnoticed for so long.
  // It also forces Apollo 4 to type every result as DeepPartial. Errors now
  // surface through each hook's `error`, and callers guard `data` explicitly.
});

export default client;

if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined') {
  console.debug('[Apollo] GraphQL endpoint:', resolveGraphQLEndpoint());
}
