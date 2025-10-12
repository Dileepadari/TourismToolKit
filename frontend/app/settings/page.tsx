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
import { useTranslation } from '@/hooks/useTranslation';

interface LanguageOption {
  code: string;
  name: string;
}

export default function Settings() {
  const { t } = useTranslation();
//   const { user, updateUser } = useAuth();
  const [mounted, setMounted] = useState(false);
  
  // Ensure we're on the client side to avoid SSR issues
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('common.loadingSettings')}</p>
        </div>
      </div>
    );
  }

  return <SettingsContent />;
}

function SettingsContent() {
  const { t } = useTranslation();
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
    { value: 'light', label: t('settings.preferences.lightMode'), icon: Sun },
    { value: 'dark', label: t('settings.preferences.darkMode'), icon: Moon },
    { value: 'system', label: t('settings.preferences.systemMode'), icon: Monitor },
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
    <div className="min-h-screen bg-background">
      <Header 
        title={t('settings.title')} 
        subtitle={t('settings.subtitle')}
      />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Settings */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">{t('settings.account.title')}</h3>
                <p className="text-sm text-muted-foreground">
                  Update your personal information
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('settings.account.fullName')}
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder={t('settings.account.fullName')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('settings.account.email')}
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-2 border border-input rounded-lg bg-muted text-muted-foreground cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Email cannot be changed
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Home Country
                </label>
                <input
                  type="text"
                  value={formData.homeCountry}
                  onChange={(e) => handleInputChange('homeCountry', e.target.value)}
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder="Enter your home country"
                />
              </div>
            </div>
          </Card>

          {/* Appearance Settings */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-secondary to-accent flex items-center justify-center">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Appearance</h3>
                <p className="text-sm text-muted-foreground">
                  Customize your visual experience
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Theme
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {themeOptions.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setTheme(value as typeof theme)}
                      className={`p-3 rounded-lg border transition-all duration-200 flex flex-col items-center gap-2 ${
                        theme === value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary hover:bg-muted'
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
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-accent to-secondary flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Language</h3>
                <p className="text-sm text-muted-foreground">
                  Select your preferred language
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Preferred Language
              </label>
              <select
                value={formData.preferredLanguage}
                onChange={(e) => handleInputChange('preferredLanguage', e.target.value)}
                className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
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
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-secondary to-primary flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Privacy & Security</h3>
                <p className="text-sm text-muted-foreground">
                  Manage your account security
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Account Status
                    </p>
                    <p className="text-xs text-muted-foreground">
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
        <div className="mt-8 flex justify-end">
          <Button
            onClick={handleSave}
            disabled={updating}
            className="px-8 py-3 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-medium rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            {updating ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}