// Hindi translations
import { TranslationKeys } from './en';

export const hi: TranslationKeys = {
  // Navigation
  nav: {
    home: 'होम',
    dashboard: 'डैशबोर्ड',
    translator: 'अनुवादक',
    dictionary: 'शब्दकोश',
    places: 'स्थान',
    settings: 'सेटिंग्स',
    login: 'लॉगिन',
    register: 'पंजीकरण',
    logout: 'लॉगआउट',
    backToHome: 'होम पर वापस जाएं',
    backToDashboard: 'डैशबोर्ड पर वापस जाएं',
  },

  // Common
  common: {
    welcome: 'स्वागत है',
    search: 'खोजें',
    save: 'सहेजें',
    cancel: 'रद्द करें',
    delete: 'हटाएं',
    edit: 'संपादित करें',
    loading: 'लोड हो रहा है',
    loadingSettings: 'सेटिंग्स लोड हो रही हैं...',
    error: 'त्रुटि',
    success: 'सफलता',
    confirm: 'पुष्टि करें',
    back: 'वापस',
    next: 'अगला',
    submit: 'जमा करें',
    close: 'बंद करें',
    select: 'चुनें',
    selectLanguage: 'भाषा चुनें',
    darkMode: 'डार्क मोड',
    lightMode: 'लाइट मोड',
  },

  // Home Page
  home: {
    title: 'आपका यात्रा साथी',
    subtitle: 'AI-संचालित अनुवाद, स्थानीय जानकारी और व्यक्तिगत सिफारिशों के साथ भाषा की बाधाओं को तोड़ें, छिपे हुए रत्नों की खोज करें, और भारत को पहले कभी नहीं जैसे एक्सप्लोर करें।',
    getStarted: 'मुफ्त में शुरू करें',
    signIn: 'साइन इन करें',
    poweredBy: 'TourismToolKit द्वारा संचालित',
    
    // Features
    features: {
      title: 'हर यात्री के लिए शक्तिशाली सुविधाएं',
      subtitle: 'रीयल-टाइम अनुवाद से लेकर स्थानीय खोज तक, हमारा टूलकिट आपको आत्मविश्वास से एक्सप्लोर करने के लिए सशक्त बनाता है',
      translation: {
        title: 'रीयल-टाइम अनुवाद',
        description: 'कई भारतीय भाषाओं में तुरंत टेक्स्ट, भाषण और छवियों का अनुवाद करें',
      },
      places: {
        title: 'स्थानीय स्थान खोज',
        description: 'छिपे हुए रत्न, लोकप्रिय आकर्षण और स्थानीय सिफारिशें खोजें',
      },
      dictionary: {
        title: 'भाषा शब्दकोश',
        description: 'उच्चारण गाइड और सांस्कृतिक संदर्भ के साथ व्यापक शब्दकोश',
      },
      guide: {
        title: 'स्मार्ट ट्रैवल गाइड',
        description: 'आपकी प्राथमिकताओं और स्थान के आधार पर व्यक्तिगत सिफारिशें',
      },
    },

    // Stats
    stats: {
      languages: 'समर्थित भाषाएं',
      places: 'कवर किए गए स्थान',
      translations: 'अनुवाद किए गए',
      travelers: 'खुश यात्री',
    },

    // CTA
    cta: {
      title: 'भारत का अन्वेषण करने के लिए तैयार हैं?',
      subtitle: 'हजारों यात्रियों में शामिल हों जो अपने भारतीय रोमांच के लिए TourismToolKit पर भरोसा करते हैं। आज ही अपनी यात्रा शुरू करें!',
      button: 'अपनी यात्रा शुरू करें',
    },
  },

  // Auth
  auth: {
    login: {
      title: 'वापसी पर स्वागत है',
      subtitle: 'अपनी यात्रा जारी रखने के लिए साइन इन करें',
      email: 'ईमेल पता',
      password: 'पासवर्ड',
      forgotPassword: 'अपना पासवर्ड भूल गए?',
      signIn: 'साइन इन करें',
      signingIn: 'साइन इन हो रहा है...',
      noAccount: 'खाता नहीं है?',
      signUp: 'साइन अप करें',
      demoAccount: 'डेमो अकाउंट',
      useDemo: 'डेमो अकाउंट उपयोग करें',
    },
    register: {
      title: 'TourismToolKit में शामिल हों',
      subtitle: 'अविश्वसनीय भारत में अपनी यात्रा शुरू करें',
      fullName: 'पूरा नाम',
      username: 'उपयोगकर्ता नाम',
      email: 'ईमेल पता',
      password: 'पासवर्ड',
      confirmPassword: 'पासवर्ड की पुष्टि करें',
      homeCountry: 'गृह देश',
      preferredLanguage: 'पसंदीदा भाषा',
      createAccount: 'खाता बनाएं',
      creatingAccount: 'खाता बनाया जा रहा है...',
      haveAccount: 'पहले से खाता है?',
      signIn: 'साइन इन करें',
    },
  },

  // Dashboard
  dashboard: {
    title: 'यात्रा डैशबोर्ड',
    subtitle: 'आपका व्यक्तिगत यात्रा साथी',
    welcome: 'वापसी पर स्वागत है',
    loading: 'आपका यात्रा डैशबोर्ड लोड हो रहा है...',
    
    quickActions: {
      title: 'त्वरित कार्य',
      translate: 'अभी अनुवाद करें',
      findPlaces: 'स्थान खोजें',
      learnWords: 'शब्द सीखें',
    },

    stats: {
      translations: 'अनुवाद',
      placesVisited: 'देखे गए स्थान',
      wordsLearned: 'सीखे गए शब्द',
      tripsPlanned: 'नियोजित यात्राएं',
    },

    recentActivity: {
      title: 'हाल की गतिविधि',
      noActivity: 'कोई हाल की गतिविधि नहीं',
    },

    recommendedPlaces: {
      title: 'अनुशंसित स्थान',
      viewAll: 'सभी स्थान देखें',
    },
  },

  // Translator
  translator: {
    title: 'AI अनुवादक',
    subtitle: 'कई भारतीय भाषाओं में तुरंत अनुवाद करें',
    
    tabs: {
      text: 'टेक्स्ट',
      voice: 'आवाज़',
      image: 'छवि',
    },

    textTranslation: {
      sourceLanguage: 'स्रोत भाषा',
      targetLanguage: 'लक्ष्य भाषा',
      sourcePlaceholder: 'अनुवाद करने के लिए टेक्स्ट दर्ज करें...',
      targetPlaceholder: 'अनुवाद यहां दिखाई देगा...',
      translate: 'अनुवाद करें',
      translating: 'अनुवाद हो रहा है...',
      swap: 'भाषाएं बदलें',
      clear: 'साफ़ करें',
      copy: 'कॉपी करें',
      copied: 'कॉपी हो गया!',
    },

    voiceTranslation: {
      startRecording: 'रिकॉर्डिंग शुरू करें',
      stopRecording: 'रिकॉर्डिंग बंद करें',
      recording: 'रिकॉर्डिंग हो रही है...',
      processing: 'प्रोसेसिंग हो रही है...',
    },

    quickPhrases: {
      title: 'त्वरित वाक्यांश',
      greetings: 'नमस्ते',
      thanks: 'धन्यवाद',
      help: 'मुझे मदद चाहिए',
      directions: 'कहां है...?',
    },
  },

  // Dictionary
  dictionary: {
    title: 'भाषा शब्दकोश',
    subtitle: 'भाषाओं में शब्दों और उनके अर्थों का अन्वेषण करें',
    searchPlaceholder: 'एक शब्द खोजें...',
    search: 'खोजें',
    noResults: 'कोई परिणाम नहीं मिला',
    pronunciation: 'उच्चारण',
    meaning: 'अर्थ',
    examples: 'उदाहरण',
    relatedWords: 'संबंधित शब्द',
  },

  // Places
  places: {
    title: 'स्थानों की खोज करें',
    subtitle: 'भारत भर में अद्भुत गंतव्यों का अन्वेषण करें',
    searchPlaceholder: 'स्थान खोजें...',
    filters: {
      all: 'सभी',
      monuments: 'स्मारक',
      temples: 'मंदिर',
      nature: 'प्रकृति',
      food: 'भोजन',
      shopping: 'खरीदारी',
    },
    noPlaces: 'कोई स्थान नहीं मिला',
    viewDetails: 'विवरण देखें',
    getDirections: 'दिशा-निर्देश प्राप्त करें',
    addToTrip: 'यात्रा में जोड़ें',
  },

  // Settings
  settings: {
    title: 'सेटिंग्स',
    subtitle: 'अपनी प्राथमिकताएं प्रबंधित करें',
    
    account: {
      title: 'खाता जानकारी',
      email: 'ईमेल',
      username: 'उपयोगकर्ता नाम',
      fullName: 'पूरा नाम',
    },

    preferences: {
      title: 'प्राथमिकताएं',
      language: 'भाषा',
      theme: 'थीम',
      lightMode: 'लाइट',
      darkMode: 'डार्क',
      systemMode: 'सिस्टम',
    },

    notifications: {
      title: 'सूचनाएं',
      email: 'ईमेल सूचनाएं',
      push: 'पुश सूचनाएं',
    },

    save: 'परिवर्तन सहेजें',
    saving: 'सहेजा जा रहा है...',
    saved: 'सेटिंग्स सफलतापूर्वक सहेजी गईं!',
  },
};
