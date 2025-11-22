'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// Simple placeholder Forgot Password page to eliminate 404s.
// Extend later with actual backend mutation (e.g., requestPasswordReset(email)).
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate GraphQL mutation once backend supports password reset flow.
    setSubmitted(true);
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <h1 className="text-2xl font-semibold mb-4">Forgot Password</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Enter the email associated with your account. When password reset functionality is implemented, you'll receive further instructions.
      </p>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="you@example.com"
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {submitted ? 'Submitted' : 'Send Reset Link'}
        </button>
      </form>
      <div className="mt-6 text-center">
        <Link href="/auth/login" className="text-sm text-primary hover:text-primary/80">Back to Login</Link>
      </div>
    </div>
  );
}
