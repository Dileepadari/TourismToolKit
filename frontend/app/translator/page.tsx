'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQuery } from '@apollo/client';
import { 
  Languages, 
  Camera, 
  Mic, 
  Volume2, 
  ArrowLeftRight,
  Copy,
  Upload,
  MicOff,
  Loader
} from 'lucide-react';
import Link from 'next/link';
import { 
  TRANSLATE_TEXT_MUTATION, 
  GENERATE_SPEECH_MUTATION,
  EXTRACT_TEXT_FROM_IMAGE_MUTATION,
  TRANSCRIBE_AUDIO_MUTATION,
  GET_SUPPORTED_LANGUAGES 
} from '@/graphql/queries';
import toast from 'react-hot-toast';
import { Language } from '@/utils/types';

export default function Translator() {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('hi');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'text' | 'voice' | 'image'>('text');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const { data: languagesData } = useQuery(GET_SUPPORTED_LANGUAGES);
  const [translateText] = useMutation(TRANSLATE_TEXT_MUTATION);
  const [generateSpeech] = useMutation(GENERATE_SPEECH_MUTATION);
  const [extractTextFromImage] = useMutation(EXTRACT_TEXT_FROM_IMAGE_MUTATION);
  const [transcribeAudio] = useMutation(TRANSCRIBE_AUDIO_MUTATION);

  const languages = languagesData?.getSupportedLanguages?.languages || [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'te', name: 'Telugu' },
    { code: 'ta', name: 'Tamil' }
  ];

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      toast.error('Please enter text to translate');
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await translateText({
        variables: {
          text: sourceText,
          sourceLang,
          targetLang
        }
      });

      if (data.translateText.success) {
        setTranslatedText(data.translateText.translatedText);
        toast.success('Translation completed!');
      } else {
        toast.error(data.translateText.error || 'Translation failed');
      }
    } catch (error) {
      toast.error('Translation service unavailable');
      console.error('Translation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = async (text: string, language: string) => {
    try {
      const { data } = await generateSpeech({
        variables: {
          text,
          gender: 'female',
          language
        }
      });

      if (data.generateSpeech.success && data.generateSpeech.audioUrl) {
        const audio = new Audio(data.generateSpeech.audioUrl);
        audio.play();
        toast.success('Playing audio...');
      } else {
        toast.error('Audio generation failed');
      }
    } catch (error) {
      toast.error('Speech service unavailable');
      console.error('TTS error:', error);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setIsLoading(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string)?.split(',')[1];
        
        const { data } = await extractTextFromImage({
          variables: {
            imageData: base64,
            language: sourceLang
          }
        });

        if (data.extractTextFromImage.success) {
          setSourceText(data.extractTextFromImage.extractedText);
          toast.success('Text extracted from image!');
          // Auto-translate if text was extracted
          if (data.extractTextFromImage.extractedText) {
            await handleTranslate();
          }
        } else {
          toast.error('Failed to extract text from image');
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('OCR service unavailable');
      console.error('OCR error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        
        // Convert blob to base64
        const reader = new FileReader();
        reader.onload = async (e) => {
          const base64 = (e.target?.result as string)?.split(',')[1];
          
          try {
            const { data } = await transcribeAudio({
              variables: {
                audioData: base64,
                language: sourceLang
              }
            });

            if (data.transcribeAudio.success) {
              setSourceText(data.transcribeAudio.transcribedText);
              toast.success('Speech transcribed!');
              // Auto-translate if text was transcribed
              if (data.transcribeAudio.transcribedText) {
                await handleTranslate();
              }
            } else {
              toast.error('Failed to transcribe speech');
            }
          } catch (error) {
            toast.error('Speech-to-text service unavailable');
            console.error('STT error:', error);
          }
        };
        reader.readAsDataURL(audioBlob);
        
        // Clean up
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      toast.success('Recording started...');
    } catch (error) {
      toast.error('Microphone access denied');
      console.error('Recording error:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success('Recording stopped');
    }
  };

  const swapLanguages = () => {
    const tempLang = sourceLang;
    const tempText = sourceText;
    
    setSourceLang(targetLang);
    setTargetLang(tempLang);
    setSourceText(translatedText);
    setTranslatedText(tempText);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const tabs = [
    { id: 'text', label: 'Text Translation', icon: <Languages className="w-5 h-5" /> },
    { id: 'voice', label: 'Voice Translation', icon: <Mic className="w-5 h-5" /> },
    { id: 'image', label: 'Image Translation', icon: <Camera className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/dashboard"
                className="text-muted-foreground hover:text-foreground"
              >
                ← Back to Dashboard
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Universal Translator
            </h1>
            <div></div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex space-x-1 bg-muted p-1 rounded-xl mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'text' | 'voice' | 'image')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-background text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.icon}
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Language Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl shadow-lg p-6 mb-6 border border-border"
        >
          <div className="flex items-center justify-center space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground mb-2">
                From
              </label>
              <select
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                className="w-full p-3 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
              >
                {languages.map((lang: Language) => (
                    <option key={lang.code} value={lang.code}>
                        {lang.name}
                    </option>
                ))}
              </select>
            </div>

            <button
              onClick={swapLanguages}
              className="p-3 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors mt-7"
            >
              <ArrowLeftRight className="w-5 h-5" />
            </button>

            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground mb-2">
                To
              </label>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="w-full p-3 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
              >
                {languages.map((lang: Language) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Translation Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl shadow-lg p-6 border border-border"
        >
          <div className="grid md:grid-cols-2 gap-6">
            {/* Input Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-foreground">
                  Enter text to translate
                </label>
                <div className="flex space-x-2">
                  {activeTab === 'voice' && (
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`p-2 rounded-lg transition-colors ${
                        isRecording 
                          ? 'bg-destructive/10 text-destructive' 
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                  )}
                  {activeTab === 'image' && (
                    <>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleSpeak(sourceText, sourceLang)}
                    disabled={!sourceText}
                    className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Type your text here, upload an image, or use voice input..."
                className="w-full h-40 p-4 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
              />
            </div>

            {/* Output Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-foreground">
                  Translation
                </label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => copyToClipboard(translatedText)}
                    disabled={!translatedText}
                    className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleSpeak(translatedText, targetLang)}
                    disabled={!translatedText}
                    className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="w-full h-40 p-4 border border-input rounded-lg bg-muted/50 text-foreground overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : (
                  translatedText || 
                  <span className="text-muted-foreground">
                    Translation will appear here...
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Translate Button */}
          <div className="mt-6 text-center">
            <button
              onClick={handleTranslate}
              disabled={!sourceText.trim() || isLoading}
              className="px-8 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Translating...' : 'Translate'}
            </button>
          </div>
        </motion.div>

        {/* Quick Phrases */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 bg-card rounded-xl shadow-lg p-6 border border-border"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Common Travel Phrases
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              'Hello',
              'Thank you',
              'Please',
              'Excuse me',
              'How much?',
              'Where is the bathroom?',
              'I need help',
              'Do you speak English?',
              'Can you help me?'
            ].map((phrase, index) => (
              <button
                key={index}
                onClick={() => setSourceText(phrase)}
                className="p-3 text-left bg-muted rounded-lg text-foreground hover:bg-muted/80 transition-colors"
              >
                {phrase}
              </button>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}