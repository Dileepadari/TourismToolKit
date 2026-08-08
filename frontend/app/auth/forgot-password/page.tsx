'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useMutation } from '@apollo/client/react';
import toast from 'react-hot-toast';
import { REQUEST_PASSWORD_RESET_MUTATION } from '@/graphql/queries';
import type { PasswordResetData } from '@/graphql/types';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [requestReset, { loading }] = useMutation<PasswordResetData>(
    REQUEST_PASSWORD_RESET_MUTATION,
  );

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const { data } = await requestReset({ variables: { email } });
      // The server answers the same way whether or not the address is
      // registered, so this page must not imply anything either.
      setSubmitted(true);
      if (data?.requestPasswordReset?.message) {
        toast.success(data.requestPasswordReset.message);
      }
    } catch {
      toast.error('Could not start the reset. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <h1 className="text-2xl font-semibold mb-4 text-foreground">Forgot password</h1>

      {submitted ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            If an account exists for <span className="font-medium">{email}</span>, a reset link
            has been generated.
          </p>
          <p className="text-sm text-muted-foreground">
            This deployment has no email provider configured, so the link is written to the
            server log rather than sent. See DEVELOPMENT.md for how to wire one up.
          </p>
          <Link href="/auth/login" className="text-primary hover:underline text-sm">
            Back to sign in
          </Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-6">
            Enter the email associated with your account and we&apos;ll generate a reset link.
          </p>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1 text-foreground">
                Email
              </label>
              <input
                id="email"type="email"required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"placeholder="you@example.com"/>
            </div>
            <button
              type="submit"disabled={loading}
              className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-medium disabled:opacity-50">
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
          <Link
            href="/auth/login"className="text-primary hover:underline text-sm mt-6 inline-block">
            Back to sign in
          </Link>
        </>
      )}
    </div>
  );
}
