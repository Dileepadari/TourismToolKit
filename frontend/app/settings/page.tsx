'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sun,
  Moon,
  Monitor,
  Shield,
  Eye,
  User, 
  Globe, 
  Palette, 
  Save
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useMutation, useQuery } from '@apollo/client';
import { UPDATE_USER_PREFERENCES_MUTATION, GET_SUPPORTED_LANGUAGES } from '@/graphql/queries';
import { useTheme } from '@/providers/ThemeProvider';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Header from '@/components/ui/Header';

interface LanguageOption {
  code: string;
  name: string;
}

export default function Settings() {
//   const { user, updateUser } = useAuth();
  const [mounted, setMounted] = useState(false);
  
  // Ensure we're on the client side to avoid SSR issues
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return <SettingsContent />;
}

function SettingsContent() {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    preferredLanguage: user?.preferredLanguage || 'en',
    homeCountry: user?.homeCountry || '',
  });

  const { data: languagesData } = useQuery(GET_SUPPORTED_LANGUAGES);
  const [updatePreferences, { loading: updating }] = useMutation(UPDATE_USER_PREFERENCES_MUTATION);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const { data } = await updatePreferences({
        variables: {
          userId: user?.id,
          preferredLanguage: formData.preferredLanguage,
          preferredTheme: theme,
        },
      });

      if (data?.updateUserPreferences?.success) {
        updateUser({
          fullName: formData.fullName,
          preferredLanguage: formData.preferredLanguage,
          homeCountry: formData.homeCountry,
        });
        toast.success('Settings updated successfully!');
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update settings');
    }
  };

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  const languages: LanguageOption[] = languagesData?.getSupportedLanguages?.languages || [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'bn', name: 'Bengali' },
    { code: 'te', name: 'Telugu' },
    { code: 'mr', name: 'Marathi' },
    { code: 'ta', name: 'Tamil' },
    { code: 'ur', name: 'Urdu' },
    { code: 'gu', name: 'Gujarati' },
    { code: 'kn', name: 'Kannada' },
    { code: 'ml', name: 'Malayalam' },
    { code: 'pa', name: 'Punjabi' },
    { code: 'or', name: 'Odia' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-saffron-50 via-white to-heritage-50 dark:from-gray-950 dark:via-gray-900 dark:to-saffron-950/20">
      <Header 
        title="Settings" 
        subtitle="Manage your preferences and account settings"
      />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Settings */}
          <Card className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-saffron-500 to-heritage-500 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Profile</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Update your personal information
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-saffron-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Email cannot be changed
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Home Country
                </label>
                <input
                  type="text"
                  value={formData.homeCountry}
                  onChange={(e) => handleInputChange('homeCountry', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-saffron-500 focus:border-transparent"
                  placeholder="Enter your home country"
                />
              </div>
            </div>
          </Card>

          {/* Appearance Settings */}
          <Card className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-royal-500 to-heritage-500 flex items-center justify-center">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Appearance</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Customize your visual experience
                </p>
              </div>
            </div>
+
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Theme
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {themeOptions.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setTheme(value as typeof theme)}
                      className={`p-3 rounded-lg border transition-all duration-200 flex flex-col items-center gap-2 ${
                        theme === value
                          ? 'border-saffron-500 bg-saffron-50 dark:bg-saffron-950/50 text-saffron-700 dark:text-saffron-300'
                          : 'border-gray-300 dark:border-gray-600 hover:border-saffron-300 dark:hover:border-saffron-600'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Language Settings */}
          <Card className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-heritage-500 to-royal-500 flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Language</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Select your preferred language
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Preferred Language
              </label>
              <select
                value={formData.preferredLanguage}
                onChange={(e) => handleInputChange('preferredLanguage', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-saffron-500 focus:border-transparent"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </Card>

          {/* Privacy & Security */}
          <Card className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-golden-500 to-saffron-500 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Privacy & Security</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage your account security
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Account Status
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {user?.isVerified ? 'Verified' : 'Not verified'}
                    </p>
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full ${user?.isVerified ? 'bg-green-500' : 'bg-yellow-500'}`} />
              </div>
            </div>
          </Card>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-center">
          <Button
            onClick={handleSave}
            disabled={updating}
            className="px-8 py-3 bg-gradient-to-r from-saffron-500 to-heritage-500 hover:from-saffron-600 hover:to-heritage-600 text-white font-medium rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <Save className="w-5 h-5 mr-2" />
            {updating ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}