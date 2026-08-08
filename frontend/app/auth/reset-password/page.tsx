'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@apollo/client/react';
import toast from 'react-hot-toast';
import { RESET_PASSWORD_MUTATION } from '@/graphql/queries';
import type { ResetPasswordData } from '@/graphql/types';

function ResetPasswordForm() {
  const router = useRouter();
  // useSearchParams requires a Suspense boundary in the App Router, which is
  // why this is split out from the default export below.
  const token = useSearchParams().get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [resetPassword, { loading }] = useMutation<ResetPasswordData>(RESET_PASSWORD_MUTATION);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (password !== confirm) {
      toast.error('The two passwords do not match');
      return;
    }

    try {
      const { data } = await resetPassword({ variables: { token, newPassword: password } });
      const result = data?.resetPassword;

      if (result?.success) {
        toast.success(result.message);
        router.push('/auth/login');
      } else {
        toast.error(result?.message ?? 'Could not reset the password');
      }
    } catch {
      toast.error('Could not reset the password. Please try again.');
    }
  };

  if (!token) {
    return (
      <p className="text-sm text-muted-foreground">
        This link is missing its token. Request a new one from the{' '}
        <Link href="/auth/forgot-password" className="text-primary hover:underline">
          forgot password
        </Link>{' '}
        page.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1 text-foreground">
          New password
        </label>
        <input
          id="password"type="password"required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"/>
      </div>
      <div>
        <label htmlFor="confirm" className="block text-sm font-medium mb-1 text-foreground">
          Confirm new password
        </label>
        <input
          id="confirm"type="password"required
          minLength={8}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"/>
      </div>
      <button
        type="submit"disabled={loading}
        className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-medium disabled:opacity-50">
        {loading ? 'Updating…' : 'Set new password'}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <h1 className="text-2xl font-semibold mb-4 text-foreground">Choose a new password</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Setting a new password signs you out everywhere else.
      </p>
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
