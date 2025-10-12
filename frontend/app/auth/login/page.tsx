'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@apollo/client';
import Link from 'next/link';
import { Eye, EyeOff, Globe, ArrowLeft } from 'lucide-react';
import { LOGIN_MUTATION } from '@/graphql/queries';
import { useAuth } from '@/providers/AuthProvider';
import toast from 'react-hot-toast';
import { useTranslation } from '@/hooks/useTranslation';

export default function Login() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const [loginMutation] = useMutation(LOGIN_MUTATION);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data } = await loginMutation({
        variables: {
          input: formData
        }
      });

      if (data.login.success) {
        // Update auth provider with user data - this will automatically redirect to dashboard
        login(data.login.token, data.login.user);
        
        toast.success('Login successful!');
      } else {
        toast.error(data.login.message || 'Login failed');
      }
    } catch (error) {
      toast.error('An error occurred during login');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <Link 
          href="/"
          className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t('nav.backToHome')}</span>
        </Link>
        
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {t('home.poweredBy')}
          </span>
        </div>
      </div>

      {/* Login Form */}
      <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full space-y-8"
        >
          <div>
            <h2 className="text-center text-3xl font-bold text-foreground">
              {t('auth.login.title')}
            </h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              {t('auth.login.subtitle')}
            </p>
          </div>

          <div className="bg-card py-8 px-6 shadow-xl rounded-2xl border border-border">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground">
                  {t('auth.login.email')}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 appearance-none relative block w-full px-3 py-3 border border-input placeholder-muted-foreground text-foreground rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder={t('auth.login.email')}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground">
                  {t('auth.login.password')}
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="appearance-none relative block w-full px-3 py-3 pr-12 border border-input placeholder-muted-foreground text-foreground rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    placeholder={t('auth.login.password')}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Eye className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Link 
                    href="/auth/forgot-password"
                    className="font-medium text-primary hover:text-primary/80"
                  >
                    {t('auth.login.forgotPassword')}
                  </Link>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg bg-gradient-to-r from-primary to-accent hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-foreground"
                >
                  {isLoading ? t('auth.login.signingIn') : t('auth.login.signIn')}
                </button>
              </div>

              <div className="text-center">
                <span className="text-sm text-muted-foreground">
                  {t('auth.login.noAccount')}{' '}
                  <Link 
                    href="/auth/register"
                    className="font-medium text-primary hover:text-primary/80"
                  >
                    {t('auth.login.signUp')}
                  </Link>
                </span>
              </div>
            </form>
          </div>

          {/* Demo Account Info */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <h3 className="text-sm font-medium text-primary mb-2">
              {t('auth.login.demoAccount')}
            </h3>
            <p className="text-xs text-muted-foreground mb-2">
              Email: test@example.com<br />
              Password: password123
            </p>
            <button
              onClick={() => {
                setFormData({
                  email: 'test@example.com',
                  password: 'password123'
                });
              }}
              className="text-xs font-medium text-primary hover:text-primary/80"
            >
              {t('auth.login.useDemo')}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}