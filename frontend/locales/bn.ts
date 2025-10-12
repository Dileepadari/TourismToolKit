// Bengali translations
import { TranslationKeys } from './en';

export const bn: TranslationKeys = {
  // Navigation
  nav: {
    home: 'হোম',
    dashboard: 'ড্যাশবোর্ড',
    translator: 'অনুবাদক',
    dictionary: 'অভিধান',
    places: 'স্থান',
    settings: 'সেটিংস',
    login: 'লগইন',
    register: 'নিবন্ধন',
    logout: 'লগআউট',
    backToHome: 'হোমে ফিরে যান',
    backToDashboard: 'ড্যাশবোর্ডে ফিরে যান',
  },

  // Common
  common: {
    welcome: 'স্বাগতম',
    search: 'খুঁজুন',
    save: 'সংরক্ষণ করুন',
    cancel: 'বাতিল করুন',
    delete: 'মুছে ফেলুন',
    edit: 'সম্পাদনা করুন',
    loading: 'লোড হচ্ছে',
    loadingSettings: 'সেটিংস লোড হচ্ছে...',
    error: 'ত্রুটি',
    success: 'সফলতা',
    confirm: 'নিশ্চিত করুন',
    back: 'পেছনে',
    next: 'পরবর্তী',
    submit: 'জমা দিন',
    close: 'বন্ধ করুন',
    select: 'নির্বাচন করুন',
    selectLanguage: 'ভাষা নির্বাচন করুন',
    darkMode: 'ডার্ক মোড',
    lightMode: 'লাইট মোড',
  },

  // Home Page
  home: {
    title: 'আপনার চূড়ান্ত ভ্রমণ সঙ্গী',
    subtitle: 'AI-চালিত অনুবাদ, স্থানীয় অন্তর্দৃষ্টি এবং ব্যক্তিগত সুপারিশের সাথে ভাষার বাধা ভাঙুন, লুকানো রত্ন আবিষ্কার করুন এবং ভারতকে এমনভাবে অন্বেষণ করুন যা আগে কখনও হয়নি।',
    getStarted: 'বিনামূল্যে শুরু করুন',
    signIn: 'সাইন ইন করুন',
    poweredBy: 'TourismToolKit দ্বারা চালিত',
    
    // Features
    features: {
      title: 'প্রতিটি ভ্রমণকারীর জন্য শক্তিশালী বৈশিষ্ট্য',
      subtitle: 'রিয়েল-টাইম অনুবাদ থেকে স্থানীয় আবিষ্কার পর্যন্ত, আমাদের টুলকিট আপনাকে আত্মবিশ্বাসের সাথে অন্বেষণ করার ক্ষমতা দেয়',
      translation: {
        title: 'রিয়েল-টাইম অনুবাদ',
        description: 'একাধিক ভারতীয় ভাষায় তাৎক্ষণিকভাবে পাঠ্য, বক্তৃতা এবং ছবি অনুবাদ করুন',
      },
      places: {
        title: 'স্থানীয় স্থান আবিষ্কার',
        description: 'লুকানো রত্ন, জনপ্রিয় আকর্ষণ এবং স্থানীয় সুপারিশ আবিষ্কার করুন',
      },
      dictionary: {
        title: 'ভাষা অভিধান',
        description: 'উচ্চারণ গাইড এবং সাংস্কৃতিক প্রসঙ্গ সহ ব্যাপক অভিধান',
      },
      guide: {
        title: 'স্মার্ট ভ্রমণ গাইড',
        description: 'আপনার পছন্দ এবং অবস্থানের উপর ভিত্তি করে ব্যক্তিগত সুপারিশ',
      },
    },

    // Stats
    stats: {
      languages: 'সমর্থিত ভাষা',
      places: 'অন্তর্ভুক্ত স্থান',
      translations: 'সম্পন্ন অনুবাদ',
      travelers: 'সন্তুষ্ট ভ্রমণকারী',
    },

    // CTA
    cta: {
      title: 'ভারত অন্বেষণের জন্য প্রস্তুত?',
      subtitle: 'তাদের ভারতীয় অভিযানের জন্য TourismToolKit বিশ্বাস করে এমন হাজার হাজার ভ্রমণকারীর সাথে যোগ দিন। আজই আপনার যাত্রা শুরু করুন!',
      button: 'আপনার যাত্রা শুরু করুন',
    },
  },

  // Auth
  auth: {
    login: {
      title: 'আবার স্বাগতম',
      subtitle: 'আপনার যাত্রা চালিয়ে যেতে সাইন ইন করুন',
      email: 'ইমেল ঠিকানা',
      password: 'পাসওয়ার্ড',
      forgotPassword: 'আপনার পাসওয়ার্ড ভুলে গেছেন?',
      signIn: 'সাইন ইন করুন',
      signingIn: 'সাইন ইন হচ্ছে...',
      noAccount: 'অ্যাকাউন্ট নেই?',
      signUp: 'সাইন আপ করুন',
      demoAccount: 'ডেমো অ্যাকাউন্ট',
      useDemo: 'ডেমো অ্যাকাউন্ট ব্যবহার করুন',
    },
    register: {
      title: 'TourismToolKit এ যোগ দিন',
      subtitle: 'অবিশ্বাস্য ভারতে আপনার যাত্রা শুরু করুন',
      fullName: 'পূর্ণ নাম',
      username: 'ব্যবহারকারীর নাম',
      email: 'ইমেল ঠিকানা',
      password: 'পাসওয়ার্ড',
      confirmPassword: 'পাসওয়ার্ড নিশ্চিত করুন',
      homeCountry: 'মাতৃভূমি',
      preferredLanguage: 'পছন্দের ভাষা',
      createAccount: 'অ্যাকাউন্ট তৈরি করুন',
      creatingAccount: 'অ্যাকাউন্ট তৈরি হচ্ছে...',
      haveAccount: 'ইতিমধ্যে একটি অ্যাকাউন্ট আছে?',
      signIn: 'সাইন ইন করুন',
    },
  },

  // Dashboard
  dashboard: {
    title: 'ভ্রমণ ড্যাশবোর্ড',
    subtitle: 'আপনার ব্যক্তিগতকৃত ভ্রমণ সঙ্গী',
    welcome: 'আবার স্বাগতম',
    loading: 'আপনার ভ্রমণ ড্যাশবোর্ড লোড হচ্ছে...',
    
    quickActions: {
      title: 'দ্রুত ক্রিয়া',
      translate: 'এখনই অনুবাদ করুন',
      findPlaces: 'স্থান খুঁজুন',
      learnWords: 'শব্দ শিখুন',
    },

    stats: {
      translations: 'অনুবাদ',
      placesVisited: 'পরিদর্শিত স্থান',
      wordsLearned: 'শেখা শব্দ',
      tripsPlanned: 'পরিকল্পিত ভ্রমণ',
    },

    recentActivity: {
      title: 'সাম্প্রতিক কার্যকলাপ',
      noActivity: 'কোন সাম্প্রতিক কার্যকলাপ নেই',
    },

    recommendedPlaces: {
      title: 'প্রস্তাবিত স্থান',
      viewAll: 'সমস্ত স্থান দেখুন',
    },
  },

  // Translator
  translator: {
    title: 'AI অনুবাদক',
    subtitle: 'একাধিক ভারতীয় ভাষায় তাৎক্ষণিক অনুবাদ করুন',
    
    tabs: {
      text: 'পাঠ্য',
      voice: 'ভয়েস',
      image: 'ছবি',
    },

    textTranslation: {
      sourceLanguage: 'উৎস ভাষা',
      targetLanguage: 'লক্ষ্য ভাষা',
      sourcePlaceholder: 'অনুবাদ করতে পাঠ্য লিখুন...',
      targetPlaceholder: 'অনুবাদ এখানে প্রদর্শিত হবে...',
      translate: 'অনুবাদ করুন',
      translating: 'অনুবাদ হচ্ছে...',
      swap: 'ভাষা পরিবর্তন করুন',
      clear: 'মুছে ফেলুন',
      copy: 'কপি করুন',
      copied: 'কপি করা হয়েছে!',
    },

    voiceTranslation: {
      startRecording: 'রেকর্ডিং শুরু করুন',
      stopRecording: 'রেকর্ডিং বন্ধ করুন',
      recording: 'রেকর্ড হচ্ছে...',
      processing: 'প্রক্রিয়া হচ্ছে...',
    },

    quickPhrases: {
      title: 'দ্রুত বাক্যাংশ',
      greetings: 'নমস্কার',
      thanks: 'ধন্যবাদ',
      help: 'আমার সাহায্য দরকার',
      directions: 'কোথায়...?',
    },
  },

  // Dictionary
  dictionary: {
    title: 'ভাষা অভিধান',
    subtitle: 'ভাষায় শব্দ এবং তাদের অর্থ অন্বেষণ করুন',
    searchPlaceholder: 'একটি শব্দ খুঁজুন...',
    search: 'খুঁজুন',
    noResults: 'কোন ফলাফল পাওয়া যায়নি',
    pronunciation: 'উচ্চারণ',
    meaning: 'অর্থ',
    examples: 'উদাহরণ',
    relatedWords: 'সম্পর্কিত শব্দ',
  },

  // Places
  places: {
    title: 'স্থান খুঁজুন',
    subtitle: 'সমগ্র ভারত জুড়ে অসাধারণ গন্তব্য অন্বেষণ করুন',
    searchPlaceholder: 'স্থান খুঁজুন...',
    filters: {
      all: 'সব',
      monuments: 'স্মৃতিস্তম্ভ',
      temples: 'মন্দির',
      nature: 'প্রকৃতি',
      food: 'খাবার',
      shopping: 'কেনাকাটা',
    },
    noPlaces: 'কোন স্থান পাওয়া যায়নি',
    viewDetails: 'বিস্তারিত দেখুন',
    getDirections: 'দিকনির্দেশ পান',
    addToTrip: 'ট্রিপে যোগ করুন',
  },

  // Settings
  settings: {
    title: 'সেটিংস',
    subtitle: 'আপনার পছন্দগুলি পরিচালনা করুন',
    
    account: {
      title: 'অ্যাকাউন্ট তথ্য',
      email: 'ইমেল',
      username: 'ব্যবহারকারীর নাম',
      fullName: 'পূর্ণ নাম',
    },

    preferences: {
      title: 'পছন্দসমূহ',
      language: 'ভাষা',
      theme: 'থিম',
      lightMode: 'আলো',
      darkMode: 'অন্ধকার',
      systemMode: 'সিস্টেম',
    },

    notifications: {
      title: 'বিজ্ঞপ্তি',
      email: 'ইমেল বিজ্ঞপ্তি',
      push: 'পুশ বিজ্ঞপ্তি',
    },

    save: 'পরিবর্তনগুলি সংরক্ষণ করুন',
    saving: 'সংরক্ষণ হচ্ছে...',
    saved: 'সেটিংস সফলভাবে সংরক্ষিত হয়েছে!',
  },
};
