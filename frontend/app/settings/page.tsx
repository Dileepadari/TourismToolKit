'use client';

import React, { useState } from 'react';
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
import type {
  ActiveSessionsData,
  LogoutData,
  SupportedLanguagesData,
  UpdateProfileData,
  UpdateUserPreferencesData,
  UpdateUserPreferencesVars,
} from '@/graphql/types';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  GET_ACTIVE_SESSIONS,
  GET_SUPPORTED_LANGUAGES,
  LOGOUT_MUTATION,
  UPDATE_PROFILE_MUTATION,
  UPDATE_USER_PREFERENCES_MUTATION,
} from '@/graphql/queries';
import { useTheme } from '@/providers/ThemeProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Header from '@/components/ui/Header';
import { useTranslation } from '@/hooks/useTranslation';

interface LanguageOption {
  code: string;
  name: string;
}

// The wrapper that used to sit here only existed to gate on `mounted`; with the
// theme provider no longer throwing before mount it served no purpose.
export default function Settings() {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const { setSelectedLanguage } = useLanguage();
  const router = useRouter();
  
  // Edits are held as overrides and the displayed value is derived, so the form
  // picks up the account's saved values as soon as the session resolves without
  // an effect racing the user's typing. `useState` alone stayed blank, because
  // `user` is still null on the first render.
  const [edits, setEdits] = useState<Partial<Record<string, string>>>({});

  const formData = {
    fullName: edits.fullName ?? user?.fullName ?? '',
    preferredLanguage: edits.preferredLanguage ?? user?.preferredLanguage ?? 'en',
    homeCountry: edits.homeCountry ?? user?.homeCountry ?? '',
  };

  const { data: languagesData } = useQuery<SupportedLanguagesData>(GET_SUPPORTED_LANGUAGES);
  const [updatePreferences, { loading: updating }] = useMutation<
    UpdateUserPreferencesData,
    UpdateUserPreferencesVars
  >(UPDATE_USER_PREFERENCES_MUTATION);
  const [updateProfile, { loading: savingProfile }] =
    useMutation<UpdateProfileData>(UPDATE_PROFILE_MUTATION);

  const { data: sessionData } =
    useQuery<ActiveSessionsData>(GET_ACTIVE_SESSIONS, { fetchPolicy: 'cache-and-network' });
  const sessions = sessionData?.getActiveSessions ?? [];
  const [signOutEverywhere] = useMutation<LogoutData>(LOGOUT_MUTATION);

  const handleInputChange = (field: string, value: string) => {
    setEdits((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const { data } = await updatePreferences({
        variables: {
          preferredLanguage: formData.preferredLanguage,
          preferredTheme: theme,
        },
      });

      // Preferences and profile are separate mutations: the first has always
      // existed, the second is what actually persists name and country - the
      // form used to report success without saving them anywhere.
      const { data: profileData } = await updateProfile({
        variables: {
          fullName: formData.fullName,
          homeCountry: formData.homeCountry,
        },
      });

      if (!profileData?.updateProfile?.success) {
        toast.error(profileData?.updateProfile?.message ?? 'Failed to save your profile');
        return;
      }

      if (data?.updateUserPreferences?.success) {
        updateUser({
          fullName: formData.fullName,
          preferredLanguage: formData.preferredLanguage,
          homeCountry: formData.homeCountry,
        });
        // Apply it here too: the saved value is what another device will pick up,
        // but this device should switch immediately rather than on next sign-in.
        setSelectedLanguage(formData.preferredLanguage);
        toast.success('Settings updated successfully!');
      } else {
        toast.error(data?.updateUserPreferences?.message ?? 'Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update settings');
    }
  };

  const handleSignOutEverywhere = async () => {
    try {
      const { data } = await signOutEverywhere({ variables: { everywhere: true } });
      if (data?.logout?.success) {
        toast.success(
          data.logout.sessionsEnded > 1
            ? `Signed out of ${data.logout.sessionsEnded} sessions`
            : 'Signed out everywhere',
        );
        // The current session is revoked too, so send the user to sign in again.
        router.push('/auth/login');
      }
    } catch {
      toast.error('Could not sign out everywhere');
    }
  };

  const describeSession = (session: ActiveSessionsData['getActiveSessions'][number]) => {
    const agent = session.userAgent ?? '';
    // A full user-agent string is noise; the browser and platform are the part
    // a person can actually recognise as "this device".
    const browser =
      /Firefox\//.test(agent) ? 'Firefox'
      : /Edg\//.test(agent) ? 'Edge'
      : /Chrome\//.test(agent) ? 'Chrome'
      : /Safari\//.test(agent) ? 'Safari'
      : 'Unknown browser';
    const platform =
      /Android/.test(agent) ? 'Android'
      : /iPhone|iPad/.test(agent) ? 'iOS'
      : /Mac OS X/.test(agent) ? 'macOS'
      : /Windows/.test(agent) ? 'Windows'
      : /Linux/.test(agent) ? 'Linux'
      : '';
    return platform ? `${browser} on ${platform}` : browser;
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
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <User className="w-5 h-5 text-primary-foreground" />
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
                  type="text"value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"placeholder={t('settings.account.fullName')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('settings.account.email')}
                </label>
                <input
                  type="email"value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-2 border border-input rounded-lg bg-muted text-muted-foreground cursor-not-allowed"/>
                <p className="text-xs text-muted-foreground mt-1">
                  Email cannot be changed
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Home Country
                </label>
                <input
                  type="text"value={formData.homeCountry}
                  onChange={(e) => handleInputChange('homeCountry', e.target.value)}
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"placeholder="Enter your home country"/>
              </div>
            </div>
          </Card>

          {/* Appearance Settings */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <Palette className="w-5 h-5 text-secondary-foreground" />
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
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Globe className="w-5 h-5 text-primary-foreground" />
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
                className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent">
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
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-foreground" />
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
                <div
                  className={`w-3 h-3 rounded-full ${user?.isVerified ? 'bg-success' : 'bg-warning'}`}
                />
              </div>

              {/* Active sessions. `logout(everywhere)` has worked since sessions
                  became server-side, but nothing exposed it and there was no way
                  to see what was signed in. */}
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <Monitor className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Active sessions</p>
                    <p className="text-xs text-muted-foreground">
                      {sessions.length === 1
                        ? 'This device only'
                        : `${sessions.length} devices signed in`}
                    </p>
                  </div>
                </div>

                <ul className="space-y-2 mb-3">
                  {sessions.map((session) => (
                    <li
                      key={session.id}
                      className="flex items-center justify-between text-xs text-muted-foreground"
                    >
                      <span>{describeSession(session)}</span>
                      {session.isCurrent && (
                        <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                          This device
                        </span>
                      )}
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={handleSignOutEverywhere}
                  disabled={sessions.length === 0}
                  className="text-sm text-destructive hover:underline disabled:opacity-50 disabled:no-underline"
                >
                  Sign out of all devices
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <Button
            onClick={handleSave}
            disabled={updating || savingProfile}
            className="px-8 py-3 bg-primary hover:opacity-90 text-primary-foreground font-medium rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2">
            <Save className="w-5 h-5" />
            {updating || savingProfile ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}