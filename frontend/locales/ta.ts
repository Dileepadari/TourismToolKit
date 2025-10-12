// Tamil translations
import { TranslationKeys } from './en';

export const ta: TranslationKeys = {
  // Navigation
  nav: {
    home: 'முகப்பு',
    dashboard: 'டாஷ்போர்டு',
    translator: 'மொழிபெயர்ப்பாளர்',
    dictionary: 'அகராதி',
    places: 'இடங்கள்',
    settings: 'அமைப்புகள்',
    login: 'உள்நுழை',
    register: 'பதிவு செய்',
    logout: 'வெளியேறு',
    backToHome: 'முகப்புக்குத் திரும்பு',
    backToDashboard: 'டாஷ்போர்டுக்குத் திரும்பு',
  },

  // Common
  common: {
    welcome: 'வரவேற்கிறோம்',
    search: 'தேடு',
    save: 'சேமி',
    cancel: 'ரத்துசெய்',
    delete: 'நீக்கு',
    edit: 'திருத்து',
    loading: 'ஏற்றுகிறது',
    loadingSettings: 'அமைப்புகள் ஏற்றப்படுகின்றன...',
    error: 'பிழை',
    success: 'வெற்றி',
    confirm: 'உறுதிப்படுத்து',
    back: 'பின்செல்',
    next: 'அடுத்து',
    submit: 'சமர்ப்பி',
    close: 'மூடு',
    select: 'தேர்ந்தெடு',
    selectLanguage: 'மொழியைத் தேர்ந்தெடுக்கவும்',
    darkMode: 'இருண்ட பயன்முறை',
    lightMode: 'ஒளி பயன்முறை',
  },

  // Home Page
  home: {
    title: 'உங்கள் இறுதி பயண துணை',
    subtitle: 'AI-ஆல் இயங்கும் மொழிபெயர்ப்பு, உள்ளூர் நுண்ணறிவுகள் மற்றும் தனிப்பயனாக்கப்பட்ட பரிந்துரைகளுடன் மொழி தடைகளை உடைக்கவும், மறைக்கப்பட்ட ரத்தினங்களைக் கண்டறியவும், இந்தியாவை முன்பு எப்போதும் இல்லாத வகையில் ஆராயவும்.',
    getStarted: 'இலவசமாகத் தொடங்குங்கள்',
    signIn: 'உள்நுழைக',
    poweredBy: 'TourismToolKit மூலம் இயக்கப்படுகிறது',
    
    // Features
    features: {
      title: 'ஒவ்வொரு பயணிக்கும் சக்திவாய்ந்த அம்சங்கள்',
      subtitle: 'நேரடி மொழிபெயர்ப்பு முதல் உள்ளூர் கண்டுபிடிப்பு வரை, எங்கள் கருவித்தொகுப்பு நம்பிக்கையுடன் ஆராய உங்களுக்கு அதிகாரம் அளிக்கிறது',
      translation: {
        title: 'நேரடி மொழிபெயர்ப்பு',
        description: 'பல இந்திய மொழிகளில் உரை, பேச்சு மற்றும் படங்களை உடனடியாக மொழிபெயர்க்கவும்',
      },
      places: {
        title: 'உள்ளூர் இடங்கள் கண்டுபிடிப்பு',
        description: 'மறைக்கப்பட்ட ரத்தினங்கள், பிரபலமான ஈர்ப்புகள் மற்றும் உள்ளூர் பரிந்துரைகளைக் கண்டறியவும்',
      },
      dictionary: {
        title: 'மொழி அகராதி',
        description: 'உச்சரிப்பு வழிகாட்டிகள் மற்றும் கலாச்சார சூழலுடன் விரிவான அகராதி',
      },
      guide: {
        title: 'ஸ்மார்ட் பயண வழிகாட்டி',
        description: 'உங்கள் விருப்பத்தேர்வுகள் மற்றும் இருப்பிடத்தின் அடிப்படையில் தனிப்பயனாக்கப்பட்ட பரிந்துரைகள்',
      },
    },

    // Stats
    stats: {
      languages: 'ஆதரிக்கப்படும் மொழிகள்',
      places: 'உள்ளடக்கப்பட்ட இடங்கள்',
      translations: 'செய்யப்பட்ட மொழிபெயர்ப்புகள்',
      travelers: 'மகிழ்ச்சியான பயணிகள்',
    },

    // CTA
    cta: {
      title: 'இந்தியாவை ஆராய தயாரா?',
      subtitle: 'தங்கள் இந்திய சாகசங்களுக்காக TourismToolKit ஐ நம்பும் ஆயிரக்கணக்கான பயணிகளுடன் சேரவும். இன்றே உங்கள் பயணத்தைத் தொடங்குங்கள்!',
      button: 'உங்கள் பயணத்தைத் தொடங்குங்கள்',
    },
  },

  // Auth
  auth: {
    login: {
      title: 'மீண்டும் வரவேற்கிறோம்',
      subtitle: 'உங்கள் பயணத்தைத் தொடர உள்நுழைக',
      email: 'மின்னஞ்சல் முகவரி',
      password: 'கடவுச்சொல்',
      forgotPassword: 'கடவுச்சொல்லை மறந்துவிட்டீர்களா?',
      signIn: 'உள்நுழைக',
      signingIn: 'உள்நுழைகிறது...',
      noAccount: 'கணக்கு இல்லையா?',
      signUp: 'பதிவு செய்யவும்',
      demoAccount: 'டெமோ கணக்கு',
      useDemo: 'டெமோ கணக்கைப் பயன்படுத்தவும்',
    },
    register: {
      title: 'TourismToolKit இல் சேரவும்',
      subtitle: 'நம்பமுடியாத இந்தியாவில் உங்கள் பயணத்தைத் தொடங்குங்கள்',
      fullName: 'முழுப் பெயர்',
      username: 'பயனர்பெயர்',
      email: 'மின்னஞ்சல் முகவரி',
      password: 'கடவுச்சொல்',
      confirmPassword: 'கடவுச்சொல்லை உறுதிப்படுத்தவும்',
      homeCountry: 'சொந்த நாடு',
      preferredLanguage: 'விருப்பமான மொழி',
      createAccount: 'கணக்கை உருவாக்கு',
      creatingAccount: 'கணக்கு உருவாக்கப்படுகிறது...',
      haveAccount: 'ஏற்கனவே கணக்கு உள்ளதா?',
      signIn: 'உள்நுழைக',
    },
  },

  // Dashboard
  dashboard: {
    title: 'பயண டாஷ்போர்டு',
    subtitle: 'உங்கள் தனிப்பயனாக்கப்பட்ட பயண துணை',
    welcome: 'மீண்டும் வரவேற்கிறோம்',
    loading: 'உங்கள் பயண டாஷ்போர்டு ஏற்றப்படுகிறது...',
    
    quickActions: {
      title: 'விரைவு செயல்கள்',
      translate: 'இப்போது மொழிபெயர்க்கவும்',
      findPlaces: 'இடங்களைக் கண்டறியவும்',
      learnWords: 'சொற்களைக் கற்றுக்கொள்ளவும்',
    },

    stats: {
      translations: 'மொழிபெயர்ப்புகள்',
      placesVisited: 'பார்வையிட்ட இடங்கள்',
      wordsLearned: 'கற்றுக்கொண்ட சொற்கள்',
      tripsPlanned: 'திட்டமிடப்பட்ட பயணங்கள்',
    },

    recentActivity: {
      title: 'சமீபத்திய செயல்பாடு',
      noActivity: 'சமீபத்திய செயல்பாடு இல்லை',
    },

    recommendedPlaces: {
      title: 'பரிந்துரைக்கப்பட்ட இடங்கள்',
      viewAll: 'அனைத்து இடங்களையும் காண்க',
    },
  },

  // Translator
  translator: {
    title: 'AI மொழிபெயர்ப்பாளர்',
    subtitle: 'பல இந்திய மொழிகளில் உடனடியாக மொழிபெயர்க்கவும்',
    
    tabs: {
      text: 'உரை',
      voice: 'குரல்',
      image: 'படம்',
    },

    textTranslation: {
      sourceLanguage: 'மூல மொழி',
      targetLanguage: 'இலக்கு மொழி',
      sourcePlaceholder: 'மொழிபெயர்க்க உரையை உள்ளிடவும்...',
      targetPlaceholder: 'மொழிபெயர்ப்பு இங்கே தோன்றும்...',
      translate: 'மொழிபெயர்',
      translating: 'மொழிபெயர்க்கிறது...',
      swap: 'மொழிகளை மாற்றவும்',
      clear: 'அழி',
      copy: 'நகலெடு',
      copied: 'நகலெடுக்கப்பட்டது!',
    },

    voiceTranslation: {
      startRecording: 'பதிவைத் தொடங்கு',
      stopRecording: 'பதிவை நிறுத்து',
      recording: 'பதிவு செய்கிறது...',
      processing: 'செயலாக்குகிறது...',
    },

    quickPhrases: {
      title: 'விரைவு சொற்றொடர்கள்',
      greetings: 'வணக்கம்',
      thanks: 'நன்றி',
      help: 'எனக்கு உதவி தேவை',
      directions: 'எங்கே உள்ளது...?',
    },
  },

  // Dictionary
  dictionary: {
    title: 'மொழி அகராதி',
    subtitle: 'மொழிகளில் சொற்கள் மற்றும் அவற்றின் அர்த்தங்களை ஆராயுங்கள்',
    searchPlaceholder: 'ஒரு சொல்லைத் தேடுங்கள்...',
    search: 'தேடு',
    noResults: 'முடிவுகள் எதுவும் இல்லை',
    pronunciation: 'உச்சரிப்பு',
    meaning: 'பொருள்',
    examples: 'எடுத்துக்காட்டுகள்',
    relatedWords: 'தொடர்புடைய சொற்கள்',
  },

  // Places
  places: {
    title: 'இடங்களைக் கண்டறியவும்',
    subtitle: 'இந்தியா முழுவதும் அற்புதமான இடங்களை ஆராயுங்கள்',
    searchPlaceholder: 'இடங்களைத் தேடுங்கள்...',
    filters: {
      all: 'அனைத்தும்',
      monuments: 'நினைவுச்சின்னங்கள்',
      temples: 'கோவில்கள்',
      nature: 'இயற்கை',
      food: 'உணவு',
      shopping: 'ஷாப்பிங்',
    },
    noPlaces: 'இடங்கள் எதுவும் இல்லை',
    viewDetails: 'விவரங்களைக் காண்க',
    getDirections: 'திசைகளைப் பெறுக',
    addToTrip: 'பயணத்தில் சேர்க்கவும்',
  },

  // Settings
  settings: {
    title: 'அமைப்புகள்',
    subtitle: 'உங்கள் விருப்பத்தேர்வுகளை நிர்வகிக்கவும்',
    
    account: {
      title: 'கணக்கு தகவல்',
      email: 'மின்னஞ்சல்',
      username: 'பயனர்பெயர்',
      fullName: 'முழுப் பெயர்',
    },

    preferences: {
      title: 'விருப்பத்தேர்வுகள்',
      language: 'மொழி',
      theme: 'தீம்',
      lightMode: 'ஒளி',
      darkMode: 'இருண்ட',
      systemMode: 'கணினி',
    },

    notifications: {
      title: 'அறிவிப்புகள்',
      email: 'மின்னஞ்சல் அறிவிப்புகள்',
      push: 'புஷ் அறிவிப்புகள்',
    },

    save: 'மாற்றங்களைச் சேமி',
    saving: 'சேமிக்கிறது...',
    saved: 'அமைப்புகள் வெற்றிகரமாகச் சேமிக்கப்பட்டன!',
  },
};
