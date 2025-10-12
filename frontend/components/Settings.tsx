'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  Sun, 
  Moon, 
  Bell, 
  BellOff,
  Shield, 
  Globe, 
  Volume2, 
  VolumeX,
  Wifi,
  Languages,
  Database,
  Save,
  RotateCcw,
  Eye,
  EyeOff
} from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import { cn } from '@/utils/cn';
import { Card, CardContent } from './ui/Card';
import Button from './ui/Button';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SettingsData {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: boolean;
  sound: boolean;
  dataSync: boolean;
  offline: boolean;
  privacy: boolean;
  autoTranslate: boolean;
  voiceEnabled: boolean;
}

export default function Settings({ isOpen, onClose }: SettingsProps) {
  const { theme, setTheme } = useTheme();
  const { selectedLanguage, supportedLanguages, setSelectedLanguage } = useLanguage();
  
  const [settings, setSettings] = useState<SettingsData>({
    theme: (theme as 'light' | 'dark' | 'system') || 'system',
    language: selectedLanguage,
    notifications: true,
    sound: true,
    dataSync: true,
    offline: false,
    privacy: true,
    autoTranslate: false,
    voiceEnabled: true,
  });

  const [activeTab, setActiveTab] = useState<'general' | 'language' | 'privacy' | 'advanced'>('general');

  const handleSettingChange = (key: keyof SettingsData, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    // Apply changes immediately for some settings
    if (key === 'theme' && typeof value === 'string') {
      setTheme(value as 'light' | 'dark' | 'system');
    }
    if (key === 'language' && typeof value === 'string') {
      setSelectedLanguage(value);
    }
  };

  const saveSettings = () => {
    // Save to localStorage or send to backend
    localStorage.setItem('tourism-app-settings', JSON.stringify(settings));
    onClose();
  };

  const resetSettings = () => {
    const defaultSettings: SettingsData = {
      theme: 'system',
      language: 'en',
      notifications: true,
      sound: true,
      dataSync: true,
      offline: false,
      privacy: true,
      autoTranslate: false,
      voiceEnabled: true,
    };
    setSettings(defaultSettings);
    setTheme('system');
    setSelectedLanguage('en');
  };

  const tabs = [
    { id: 'general' as const, label: 'General', icon: SettingsIcon },
    { id: 'language' as const, label: 'Language', icon: Languages },
    { id: 'privacy' as const, label: 'Privacy', icon: Shield },
    { id: 'advanced' as const, label: 'Advanced', icon: Database },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-card rounded-2xl shadow-hard max-w-4xl w-full max-h-[90vh] overflow-hidden border border-border"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-accent px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <SettingsIcon className="w-6 h-6 text-white" />
                  <h2 className="text-xl font-semibold text-white">Settings</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-white hover:bg-white/20"
                >
                  ✕
                </Button>
              </div>
            </div>

            <div className="flex">
              {/* Sidebar */}
              <div className="w-64 bg-muted p-4 border-r border-border">
                <nav className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        'w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all',
                        activeTab === tab.id
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-muted/80'
                      )}
                    >
                      <tab.icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Content */}
              <div className="flex-1 p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                {/* General Tab */}
                {activeTab === 'general' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-4">General Settings</h3>
                      
                      {/* Theme */}
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 text-foreground">
                              {settings.theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                              <div>
                                <h4 className="font-medium">Theme</h4>
                                <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
                              </div>
                            </div>
                            <select
                              value={settings.theme}
                              onChange={(e) => handleSettingChange('theme', e.target.value)}
                              className="px-3 py-2 border border-input rounded-lg bg-background text-foreground"
                            >
                              <option value="light">Light</option>
                              <option value="dark">Dark</option>
                              <option value="system">System</option>
                            </select>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Notifications */}
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {settings.notifications ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                              <div>
                                <h4 className="font-medium">Notifications</h4>
                                <p className="text-sm text-gray-500">Receive push notifications</p>
                              </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.notifications}
                                onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-saffron-500"></div>
                            </label>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Sound */}
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {settings.sound ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                              <div>
                                <h4 className="font-medium">Sound Effects</h4>
                                <p className="text-sm text-gray-500">Play sounds for interactions</p>
                              </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.sound}
                                onChange={(e) => handleSettingChange('sound', e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-saffron-500"></div>
                            </label>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                {/* Language Tab */}
                {activeTab === 'language' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Language & Translation</h3>
                      
                      {/* Language Selection */}
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3 mb-4">
                            <Globe className="w-5 h-5" />
                            <div>
                              <h4 className="font-medium">App Language</h4>
                              <p className="text-sm text-gray-500">Choose your preferred language</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            {supportedLanguages.map((lang) => (
                              <label
                                key={lang.code}
                                className={cn(
                                  'flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-all',
                                  settings.language === lang.code
                                    ? 'border-saffron-500 bg-saffron-50 dark:bg-saffron-900/20'
                                    : 'border-gray-300 dark:border-gray-600 hover:border-saffron-300'
                                )}
                              >
                                <input
                                  type="radio"
                                  name="language"
                                  value={lang.code}
                                  checked={settings.language === lang.code}
                                  onChange={(e) => handleSettingChange('language', e.target.value)}
                                  className="text-saffron-500"
                                />
                                <span>{lang.name}</span>
                              </label>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Auto Translate */}
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Languages className="w-5 h-5" />
                              <div>
                                <h4 className="font-medium">Auto Translate</h4>
                                <p className="text-sm text-gray-500">Automatically translate content</p>
                              </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.autoTranslate}
                                onChange={(e) => handleSettingChange('autoTranslate', e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-saffron-500"></div>
                            </label>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                {/* Privacy Tab */}
                {activeTab === 'privacy' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Privacy & Security</h3>
                      
                      {/* Privacy Mode */}
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {settings.privacy ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                              <div>
                                <h4 className="font-medium">Privacy Mode</h4>
                                <p className="text-sm text-gray-500">Enhanced privacy protection</p>
                              </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.privacy}
                                onChange={(e) => handleSettingChange('privacy', e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-saffron-500"></div>
                            </label>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                {/* Advanced Tab */}
                {activeTab === 'advanced' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Advanced Settings</h3>
                      
                      {/* Data Sync */}
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Database className="w-5 h-5" />
                              <div>
                                <h4 className="font-medium">Data Sync</h4>
                                <p className="text-sm text-gray-500">Sync data across devices</p>
                              </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.dataSync}
                                onChange={(e) => handleSettingChange('dataSync', e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-saffron-500"></div>
                            </label>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Offline Mode */}
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Wifi className="w-5 h-5" />
                              <div>
                                <h4 className="font-medium">Offline Mode</h4>
                                <p className="text-sm text-gray-500">Enable offline functionality</p>
                              </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.offline}
                                onChange={(e) => handleSettingChange('offline', e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-saffron-500"></div>
                            </label>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={resetSettings}
                  icon={<RotateCcw className="w-4 h-4" />}
                >
                  Reset to Default
                </Button>
                <div className="flex space-x-3">
                  <Button variant="ghost" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={saveSettings}
                    icon={<Save className="w-4 h-4" />}
                  >
                    Save Settings
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}