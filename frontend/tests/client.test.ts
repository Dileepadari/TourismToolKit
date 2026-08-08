import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const ORIGINAL = process.env.NEXT_PUBLIC_GRAPHQL_URL;

async function resolveWith(value: string | undefined) {
  if (value === undefined) {
    delete process.env.NEXT_PUBLIC_GRAPHQL_URL;
  } else {
    process.env.NEXT_PUBLIC_GRAPHQL_URL = value;
  }
  vi.resetModules();
  const mod = await import('@/graphql/client');
  return mod.resolveGraphQLEndpoint();
}

describe('resolveGraphQLEndpoint', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    if (ORIGINAL === undefined) delete process.env.NEXT_PUBLIC_GRAPHQL_URL;
    else process.env.NEXT_PUBLIC_GRAPHQL_URL = ORIGINAL;
  });

  it('falls back to localhost when unset', async () => {
    expect(await resolveWith(undefined)).toBe('http://localhost:8000/graphql');
  });

  it('falls back when set to whitespace', async () => {
    expect(await resolveWith('   ')).toBe('http://localhost:8000/graphql');
  });

  it('appends /graphql to a bare origin', async () => {
    expect(await resolveWith('https://api.example.com')).toBe('https://api.example.com/graphql');
  });

  it('is idempotent when /graphql is already present', async () => {
    expect(await resolveWith('https://api.example.com/graphql')).toBe(
      'https://api.example.com/graphql',
    );
  });

  it('strips trailing slashes', async () => {
    expect(await resolveWith('https://api.example.com///')).toBe(
      'https://api.example.com/graphql',
    );
  });

  it('handles a trailing slash after /graphql', async () => {
    expect(await resolveWith('https://api.example.com/graphql/')).toBe(
      'https://api.example.com/graphql',
    );
  });

  it('trims surrounding whitespace', async () => {
    expect(await resolveWith('  https://api.example.com  ')).toBe(
      'https://api.example.com/graphql',
    );
  });
});
