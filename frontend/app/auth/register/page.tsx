'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Globe, ArrowLeft, User, Mail, Lock, MapPin } from 'lucide-react';
import { REGISTER_MUTATION } from '@/graphql/queries';
import toast from 'react-hot-toast';

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    homeCountry: 'India',
    preferredLanguage: 'en',
    preferredTheme: 'light'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const [registerMutation] = useMutation(REGISTER_MUTATION);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const { data } = await registerMutation({
        variables: {
          input: {
            email: formData.email,
            username: formData.username,
            password: formData.password,
            fullName: formData.fullName,
            homeCountry: formData.homeCountry,
            preferredLanguage: formData.preferredLanguage,
            preferredTheme: formData.preferredTheme
          }
        }
      });

      if (data.register.success) {
        // Store token and user data
        localStorage.setItem('authToken', data.register.token);
        localStorage.setItem('user', JSON.stringify(data.register.user));
        
        toast.success('Registration successful! Welcome to TourismToolKit!');
        router.push('/dashboard');
      } else {
        toast.error(data.register.message || 'Registration failed');
      }
    } catch (error) {
      toast.error('An error occurred during registration');
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const countries = [
    'India', 'United States', 'United Kingdom', 'Canada', 'Australia',
    'Germany', 'France', 'Japan', 'China', 'Other'
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'te', name: 'Telugu' },
    { code: 'ta', name: 'Tamil' },
    { code: 'kn', name: 'Kannada' },
    { code: 'ml', name: 'Malayalam' },
    { code: 'bn', name: 'Bengali' },
    { code: 'gu', name: 'Gujarati' },
    { code: 'mr', name: 'Marathi' },
    { code: 'pa', name: 'Punjabi' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
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
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            TourismToolKit
          </span>
        </div>
      </div>

      {/* Register Form */}
      <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full space-y-8"
        >
          <div>
            <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-white">
              Join TourismToolKit
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Start your journey across incredible India
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow-xl rounded-2xl">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Personal Information */}
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    <User className="inline w-4 h-4 mr-2" />
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Choose a username"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Mail className="inline w-4 h-4 mr-2" />
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Lock className="inline w-4 h-4 mr-2" />
                    Password
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full px-3 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Create a password"
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

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Confirm your password"
                  />
                </div>

                <div>
                  <label htmlFor="homeCountry" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    <MapPin className="inline w-4 h-4 mr-2" />
                    Home Country
                  </label>
                  <select
                    id="homeCountry"
                    name="homeCountry"
                    value={formData.homeCountry}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {countries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="preferredLanguage" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Preferred Language
                  </label>
                  <select
                    id="preferredLanguage"
                    name="preferredLanguage"
                    value={formData.preferredLanguage}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {languages.map(lang => (
                      <option key={lang.code} value={lang.code}>{lang.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>

              <div className="text-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Already have an account?{' '}
                  <Link 
                    href="/auth/login"
                    className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                  >
                    Sign in
                  </Link>
                </span>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}