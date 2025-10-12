// English translations
export const en = {
  // Navigation
  nav: {
    home: 'Home',
    dashboard: 'Dashboard',
    translator: 'Translator',
    dictionary: 'Dictionary',
    places: 'Places',
    settings: 'Settings',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    backToHome: 'Back to Home',
    backToDashboard: 'Back to Dashboard',
  },

  // Common
  common: {
    welcome: 'Welcome',
    search: 'Search',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    loading: 'Loading',
    loadingSettings: 'Loading settings...',
    error: 'Error',
    success: 'Success',
    confirm: 'Confirm',
    back: 'Back',
    next: 'Next',
    submit: 'Submit',
    close: 'Close',
    select: 'Select',
    selectLanguage: 'Select Language',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
  },

  // Home Page
  home: {
    title: 'Your Ultimate Travel Companion',
    subtitle: 'Break language barriers, discover hidden gems, and explore India like never before with AI-powered translation, local insights, and personalized recommendations.',
    getStarted: 'Get Started Free',
    signIn: 'Sign In',
    poweredBy: 'Powered by TourismToolKit',
    
    // Features
    features: {
      title: 'Powerful Features for Every Traveler',
      subtitle: 'From real-time translation to local discovery, our toolkit empowers you to explore confidently',
      translation: {
        title: 'Real-time Translation',
        description: 'Translate text, speech, and images instantly across multiple Indian languages',
      },
      places: {
        title: 'Local Places Discovery',
        description: 'Find hidden gems, popular attractions, and local recommendations',
      },
      dictionary: {
        title: 'Language Dictionary',
        description: 'Comprehensive dictionary with pronunciation guides and cultural context',
      },
      guide: {
        title: 'Smart Travel Guide',
        description: 'Personalized recommendations based on your preferences and location',
      },
    },

    // Stats
    stats: {
      languages: 'Languages Supported',
      places: 'Places Covered',
      translations: 'Translations Made',
      travelers: 'Happy Travelers',
    },

    // CTA
    cta: {
      title: 'Ready to Explore India?',
      subtitle: 'Join thousands of travelers who trust TourismToolKit for their Indian adventures. Start your journey today!',
      button: 'Start Your Journey',
    },
  },

  // Auth
  auth: {
    login: {
      title: 'Welcome Back',
      subtitle: 'Sign in to continue your journey',
      email: 'Email Address',
      password: 'Password',
      forgotPassword: 'Forgot your password?',
      signIn: 'Sign In',
      signingIn: 'Signing in...',
      noAccount: "Don't have an account?",
      signUp: 'Sign up',
      demoAccount: 'Demo Account',
      useDemo: 'Use Demo Account',
    },
    register: {
      title: 'Join TourismToolKit',
      subtitle: 'Start your journey across incredible India',
      fullName: 'Full Name',
      username: 'Username',
      email: 'Email Address',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      homeCountry: 'Home Country',
      preferredLanguage: 'Preferred Language',
      createAccount: 'Create Account',
      creatingAccount: 'Creating Account...',
      haveAccount: 'Already have an account?',
      signIn: 'Sign in',
    },
  },

  // Dashboard
  dashboard: {
    title: 'Travel Dashboard',
    subtitle: 'Your personalized travel companion',
    welcome: 'Welcome back',
    loading: 'Loading your travel dashboard...',
    
    quickActions: {
      title: 'Quick Actions',
      translate: 'Translate Now',
      findPlaces: 'Find Places',
      learnWords: 'Learn Words',
    },

    stats: {
      translations: 'Translations',
      placesVisited: 'Places Visited',
      wordsLearned: 'Words Learned',
      tripsPlanned: 'Trips Planned',
    },

    recentActivity: {
      title: 'Recent Activity',
      noActivity: 'No recent activity',
    },

    recommendedPlaces: {
      title: 'Recommended Places',
      viewAll: 'View All Places',
    },
  },

  // Translator
  translator: {
    title: 'AI Translator',
    subtitle: 'Translate across multiple Indian languages instantly',
    
    tabs: {
      text: 'Text',
      voice: 'Voice',
      image: 'Image',
    },

    textTranslation: {
      sourceLanguage: 'Source Language',
      targetLanguage: 'Target Language',
      sourcePlaceholder: 'Enter text to translate...',
      targetPlaceholder: 'Translation will appear here...',
      translate: 'Translate',
      translating: 'Translating...',
      swap: 'Swap Languages',
      clear: 'Clear',
      copy: 'Copy',
      copied: 'Copied!',
    },

    voiceTranslation: {
      startRecording: 'Start Recording',
      stopRecording: 'Stop Recording',
      recording: 'Recording...',
      processing: 'Processing...',
    },

    quickPhrases: {
      title: 'Quick Phrases',
      greetings: 'Hello',
      thanks: 'Thank you',
      help: 'I need help',
      directions: 'Where is...?',
    },
  },

  // Dictionary
  dictionary: {
    title: 'Language Dictionary',
    subtitle: 'Explore words and their meanings across languages',
    searchPlaceholder: 'Search for a word...',
    search: 'Search',
    noResults: 'No results found',
    pronunciation: 'Pronunciation',
    meaning: 'Meaning',
    examples: 'Examples',
    relatedWords: 'Related Words',
  },

  // Places
  places: {
    title: 'Discover Places',
    subtitle: 'Explore amazing destinations across India',
    searchPlaceholder: 'Search places...',
    filters: {
      all: 'All',
      monuments: 'Monuments',
      temples: 'Temples',
      nature: 'Nature',
      food: 'Food',
      shopping: 'Shopping',
    },
    noPlaces: 'No places found',
    viewDetails: 'View Details',
    getDirections: 'Get Directions',
    addToTrip: 'Add to Trip',
  },

  // Settings
  settings: {
    title: 'Settings',
    subtitle: 'Manage your preferences',
    
    account: {
      title: 'Account Information',
      email: 'Email',
      username: 'Username',
      fullName: 'Full Name',
    },

    preferences: {
      title: 'Preferences',
      language: 'Language',
      theme: 'Theme',
      lightMode: 'Light',
      darkMode: 'Dark',
      systemMode: 'System',
    },

    notifications: {
      title: 'Notifications',
      email: 'Email Notifications',
      push: 'Push Notifications',
    },

    save: 'Save Changes',
    saving: 'Saving...',
    saved: 'Settings saved successfully!',
  },
};

export type TranslationKeys = typeof en;
