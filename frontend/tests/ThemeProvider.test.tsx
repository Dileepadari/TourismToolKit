import { describe, expect, it, vi } from 'vitest';
import { act, renderHook, render, screen } from '@testing-library/react';
import { ThemeProvider, useTheme, themeInitScript } from '@/providers/ThemeProvider';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('ThemeProvider', () => {
  it('defaults to light', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.theme).toBe('light');
    expect(result.current.resolvedTheme).toBe('light');
  });

  it('reads the stored theme on first render, not in an effect', () => {
    // The old provider started at the default and corrected itself in a
    // useEffect, which guaranteed a flash of the wrong theme.
    localStorage.setItem('tourism-theme', 'dark');
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.theme).toBe('dark');
    expect(result.current.resolvedTheme).toBe('dark');
  });

  it('persists a theme change and toggles the html class', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => result.current.setTheme('dark'));

    expect(localStorage.getItem('tourism-theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    act(() => result.current.setTheme('light'));
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('toggleTheme flips between light and dark', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => result.current.toggleTheme());
    expect(result.current.resolvedTheme).toBe('dark');

    act(() => result.current.toggleTheme());
    expect(result.current.resolvedTheme).toBe('light');
  });

  it('resolves "system" from the media query', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation(
      (query: string) =>
        ({
          matches: true,
          media: query,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        }) as unknown as MediaQueryList,
    );

    const { result } = renderHook(() => useTheme(), { wrapper });
    act(() => result.current.setTheme('system'));

    expect(result.current.resolvedTheme).toBe('dark');
  });

  it('ignores an invalid stored value', () => {
    localStorage.setItem('tourism-theme', 'chartreuse');
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.theme).toBe('light');
  });

  it('renders children immediately, without a pre-mount placeholder', () => {
    // The old provider returned a different tree until mounted, so any child
    // calling useTheme() during that window threw.
    render(
      <ThemeProvider>
        <span>child content</span>
      </ThemeProvider>,
    );
    expect(screen.getByText('child content')).toBeInTheDocument();
  });

  it('throws a helpful error outside a provider', () => {
    expect(() => renderHook(() => useTheme())).toThrow(/must be used within a ThemeProvider/);
  });
});

describe('themeInitScript', () => {
  it('applies the stored theme synchronously', () => {
    localStorage.setItem('tourism-theme', 'dark');
    document.documentElement.classList.remove('dark');

    eval(themeInitScript);

    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('does not throw when localStorage is unavailable', () => {
    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied');
    });
    expect(() => eval(themeInitScript)).not.toThrow();
    spy.mockRestore();
  });
});
