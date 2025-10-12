'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@apollo/client';
import Link from 'next/link';
import { Eye, EyeOff, Globe, ArrowLeft } from 'lucide-react';
import { LOGIN_MUTATION } from '@/graphql/queries';
import { useAuth } from '@/providers/AuthProvider';
import toast from 'react-hot-toast';

export default function Login() {
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
    <div className="min-h-screen bg-gradient-to-br from-saffron-50 via-white to-heritage-50 dark:from-gray-900 dark:via-gray-800 dark:to-saffron-900">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <Link 
          href="/"
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </Link>
        
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-saffron-500 to-heritage-500 rounded-lg flex items-center justify-center">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-saffron-600 to-heritage-600 bg-clip-text text-transparent">
            TourismToolKit
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
            <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-white">
              Welcome Back
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Sign in to continue your journey
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow-xl rounded-2xl">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
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
                    className="appearance-none relative block w-full px-3 py-3 pr-12 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Link 
                    href="/auth/forgot-password"
                    className="font-medium text-saffron-600 hover:text-saffron-500 dark:text-saffron-400"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-saffron-500 to-heritage-500 hover:from-saffron-600 hover:to-heritage-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-saffron-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </button>
              </div>

              <div className="text-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Don&apos;t have an account?{' '}
                  <Link 
                    href="/auth/register"
                    className="font-medium text-saffron-600 hover:text-saffron-500 dark:text-saffron-400"
                  >
                    Sign up
                  </Link>
                </span>
              </div>
            </form>
          </div>

          {/* Demo Account Info */}
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
              Demo Account
            </h3>
            <p className="text-xs text-blue-600 dark:text-blue-300 mb-2">
              Email: test@example.com<br />
              Password: password
            </p>
            <button
              onClick={() => {
                setFormData({
                  email: 'test@example.com',
                  password: 'password'
                });
              }}
              className="text-xs font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              Use Demo Account
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}