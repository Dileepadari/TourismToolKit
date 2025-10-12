'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from '@apollo/client';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Volume2,
  Edit,
  Trash2,
  Heart
} from 'lucide-react';
import Link from 'next/link';
import { 
  GET_USER_DICTIONARY, 
  ADD_DICTIONARY_ENTRY_MUTATION,
  GET_SUPPORTED_LANGUAGES
} from '@/graphql/queries';
import toast from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  name?: string;
}

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
  const [user, setUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'favorites' | 'recent'>('all');
  
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

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const { data: languagesData } = useQuery(GET_SUPPORTED_LANGUAGES);
  const { data: dictionaryData, refetch } = useQuery(GET_USER_DICTIONARY, {
    variables: { 
      userId: user?.id || 1,
      languageFrom: selectedLanguage === 'all' ? null : selectedLanguage 
    },
    skip: !user
  });

  const [addDictionaryEntry] = useMutation(ADD_DICTIONARY_ENTRY_MUTATION);

  const languages = languagesData?.getSupportedLanguages?.languages || [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'te', name: 'Telugu' },
    { code: 'ta', name: 'Tamil' }
  ];

  const dictionaryEntries = dictionaryData?.getUserDictionary || [];

  const filteredEntries = dictionaryEntries.filter((entry: DictionaryEntry) => {
    const matchesSearch = entry.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.translation.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || 
                         (filter === 'favorites' && entry.isFavorite) ||
                         (filter === 'recent' && new Date(entry.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    
    return matchesSearch && matchesFilter;
  });

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data } = await addDictionaryEntry({
        variables: {
          userId: user?.id || 1,
          input: {
            ...newEntry,
            tags: newEntry.tags.length > 0 ? newEntry.tags : null
          }
        }
      });

      if (data.addDictionaryEntry) {
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
        refetch();
      }
    } catch (error) {
      toast.error('Failed to add dictionary entry');
      console.error('Add entry error:', error);
    }
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = (e.target as HTMLInputElement).value.trim();
      if (tag && !newEntry.tags.includes(tag)) {
        setNewEntry({
          ...newEntry,
          tags: [...newEntry.tags, tag]
        });
        (e.target as HTMLInputElement).value = '';
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewEntry({
      ...newEntry,
      tags: newEntry.tags.filter(tag => tag !== tagToRemove)
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-saffron-50 via-white to-heritage-50 dark:from-gray-900 dark:via-gray-800 dark:to-saffron-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                ← Back to Dashboard
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <BookOpen className="w-8 h-8 mr-3 text-saffron-600 dark:text-saffron-400" />
              My Dictionary
            </h1>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-saffron-500 to-heritage-500 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-shadow flex items-center"
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
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search words or translations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Language Filter */}
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Languages</option>
              {languages.map((lang: Language) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>

            {/* Filter */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'favorites' | 'recent')}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Entries</option>
              <option value="favorites">Favorites</option>
              <option value="recent">Recent (7 days)</option>
            </select>
          </div>
        </motion.div>

        {/* Dictionary Entries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-4"
        >
          {filteredEntries.length > 0 ? (
            filteredEntries.map((entry: DictionaryEntry, index: number) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {entry.word}
                        </h3>
                        {entry.pronunciation && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            /{entry.pronunciation}/
                          </p>
                        )}
                      </div>
                      <div className="text-2xl">→</div>
                      <div>
                        <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                          {entry.translation}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {languages.find((l: Language) => l.code === entry.languageFrom)?.name} → {' '}
                          {languages.find((l: Language) => l.code === entry.languageTo)?.name}
                        </p>
                      </div>
                    </div>

                    {entry.usageExample && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Example:
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 italic">
                          &ldquo;{entry.usageExample}&rdquo;
                        </p>
                      </div>
                    )}

                    {entry.tags && entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {entry.tags.map((tag: string, tagIndex: number) => (
                          <span
                            key={tagIndex}
                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Added {new Date(entry.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    <button
                      className={`p-2 rounded-lg transition-colors ${
                        entry.isFavorite
                          ? 'text-red-500 bg-red-50 dark:bg-red-900/30'
                          : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${entry.isFavorite ? 'fill-current' : ''}`} />
                    </button>
                    <button className="p-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                      <Volume2 className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded-lg text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors">
                      <Edit className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                No dictionary entries found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Start building your vocabulary by adding new words and phrases
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-shadow"
              >
                Add Your First Word
              </button>
            </div>
          )}
        </motion.div>
      </main>

      {/* Add Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Add New Word
              </h2>

              <form onSubmit={handleAddEntry} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Word
                    </label>
                    <input
                      type="text"
                      required
                      value={newEntry.word}
                      onChange={(e) => setNewEntry({ ...newEntry, word: e.target.value })}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter word"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Translation
                    </label>
                    <input
                      type="text"
                      required
                      value={newEntry.translation}
                      onChange={(e) => setNewEntry({ ...newEntry, translation: e.target.value })}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter translation"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      From Language
                    </label>
                    <select
                      value={newEntry.languageFrom}
                      onChange={(e) => setNewEntry({ ...newEntry, languageFrom: e.target.value })}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      {languages.map((lang: Language) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      To Language
                    </label>
                    <select
                      value={newEntry.languageTo}
                      onChange={(e) => setNewEntry({ ...newEntry, languageTo: e.target.value })}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Pronunciation (Optional)
                  </label>
                  <input
                    type="text"
                    value={newEntry.pronunciation}
                    onChange={(e) => setNewEntry({ ...newEntry, pronunciation: e.target.value })}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., nah-mas-tay"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Usage Example (Optional)
                  </label>
                  <textarea
                    value={newEntry.usageExample}
                    onChange={(e) => setNewEntry({ ...newEntry, usageExample: e.target.value })}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={2}
                    placeholder="Example sentence using this word..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tags (Optional)
                  </label>
                  <input
                    type="text"
                    onKeyDown={handleTagInput}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Press Enter to add tags..."
                  />
                  {newEntry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {newEntry.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm flex items-center"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
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
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="favorite" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Mark as favorite
                  </label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
                  >
                    Add Word
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