'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from '@apollo/client';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Volume2,
  Edit,
  Trash2,
  Heart,
  Languages,
  Sparkles,
  X
} from 'lucide-react';
import Link from 'next/link';
import { 
  GET_DICTIONARY_ENTRIES,
  ADD_DICTIONARY_ENTRY,
  UPDATE_DICTIONARY_ENTRY,
  DELETE_DICTIONARY_ENTRY,
  TOGGLE_FAVORITE_ENTRY,
  TRANSLATE_TEXT_MUTATION,
  GENERATE_SPEECH_MUTATION,
  GET_SUPPORTED_LANGUAGES
} from '@/graphql/queries';
import toast from 'react-hot-toast';
import { useAuth } from '@/providers/AuthProvider';

interface DictionaryEntry {
  id: string;
  word: string;
  translation: string;
  languageFrom: string;
  languageTo: string;
  pronunciation?: string;
  usageExample?: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
}

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

export default function Dictionary() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [languageFrom, setLanguageFrom] = useState('');
  const [languageTo, setLanguageTo] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DictionaryEntry | null>(null);
  const [filter, setFilter] = useState<'all' | 'favorites' | 'personal'>('all');
  const [useTranslate, setUseTranslate] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  
  const [newEntry, setNewEntry] = useState({
    word: '',
    translation: '',
    languageFrom: 'en',
    languageTo: 'hi',
    pronunciation: '',
    usageExample: '',
    tags: [] as string[],
    isFavorite: false
  });

  const { data: languagesData } = useQuery(GET_SUPPORTED_LANGUAGES);
  
  // Fetch public/common dictionary (system entries)
  const { data: publicDictionaryData, refetch: refetchPublic } = useQuery(GET_DICTIONARY_ENTRIES, {
    variables: { 
      languageFrom: languageFrom || undefined,
      languageTo: languageTo || undefined,
      searchWord: searchTerm || undefined,
      userId: undefined, // No userId means public entries
      isFavorite: filter === 'favorites' ? true : undefined,
      limit: 100
    },
    fetchPolicy: 'network-only'
  });

  // Fetch personal dictionary (user's entries)
  const { data: personalDictionaryData, refetch: refetchPersonal } = useQuery(GET_DICTIONARY_ENTRIES, {
    variables: { 
      languageFrom: languageFrom || undefined,
      languageTo: languageTo || undefined,
      searchWord: searchTerm || undefined,
      userId: user?.id,
      isFavorite: filter === 'favorites' ? true : undefined,
      limit: 100
    },
    skip: !user,
    fetchPolicy: 'network-only'
  });

  const [addDictionaryEntry] = useMutation(ADD_DICTIONARY_ENTRY);
  const [updateDictionaryEntry] = useMutation(UPDATE_DICTIONARY_ENTRY);
  const [deleteDictionaryEntry] = useMutation(DELETE_DICTIONARY_ENTRY);
  const [toggleFavorite] = useMutation(TOGGLE_FAVORITE_ENTRY);
  const [translateText] = useMutation(TRANSLATE_TEXT_MUTATION);
  const [generateSpeech] = useMutation(GENERATE_SPEECH_MUTATION);

  const refetch = () => {
    refetchPublic();
    refetchPersonal();
  };

  const languages = languagesData?.getSupportedLanguages?.languages || [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
    { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
    { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া' },
    { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' }
  ];

  const publicEntries = publicDictionaryData?.getDictionaryEntries || [];
  const personalEntries = personalDictionaryData?.getDictionaryEntries || [];
  
  // Filter based on selected filter
  const displayPublicEntries = filter === 'personal' ? [] : publicEntries;
  const displayPersonalEntries = filter === 'all' || filter === 'personal' ? personalEntries : [];
  
  const totalEntries = [...displayPublicEntries, ...displayPersonalEntries];
  const favoriteCount = totalEntries.filter((e: DictionaryEntry) => e.isFavorite).length;

  const handleTranslateWord = async () => {
    if (!newEntry.word) {
      toast.error('Please enter a word to translate');
      return;
    }

    setIsTranslating(true);
    try {
      const { data } = await translateText({
        variables: {
          input: {
            text: newEntry.word,
            sourceLang: newEntry.languageFrom,
            targetLang: newEntry.languageTo
          }
        }
      });

      if (data?.translateText?.success) {
        setNewEntry({
          ...newEntry,
          translation: data.translateText.translatedText
        });
        toast.success('Translation generated!');
      } else {
        toast.error('Translation failed');
      }
    } catch (error) {
      toast.error('Failed to translate');
      console.error('Translation error:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSpeak = async (text: string) => {
    if (!text.trim()) {
      toast.error('No text to speak');
      return;
    }

    try {
      const { data } = await generateSpeech({
        variables: {
          input: {
            text: text,
            gender: 'female'
          }
        }
      });

      if (data?.generateSpeech?.success && data.generateSpeech.audioContent) {
        const audio = new Audio(data.generateSpeech.audioContent);
        audio.play();
        toast.success('Playing audio');
      } else {
        toast.error(data?.generateSpeech?.message || 'Failed to generate speech');
      }
    } catch (error) {
      toast.error('Failed to play audio');
      console.error('TTS error:', error);
    }
  };

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to add dictionary entries');
      return;
    }

    try {
      const { data } = await addDictionaryEntry({
        variables: {
          userId: user.id,
          input: {
            word: newEntry.word,
            translation: newEntry.translation,
            languageFrom: newEntry.languageFrom,
            languageTo: newEntry.languageTo,
            pronunciation: newEntry.pronunciation || null,
            usageExample: newEntry.usageExample || null,
            tags: newEntry.tags.length > 0 ? newEntry.tags : null,
            isFavorite: newEntry.isFavorite
          }
        }
      });

      if (data?.addDictionaryEntry?.success) {
        toast.success('Dictionary entry added!');
        setShowAddModal(false);
        setNewEntry({
          word: '',
          translation: '',
          languageFrom: 'en',
          languageTo: 'hi',
          pronunciation: '',
          usageExample: '',
          tags: [],
          isFavorite: false
        });
        setUseTranslate(false);
        refetch();
      } else {
        toast.error(data?.addDictionaryEntry?.message || 'Failed to add entry');
      }
    } catch (error) {
      toast.error('Failed to add dictionary entry');
      console.error('Add entry error:', error);
    }
  };

  const handleEditEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !editingEntry) return;

    try {
      const { data } = await updateDictionaryEntry({
        variables: {
          entryId: parseInt(editingEntry.id),
          userId: user.id,
          input: {
            word: editingEntry.word,
            translation: editingEntry.translation,
            languageFrom: editingEntry.languageFrom,
            languageTo: editingEntry.languageTo,
            pronunciation: editingEntry.pronunciation || null,
            usageExample: editingEntry.usageExample || null,
            tags: editingEntry.tags?.length > 0 ? editingEntry.tags : null,
            isFavorite: editingEntry.isFavorite
          }
        }
      });

      if (data?.updateDictionaryEntry?.success) {
        toast.success('Entry updated!');
        setShowEditModal(false);
        setEditingEntry(null);
        refetch();
      } else {
        toast.error(data?.updateDictionaryEntry?.message || 'Failed to update entry');
      }
    } catch (error) {
      toast.error('Failed to update entry');
      console.error('Update entry error:', error);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!user) return;
    
    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
      const { data } = await deleteDictionaryEntry({
        variables: {
          entryId: parseInt(entryId),
          userId: user.id
        }
      });

      if (data?.deleteDictionaryEntry?.success) {
        toast.success('Entry deleted!');
        refetch();
      } else {
        toast.error(data?.deleteDictionaryEntry?.message || 'Failed to delete entry');
      }
    } catch (error) {
      toast.error('Failed to delete entry');
      console.error('Delete entry error:', error);
    }
  };

  const handleToggleFavorite = async (entryId: string) => {
    if (!user) {
      toast.error('Please login to add favorites');
      return;
    }

    try {
      // Find the entry to determine if it's public or personal
      const entry = totalEntries.find((e: DictionaryEntry) => e.id === entryId);
      
      if (!entry) {
        toast.error('Entry not found');
        return;
      }

      // Check if this is a personal entry (user's own entry)
      const isPersonalEntry = personalEntries.some((e: DictionaryEntry) => e.id === entryId);

      if (isPersonalEntry) {
        // Toggle favorite for user's own entry
        const { data } = await toggleFavorite({
          variables: {
            entryId: parseInt(entryId),
            userId: user.id
          }
        });

        if (data?.toggleFavoriteEntry?.success) {
          toast.success(entry.isFavorite ? 'Removed from favorites' : 'Added to favorites!');
          refetch();
        } else {
          toast.error(data?.toggleFavoriteEntry?.message || 'Failed to update favorite');
        }
      } else {
        // For public entries, check if already in personal dictionary
        const existingPersonalEntry = personalEntries.find(
          (e: DictionaryEntry) => 
            e.word.toLowerCase() === entry.word.toLowerCase() &&
            e.languageFrom === entry.languageFrom &&
            e.languageTo === entry.languageTo
        );

        if (existingPersonalEntry) {
          // If already exists in personal dictionary, toggle its favorite status
          const { data } = await toggleFavorite({
            variables: {
              entryId: parseInt(existingPersonalEntry.id),
              userId: user.id
            }
          });

          if (data?.toggleFavoriteEntry?.success) {
            toast.success(existingPersonalEntry.isFavorite ? 'Removed from favorites' : 'Added to favorites!');
            refetch();
          } else {
            toast.error(data?.toggleFavoriteEntry?.message || 'Failed to update favorite');
          }
        } else {
          // Add new entry to personal dictionary with favorite=true
          const { data } = await addDictionaryEntry({
            variables: {
              userId: user.id,
              input: {
                word: entry.word,
                translation: entry.translation,
                languageFrom: entry.languageFrom,
                languageTo: entry.languageTo,
                pronunciation: entry.pronunciation || '',
                usageExample: entry.usageExample || '',
                tags: entry.tags || [],
                isFavorite: true
              }
            }
          });

          if (data?.addDictionaryEntry?.success) {
            toast.success('Added to your personal favorites!');
            refetch();
          } else {
            toast.error(data?.addDictionaryEntry?.message || 'Failed to add to favorites');
          }
        }
      }
    } catch (error) {
      toast.error('Failed to update favorite');
      console.error('Toggle favorite error:', error);
    }
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>, isEdit = false) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = (e.target as HTMLInputElement).value.trim();
      
      if (isEdit && editingEntry) {
        if (tag && !editingEntry.tags?.includes(tag)) {
          setEditingEntry({
            ...editingEntry,
            tags: [...(editingEntry.tags || []), tag]
          });
          (e.target as HTMLInputElement).value = '';
        }
      } else {
        if (tag && !newEntry.tags.includes(tag)) {
          setNewEntry({
            ...newEntry,
            tags: [...newEntry.tags, tag]
          });
          (e.target as HTMLInputElement).value = '';
        }
      }
    }
  };

  const removeTag = (tagToRemove: string, isEdit = false) => {
    if (isEdit && editingEntry) {
      setEditingEntry({
        ...editingEntry,
        tags: editingEntry.tags?.filter(tag => tag !== tagToRemove) || []
      });
    } else {
      setNewEntry({
        ...newEntry,
        tags: newEntry.tags.filter(tag => tag !== tagToRemove)
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/dashboard"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to Dashboard
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-foreground flex items-center">
              <BookOpen className="w-8 h-8 mr-3 text-primary" />
              My Dictionary
            </h1>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-primary to-secondary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-shadow flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Word
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl shadow-lg p-6 mb-8 border border-border"
        >
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="text"
                placeholder="Search words or translations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent placeholder:text-muted-foreground"
              />
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              {/* Language From Filter */}
              <select
                value={languageFrom}
                onChange={(e) => setLanguageFrom(e.target.value)}
                className="flex-1 px-4 py-3 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring"
              >
                <option value="">All Source Languages</option>
                {languages.map((lang: Language) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name} ({lang.nativeName})
                  </option>
                ))}
              </select>

              {/* Language To Filter */}
              <select
                value={languageTo}
                onChange={(e) => setLanguageTo(e.target.value)}
                className="flex-1 px-4 py-3 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring"
              >
                <option value="">All Target Languages</option>
                {languages.map((lang: Language) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name} ({lang.nativeName})
                  </option>
                ))}
              </select>

              {/* Filter */}
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'favorites' | 'personal')}
                className="flex-1 px-4 py-3 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Entries</option>
                <option value="favorites">Favorites</option>
                <option value="personal">My Dictionary</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Words</p>
                <p className="text-2xl font-bold text-foreground">{totalEntries.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-primary opacity-50" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-destructive/10 to-destructive/5 rounded-xl p-4 border border-destructive/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Favorites</p>
                <p className="text-2xl font-bold text-foreground">
                  {favoriteCount}
                </p>
              </div>
              <Heart className="w-8 h-8 text-destructive opacity-50 fill-current" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-xl p-4 border border-secondary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Languages</p>
                <p className="text-2xl font-bold text-foreground">{languages.length}</p>
              </div>
              <Languages className="w-8 h-8 text-secondary opacity-50" />
            </div>
          </div>
        </motion.div>

        {/* Dictionary Entries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-8"
        >
          {/* Public/Common Dictionary Section */}
          {displayPublicEntries.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">Common Dictionary</h2>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  {displayPublicEntries.length} words
                </span>
              </div>
              <div className="grid gap-4">
                {displayPublicEntries.map((entry: DictionaryEntry, index: number) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-card rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-border"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          <div>
                            <h3 className="text-xl font-semibold text-foreground">
                              {entry.word}
                            </h3>
                            {entry.pronunciation && (
                              <p className="text-sm text-muted-foreground">
                                /{entry.pronunciation}/
                              </p>
                            )}
                          </div>
                          <div className="text-2xl text-muted-foreground">→</div>
                          <div>
                            <h3 className="text-xl font-semibold text-primary">
                              {entry.translation}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {languages.find((l: Language) => l.code === entry.languageFrom)?.name} → {' '}
                              {languages.find((l: Language) => l.code === entry.languageTo)?.name}
                            </p>
                          </div>
                        </div>

                        {entry.usageExample && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-foreground mb-1">
                              Example:
                            </p>
                            <p className="text-muted-foreground italic">
                              &ldquo;{entry.usageExample}&rdquo;
                            </p>
                          </div>
                        )}

                        {entry.tags && entry.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {entry.tags.map((tag: string, tagIndex: number) => (
                              <span
                                key={tagIndex}
                                className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <p className="text-xs text-muted-foreground">
                          Added {new Date(entry.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <button
                          onClick={() => handleToggleFavorite(entry.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            entry.isFavorite
                              ? 'text-red-500 bg-red-500/10'
                              : 'text-muted-foreground hover:text-red-500 hover:bg-red-500/10'
                          }`}
                        >
                          <Heart className={`w-5 h-5 ${entry.isFavorite ? 'fill-red-500' : ''}`} />
                        </button>
                        <button 
                          onClick={() => handleSpeak(entry.word)}
                          className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        >
                          <Volume2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Personal Dictionary Section */}
          {displayPersonalEntries.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-secondary" />
                <h2 className="text-xl font-bold text-foreground">My Personal Dictionary</h2>
                <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm font-medium">
                  {displayPersonalEntries.length} words
                </span>
              </div>
              <div className="grid gap-4">
                {displayPersonalEntries.map((entry: DictionaryEntry, index: number) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-card rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border-2 border-secondary/20"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          <div>
                            <h3 className="text-xl font-semibold text-foreground">
                              {entry.word}
                            </h3>
                            {entry.pronunciation && (
                              <p className="text-sm text-muted-foreground">
                                /{entry.pronunciation}/
                              </p>
                            )}
                          </div>
                          <div className="text-2xl text-muted-foreground">→</div>
                          <div>
                            <h3 className="text-xl font-semibold text-secondary">
                              {entry.translation}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {languages.find((l: Language) => l.code === entry.languageFrom)?.name} → {' '}
                              {languages.find((l: Language) => l.code === entry.languageTo)?.name}
                            </p>
                          </div>
                        </div>

                        {entry.usageExample && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-foreground mb-1">
                              Example:
                            </p>
                            <p className="text-muted-foreground italic">
                              &ldquo;{entry.usageExample}&rdquo;
                            </p>
                          </div>
                        )}

                        {entry.tags && entry.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {entry.tags.map((tag: string, tagIndex: number) => (
                              <span
                                key={tagIndex}
                                className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-xs font-medium"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <p className="text-xs text-muted-foreground">
                          Added {new Date(entry.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <button
                          onClick={() => handleToggleFavorite(entry.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            entry.isFavorite
                              ? 'text-red-500 bg-red-500/10'
                              : 'text-muted-foreground hover:text-red-500 hover:bg-red-500/10'
                          }`}
                        >
                          <Heart className={`w-5 h-5 ${entry.isFavorite ? 'fill-red-500' : ''}`} />
                        </button>
                        <button 
                          onClick={() => handleSpeak(entry.word)}
                          className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        >
                          <Volume2 className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => {
                            setEditingEntry(entry);
                            setShowEditModal(true);
                          }}
                          className="p-2 rounded-lg text-muted-foreground hover:text-secondary hover:bg-secondary/10 transition-colors"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {totalEntries.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium text-foreground mb-2">
                No dictionary entries found
              </h3>
              <p className="text-muted-foreground mb-4">
                Start building your vocabulary by adding new words and phrases
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-primary to-secondary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-shadow"
              >
                Add Your First Word
              </button>
            </div>
          )}
        </motion.div>
      </main>

      {/* Add Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-background/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card backdrop-blur-sm rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border-2 border-border"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">
                  Add New Word
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setUseTranslate(false);
                    setNewEntry({
                      word: '',
                      translation: '',
                      languageFrom: 'en',
                      languageTo: 'hi',
                      pronunciation: '',
                      usageExample: '',
                      tags: [],
                      isFavorite: false
                    });
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddEntry} className="space-y-4">
                {/* Translation Mode Toggle */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
                  <span className="text-sm font-medium text-foreground">Use Auto-Translate</span>
                  <button
                    type="button"
                    onClick={() => setUseTranslate(!useTranslate)}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                      useTranslate 
                        ? 'bg-primary' 
                        : 'bg-muted-foreground'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-card shadow-lg border-2 border-background transition-transform ${
                        useTranslate 
                          ? 'translate-x-6' 
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Word
                    </label>
                    <input
                      type="text"
                      required
                      value={newEntry.word}
                      onChange={(e) => setNewEntry({ ...newEntry, word: e.target.value })}
                      className="w-full p-3 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                      placeholder="Enter word"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Translation
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={newEntry.translation}
                        onChange={(e) => setNewEntry({ ...newEntry, translation: e.target.value })}
                        className="w-full p-3 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                        placeholder={useTranslate ? "Auto-filled" : "Enter translation"}
                        disabled={useTranslate && !newEntry.translation}
                      />
                      {useTranslate && (
                        <button
                          type="button"
                          onClick={handleTranslateWord}
                          disabled={isTranslating || !newEntry.word}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50"
                        >
                          <Sparkles className={`w-4 h-4 ${isTranslating ? 'animate-spin' : ''}`} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      From Language
                    </label>
                    <select
                      value={newEntry.languageFrom}
                      onChange={(e) => setNewEntry({ ...newEntry, languageFrom: e.target.value })}
                      className="w-full p-3 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring"
                    >
                      {languages.map((lang: Language) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      To Language
                    </label>
                    <select
                      value={newEntry.languageTo}
                      onChange={(e) => setNewEntry({ ...newEntry, languageTo: e.target.value })}
                      className="w-full p-3 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring"
                    >
                      {languages.map((lang: Language) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Pronunciation (Optional)
                  </label>
                  <input
                    type="text"
                    value={newEntry.pronunciation}
                    onChange={(e) => setNewEntry({ ...newEntry, pronunciation: e.target.value })}
                    className="w-full p-3 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                    placeholder="e.g., nah-mas-tay"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Usage Example (Optional)
                  </label>
                  <textarea
                    value={newEntry.usageExample}
                    onChange={(e) => setNewEntry({ ...newEntry, usageExample: e.target.value })}
                    className="w-full p-3 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring resize-none placeholder:text-muted-foreground"
                    rows={2}
                    placeholder="Example sentence using this word..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Tags (Optional)
                  </label>
                  <input
                    type="text"
                    onKeyDown={handleTagInput}
                    className="w-full p-3 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                    placeholder="Press Enter to add tags..."
                  />
                  {newEntry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {newEntry.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-2 text-primary hover:text-primary/80"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="favorite"
                    checked={newEntry.isFavorite}
                    onChange={(e) => setNewEntry({ ...newEntry, isFavorite: e.target.checked })}
                    className="rounded border-input text-primary focus:ring-ring"
                  />
                  <label htmlFor="favorite" className="ml-2 text-sm text-foreground">
                    Mark as favorite
                  </label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setUseTranslate(false);
                      setNewEntry({
                        word: '',
                        translation: '',
                        languageFrom: 'en',
                        languageTo: 'hi',
                        pronunciation: '',
                        usageExample: '',
                        tags: [],
                        isFavorite: false
                      });
                    }}
                    className="flex-1 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Add Word
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Entry Modal */}
      {showEditModal && editingEntry && (
        <div className="fixed inset-0 bg-background/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card backdrop-blur-sm rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border-2 border-border"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">
                  Edit Word
                </h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingEntry(null);
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditEntry} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Word
                    </label>
                    <input
                      type="text"
                      required
                      value={editingEntry.word}
                      onChange={(e) => setEditingEntry({ ...editingEntry, word: e.target.value })}
                      className="w-full p-3 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Translation
                    </label>
                    <input
                      type="text"
                      required
                      value={editingEntry.translation}
                      onChange={(e) => setEditingEntry({ ...editingEntry, translation: e.target.value })}
                      className="w-full p-3 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      From Language
                    </label>
                    <select
                      value={editingEntry.languageFrom}
                      onChange={(e) => setEditingEntry({ ...editingEntry, languageFrom: e.target.value })}
                      className="w-full p-3 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring"
                    >
                      {languages.map((lang: Language) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      To Language
                    </label>
                    <select
                      value={editingEntry.languageTo}
                      onChange={(e) => setEditingEntry({ ...editingEntry, languageTo: e.target.value })}
                      className="w-full p-3 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring"
                    >
                      {languages.map((lang: Language) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Pronunciation (Optional)
                  </label>
                  <input
                    type="text"
                    value={editingEntry.pronunciation || ''}
                    onChange={(e) => setEditingEntry({ ...editingEntry, pronunciation: e.target.value })}
                    className="w-full p-3 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Usage Example (Optional)
                  </label>
                  <textarea
                    value={editingEntry.usageExample || ''}
                    onChange={(e) => setEditingEntry({ ...editingEntry, usageExample: e.target.value })}
                    className="w-full p-3 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring resize-none"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Tags (Optional)
                  </label>
                  <input
                    type="text"
                    onKeyDown={(e) => handleTagInput(e, true)}
                    className="w-full p-3 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring"
                    placeholder="Press Enter to add tags..."
                  />
                  {editingEntry.tags && editingEntry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {editingEntry.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag, true)}
                            className="ml-2 text-primary hover:text-primary/80"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="edit-favorite"
                    checked={editingEntry.isFavorite}
                    onChange={(e) => setEditingEntry({ ...editingEntry, isFavorite: e.target.checked })}
                    className="rounded border-input text-primary focus:ring-ring"
                  />
                  <label htmlFor="edit-favorite" className="ml-2 text-sm text-foreground">
                    Mark as favorite
                  </label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingEntry(null);
                    }}
                    className="flex-1 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Update Word
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}