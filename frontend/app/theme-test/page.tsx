'use client';

export default function ThemeTestPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-foreground mb-8">Theme Test Page</h1>
        
        {/* Background & Foreground */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Background & Foreground</h2>
          <div className="bg-background text-foreground p-6 border border-border rounded-lg">
            <p>This uses bg-background and text-foreground</p>
            <p className="text-muted-foreground">This uses text-muted-foreground</p>
          </div>
        </section>

        {/* Card */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Card</h2>
          <div className="bg-card text-card-foreground p-6 border border-border rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-2">Card Component</h3>
            <p>This uses bg-card and text-card-foreground</p>
          </div>
        </section>

        {/* Primary */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Primary</h2>
          <div className="bg-primary text-primary-foreground p-6 rounded-lg">
            <p>This uses bg-primary and text-primary-foreground</p>
          </div>
        </section>

        {/* Secondary */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Secondary</h2>
          <div className="bg-secondary text-secondary-foreground p-6 rounded-lg">
            <p>This uses bg-secondary and text-secondary-foreground</p>
          </div>
        </section>

        {/* Accent */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Accent</h2>
          <div className="bg-accent text-accent-foreground p-6 rounded-lg">
            <p>This uses bg-accent and text-accent-foreground</p>
          </div>
        </section>

        {/* Muted */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Muted</h2>
          <div className="bg-muted text-muted-foreground p-6 rounded-lg">
            <p>This uses bg-muted and text-muted-foreground</p>
          </div>
        </section>

        {/* Destructive */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Destructive</h2>
          <div className="bg-destructive text-destructive-foreground p-6 rounded-lg">
            <p>This uses bg-destructive and text-destructive-foreground</p>
          </div>
        </section>

        {/* Border Test */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Borders</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="border-2 border-border p-4 rounded-lg">
              <p className="text-foreground">border-border</p>
            </div>
            <div className="border-2 border-primary p-4 rounded-lg">
              <p className="text-foreground">border-primary</p>
            </div>
          </div>
        </section>

        {/* Input Test */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Input</h2>
          <input
            type="text"
            placeholder="Test input..."
            className="w-full p-3 bg-background text-foreground border border-input rounded-lg focus:ring-2 focus:ring-ring focus:outline-none"
          />
        </section>

        {/* CSS Variables Display */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">CSS Variables (for debugging)</h2>
          <div className="bg-card p-6 rounded-lg border border-border font-mono text-sm space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>--background:</div>
              <div style={{ background: 'hsl(var(--background))' }} className="h-6 border border-border"></div>
              
              <div>--foreground:</div>
              <div style={{ background: 'hsl(var(--foreground))' }} className="h-6 border border-border"></div>
              
              <div>--card:</div>
              <div style={{ background: 'hsl(var(--card))' }} className="h-6 border border-border"></div>
              
              <div>--primary:</div>
              <div style={{ background: 'hsl(var(--primary))' }} className="h-6 border border-border"></div>
              
              <div>--secondary:</div>
              <div style={{ background: 'hsl(var(--secondary))' }} className="h-6 border border-border"></div>
              
              <div>--accent:</div>
              <div style={{ background: 'hsl(var(--accent))' }} className="h-6 border border-border"></div>
              
              <div>--muted:</div>
              <div style={{ background: 'hsl(var(--muted))' }} className="h-6 border border-border"></div>
              
              <div>--border:</div>
              <div style={{ background: 'hsl(var(--border))' }} className="h-6 border border-border"></div>
            </div>
          </div>
        </section>

        {/* Current Theme Display */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Current Theme Info</h2>
          <div className="bg-card p-6 rounded-lg border border-border">
            <p className="text-card-foreground mb-2">
              Theme class on html: <code className="bg-muted px-2 py-1 rounded">
                {typeof document !== 'undefined' ? document.documentElement.className : 'loading...'}
              </code>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
