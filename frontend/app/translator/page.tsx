'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Loader,
  X,
  FileAudio,
  Repeat,
  Radio,
  StopCircle,
  Trash2,
  Check,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import { 
  TRANSLATE_TEXT_MUTATION, 
  GENERATE_SPEECH_MUTATION,
  EXTRACT_TEXT_FROM_IMAGE_MUTATION,
  TRANSCRIBE_AUDIO_MUTATION,
  GET_SUPPORTED_MT_LANGUAGES 
} from '@/graphql/queries';
import toast from 'react-hot-toast';
import { Language } from '@/utils/types';
import { useTranslation } from '@/hooks/useTranslation';

export default function Translator() {
  const { t } = useTranslation();
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('hi');
  const [voiceGender, setVoiceGender] = useState<'male' | 'female'>('female');
  const [isRecording, setIsRecording] = useState(false);
  const [isLiveTranslating, setIsLiveTranslating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'text' | 'voice' | 'image'>('text');
  const [recordingTime, setRecordingTime] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [wordBuffer, setWordBuffer] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const liveRecognitionRef = useRef<any>(null);

  const { data: languagesData, loading: languagesLoading } = useQuery(GET_SUPPORTED_MT_LANGUAGES);
  const [translateText] = useMutation(TRANSLATE_TEXT_MUTATION);
  const [generateSpeech] = useMutation(GENERATE_SPEECH_MUTATION);
  const [extractTextFromImage] = useMutation(EXTRACT_TEXT_FROM_IMAGE_MUTATION);
  const [transcribeAudio] = useMutation(TRANSCRIBE_AUDIO_MUTATION);

  const languages = languagesData?.supportedMtLanguages || [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'te', name: 'Telugu' },
    { code: 'ta', name: 'Tamil' },
    { code: 'kn', name: 'Kannada' },
    { code: 'ml', name: 'Malayalam' },
    { code: 'mr', name: 'Marathi' },
    { code: 'gu', name: 'Gujarati' },
    { code: 'pa', name: 'Punjabi' },
    { code: 'bn', name: 'Bengali' },
    { code: 'or', name: 'Odia' },
    { code: 'as', name: 'Assamese' },
    { code: 'ur', name: 'Urdu' }
  ];

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (liveRecognitionRef.current) {
        liveRecognitionRef.current.stop();
      }
    };
  }, []);

  // Recording timer effect
  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      setRecordingTime(0);
    }
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [isRecording]);

  const handleTranslate = async (textToTranslate?: string) => {
    const text = textToTranslate || sourceText;
    if (!text.trim()) {
      toast.error(t('common.error'));
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await translateText({
        variables: {
          input: {
            text: text,
            sourceLang: sourceLang,
            targetLang: targetLang
          }
        }
      });

      if (data?.translateText?.success) {
        setTranslatedText(data.translateText.translatedText || '');
        toast.success(t('common.success'));
      } else {
        toast.error(data?.translateText?.message || t('common.error'));
      }
    } catch (error) {
      toast.error(t('common.error'));
      console.error('Translation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearText = () => {
    setSourceText('');
    setTranslatedText('');
  };

  const handleSpeak = async (text: string, language: string) => {
    if (!text.trim()) {
      toast.error('No text to speak');
      return;
    }

    try {
      const { data } = await generateSpeech({
        variables: {
          input: {
            text: text,
            gender: voiceGender
          }
        }
      });

      if (data?.generateSpeech?.success && data.generateSpeech.audioContent) {
        const audio = new Audio(data.generateSpeech.audioContent);
        audio.play();
        toast.success(t('common.success'));
      } else {
        toast.error(data?.generateSpeech?.message || t('common.error'));
      }
    } catch (error) {
      toast.error(t('common.error'));
      console.error('TTS error:', error);
    }
  };

    const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setIsLoading(true);
    
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string)?.split(',')[1];
        
        const { data } = await extractTextFromImage({
          variables: {
            input: {
              imageData: base64,
              language: sourceLang
            }
          }
        });

        if (data?.extractTextFromImage?.success) {
          setExtractedText(data.extractTextFromImage.extractedText || '');
          toast.success('Text extracted from image!');
        } else {
          toast.error(data?.extractTextFromImage?.error || t('common.error'));
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error(t('common.error'));
      console.error('OCR error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);

      stream.getTracks().forEach(track => track.stop());

      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
          await handleImageUpload(file);
        }
      }, 'image/jpeg');
    } catch (error) {
      toast.error('Camera access denied');
      console.error('Camera error:', error);
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleTranslateExtracted = async () => {
    if (!extractedText.trim()) {
      toast.error('No text to translate');
      return;
    }
    await handleTranslate(extractedText);
  };

  const handleExtractTextFromImage = async () => {
    if (!imageFile) {
      toast.error('No image selected');
      return;
    }

    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string)?.split(',')[1];
        
        const { data } = await extractTextFromImage({
          variables: {
            input: {
              imageData: base64,
              language: sourceLang
            }
          }
        });

        if (data?.extractTextFromImage?.success) {
          setExtractedText(data.extractTextFromImage.extractedText || '');
          toast.success('Text extracted from image!');
        } else {
          toast.error(data?.extractTextFromImage?.error || t('common.error'));
        }
      };
      reader.readAsDataURL(imageFile);
    } catch (error) {
      toast.error(t('common.error'));
      console.error('OCR error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeakExtractedText = async () => {
    if (!extractedText.trim()) {
      toast.error('No text to speak');
      return;
    }
    await handleSpeak(extractedText, sourceLang);
  };

  const handleDirectImageTranslate = async () => {
    if (!imageFile) {
      toast.error('No image selected');
      return;
    }

    // First extract text
    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string)?.split(',')[1];
        
        const { data } = await extractTextFromImage({
          variables: {
            input: {
              imageData: base64,
              language: sourceLang
            }
          }
        });

        if (data?.extractTextFromImage?.success) {
          const extracted = data.extractTextFromImage.extractedText || '';
          setExtractedText(extracted);
          
          // Then translate it
          if (extracted) {
            await handleTranslate(extracted);
          }
        } else {
          toast.error(data?.extractTextFromImage?.error || t('common.error'));
        }
      };
      reader.readAsDataURL(imageFile);
    } catch (error) {
      toast.error(t('common.error'));
      console.error('OCR error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAudioFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      toast.error('Please select an audio file');
      return;
    }

    setAudioFile(file);
    setIsLoading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string)?.split(',')[1];
        
        const { data } = await transcribeAudio({
          variables: {
            input: {
              audioData: base64,
              language: sourceLang
            }
          }
        });

        if (data?.transcribeAudio?.success) {
          setSourceText(data.transcribeAudio.transcribedText || '');
          toast.success('Audio transcribed successfully!');
        } else {
          const errorMsg = data?.transcribeAudio?.error || t('common.error');
          toast.error(errorMsg);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error(t('common.error'));
      console.error('Audio transcription error:', error);
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
        
        const reader = new FileReader();
        reader.onload = async (e) => {
          const base64 = (e.target?.result as string)?.split(',')[1];
          
          try {
            const { data } = await transcribeAudio({
              variables: {
                input: {
                  audioData: base64,
                  language: sourceLang
                }
              }
            });

            if (data?.transcribeAudio?.success) {
              setSourceText(data.transcribeAudio.transcribedText || '');
              toast.success('Recording transcribed!');
            } else {
              const errorMsg = data?.transcribeAudio?.error || t('common.error');
              toast.error(errorMsg);
            }
          } catch (error) {
            toast.error(t('common.error'));
            console.error('STT error:', error);
          }
        };
        reader.readAsDataURL(audioBlob);
        
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      toast.success(t('translator.voiceTranslation.recording'));
    } catch (error) {
      toast.error(t('common.error'));
      console.error('Recording error:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success(t('translator.voiceTranslation.processing'));
    }
  };

  const startLiveTranslation = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = sourceLang;

    recognition.onresult = async (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      setLiveTranscript(finalTranscript + interimTranscript);

      // Translate when we have 6-8 words
      const words = (finalTranscript + interimTranscript).trim().split(/\s+/);
      if (words.length >= 6 && words.length <= 8) {
        const textToTranslate = words.join(' ');
        await handleTranslate(textToTranslate);
        setWordBuffer([]);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      toast.error('Speech recognition error');
    };

    recognition.start();
    liveRecognitionRef.current = recognition;
    setIsLiveTranslating(true);
    toast.success('Live translation started');
  };

  const stopLiveTranslation = () => {
    if (liveRecognitionRef.current) {
      liveRecognitionRef.current.stop();
      liveRecognitionRef.current = null;
    }
    setIsLiveTranslating(false);
    setLiveTranscript('');
    toast.success('Live translation stopped');
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
    toast.success(t('translator.textTranslation.copied'));
  };

  const tabs = [
    { id: 'text', label: t('translator.tabs.text'), icon: <Languages className="w-5 h-5" /> },
    { id: 'voice', label: t('translator.tabs.voice'), icon: <Mic className="w-5 h-5" /> },
    { id: 'image', label: t('translator.tabs.image'), icon: <Camera className="w-5 h-5" /> }
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
                ← {t('nav.backToDashboard')}
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {t('translator.title')}
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
          {languagesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="w-6 h-6 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading languages...</span>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t('translator.textTranslation.sourceLanguage')}
                  </label>
                  <select
                    value={sourceLang}
                    onChange={(e) => setSourceLang(e.target.value)}
                    className="w-full p-3 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                    disabled={languagesLoading}
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
                  disabled={languagesLoading}
                >
                  <ArrowLeftRight className="w-5 h-5" />
                </button>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t('translator.textTranslation.targetLanguage')}
                  </label>
                  <select
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    className="w-full p-3 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                    disabled={languagesLoading}
                  >
                    {languages.map((lang: Language) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Voice Gender Selection */}
              <div className="mt-4 flex items-center justify-center">
                <div className="flex items-center space-x-4 bg-muted p-2 rounded-lg">
                  <span className="text-sm font-medium text-foreground">Voice Gender:</span>
                  <button
                    onClick={() => setVoiceGender('female')}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      voiceGender === 'female'
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Female
                  </button>
                  <button
                    onClick={() => setVoiceGender('male')}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      voiceGender === 'male'
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Male
                  </button>
                </div>
              </div>
            </>
          )}
        </motion.div>

        {/* Translation Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl shadow-lg p-6 border border-border"
        >
          {/* TEXT TAB LAYOUT */}
          {activeTab === 'text' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Source Text Input */}
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-foreground">
                      {t('translator.textTranslation.sourcePlaceholder')}
                    </label>
                    <div className="flex gap-2">
                      {sourceText && (
                        <>
                          <button
                            onClick={() => handleSpeak(sourceText, sourceLang)}
                            className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                            title="Speak source text"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleClearText}
                            className="p-1 hover:bg-muted rounded transition-colors"
                            title="Clear text"
                          >
                            <X className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <textarea
                    value={sourceText}
                    onChange={(e) => setSourceText(e.target.value)}
                    placeholder={t('translator.textTranslation.sourcePlaceholder')}
                    className="w-full h-48 p-4 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                  />
                </div>

                {/* Translated Text Output */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-foreground">
                      {t('translator.textTranslation.targetPlaceholder')}
                    </label>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => copyToClipboard(translatedText)}
                        disabled={!translatedText}
                        className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Copy translation"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleSpeak(translatedText, targetLang)}
                        disabled={!translatedText}
                        className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Speak translation"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="w-full h-48 p-4 border border-input rounded-lg bg-muted/30 text-foreground overflow-y-auto">
                    {isLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    ) : (
                      translatedText || 
                      <span className="text-muted-foreground">
                        {t('translator.textTranslation.targetPlaceholder')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Translate Button */}
              <div className="text-center">
                <button
                  onClick={() => handleTranslate()}
                  disabled={!sourceText.trim() || isLoading}
                  className="px-10 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader className="w-4 h-4 animate-spin" />
                      {t('translator.textTranslation.translating')}
                    </span>
                  ) : (
                    t('translator.textTranslation.translate')
                  )}
                </button>
              </div>
            </div>
          )}

          {/* VOICE TAB LAYOUT */}
          {activeTab === 'voice' && (
            <div className="space-y-6">
              {/* Live Translation Toggle */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Radio className="w-5 h-5 text-primary" />
                  <span className="font-medium text-foreground">Live Translation</span>
                  <span className="text-sm text-muted-foreground">(Continuous listening)</span>
                </div>
                <button
                  onClick={isLiveTranslating ? stopLiveTranslation : startLiveTranslation}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    isLiveTranslating
                      ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  }`}
                >
                  {isLiveTranslating ? (
                    <span className="flex items-center gap-2">
                      <StopCircle className="w-4 h-4" />
                      Stop Live
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Radio className="w-4 h-4" />
                      Start Live
                    </span>
                  )}
                </button>
              </div>

              {/* Live Transcript (when live translating) */}
              {isLiveTranslating && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-4 bg-primary/10 border-2 border-primary/20 rounded-lg"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-foreground">Listening...</span>
                  </div>
                  <p className="text-foreground">
                    {liveTranscript || 'Speak something...'}
                  </p>
                </motion.div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                {/* Upload Audio File */}
                <div className="border-2 border-dashed border-border rounded-lg p-8 hover:border-primary/50 transition-all">
                  <input
                    type="file"
                    ref={audioInputRef}
                    onChange={handleAudioFileUpload}
                    accept="audio/*"
                    className="hidden"
                  />
                  <div className="text-center space-y-4">
                    <div className="flex justify-center">
                      <div className="p-4 bg-primary/10 rounded-full">
                        <FileAudio className="w-8 h-8 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Upload Audio File</h3>
                      <p className="text-sm text-muted-foreground">
                        {audioFile ? audioFile.name : 'Upload a pre-recorded audio file'}
                      </p>
                    </div>
                    <button
                      onClick={() => audioInputRef.current?.click()}
                      className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      <Upload className="w-4 h-4 inline mr-2" />
                      Choose File
                    </button>
                  </div>
                </div>

                {/* Record Audio */}
                <div className="border-2 border-border rounded-lg p-8 flex flex-col items-center justify-center space-y-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-1 text-center">Record Audio</h3>
                    <p className="text-sm text-muted-foreground text-center">
                      {isRecording ? 'Recording in progress...' : 'Click to start recording'}
                    </p>
                  </div>

                  {/* Recording Animation */}
                  <div className="relative">
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`relative w-20 h-20 rounded-full transition-all ${
                        isRecording
                          ? 'bg-destructive hover:bg-destructive/90'
                          : 'bg-primary hover:bg-primary/90'
                      }`}
                    >
                      {isRecording ? (
                        <>
                          {/* Pulsing Rings Animation */}
                          <motion.div
                            className="absolute inset-0 rounded-full bg-destructive"
                            animate={{
                              scale: [1, 1.3, 1],
                              opacity: [0.5, 0, 0.5],
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          />
                          <motion.div
                            className="absolute inset-0 rounded-full bg-destructive"
                            animate={{
                              scale: [1, 1.5, 1],
                              opacity: [0.3, 0, 0.3],
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: 0.3,
                            }}
                          />
                          <StopCircle className="w-8 h-8 text-primary-foreground absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                        </>
                      ) : (
                        <Mic className="w-8 h-8 text-primary-foreground absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                      )}
                    </button>
                  </div>

                  {/* Recording Timer */}
                  {isRecording && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-2xl font-mono font-bold text-destructive"
                    >
                      {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Transcribed Text */}
              {sourceText && !isLiveTranslating && (
                <div className="space-y-4">
                  <label className="text-sm font-medium text-foreground">Transcribed Text</label>
                  <div className="p-4 bg-muted/50 rounded-lg border border-border">
                    <p className="text-foreground">{sourceText}</p>
                  </div>
                  
                  {/* Action Options */}
                  <div className="grid md:grid-cols-2 gap-3">
                    <button
                      onClick={() => handleSpeak(sourceText, sourceLang)}
                      className="px-6 py-3 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                    >
                      <Volume2 className="w-4 h-4" />
                      Speak Text
                    </button>
                    <button
                      onClick={() => handleTranslate()}
                      disabled={isLoading}
                      className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Translating...
                        </>
                      ) : (
                        <>
                          <Repeat className="w-4 h-4" />
                          Translate to {languages.find((l: Language) => l.code === targetLang)?.name || targetLang}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Translation Result */}
              {translatedText && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 bg-primary/5 border-2 border-primary/20 rounded-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">Translation</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(translatedText)}
                        className="p-2 rounded-lg bg-background hover:bg-muted transition-colors"
                        title="Copy"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleSpeak(translatedText, targetLang)}
                        className="p-2 rounded-lg bg-background hover:bg-muted transition-colors"
                        title="Speak"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-lg text-foreground">{translatedText}</p>
                </motion.div>
              )}
            </div>
          )}

          {/* IMAGE TAB LAYOUT */}
          {activeTab === 'image' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Camera Capture */}
                <div className="border-2 border-dashed border-border rounded-lg p-8 hover:border-primary/50 transition-all">
                  <div className="text-center space-y-4">
                    <div className="flex justify-center">
                      <div className="p-4 bg-primary/10 rounded-full">
                        <Camera className="w-8 h-8 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Capture with Camera</h3>
                      <p className="text-sm text-muted-foreground">
                        Take a photo of text to extract and translate
                      </p>
                    </div>
                    <button
                      onClick={handleCameraCapture}
                      className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      <Camera className="w-4 h-4 inline mr-2" />
                      Open Camera
                    </button>
                  </div>
                </div>

                {/* Upload Image */}
                <div className="border-2 border-dashed border-border rounded-lg p-8 hover:border-primary/50 transition-all">
                  <input
                    type="file"
                    ref={imageInputRef}
                    onChange={handleImageSelect}
                    accept="image/*"
                    className="hidden"
                  />
                  <div className="text-center space-y-4">
                    <div className="flex justify-center">
                      <div className="p-4 bg-primary/10 rounded-full">
                        <Upload className="w-8 h-8 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Upload Image</h3>
                      <p className="text-sm text-muted-foreground">
                        {imageFile ? imageFile.name : 'Choose an image from your device'}
                      </p>
                    </div>
                    <button
                      onClick={() => imageInputRef.current?.click()}
                      className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      <Upload className="w-4 h-4 inline mr-2" />
                      Choose Image
                    </button>
                  </div>
                </div>
              </div>

              {/* Image Preview */}
              {imagePreview && !extractedText && (
                <>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative rounded-lg overflow-hidden border-2 border-border"
                  >
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full max-h-96 object-contain bg-muted"
                    />
                    <button
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                        setExtractedText('');
                      }}
                      className="absolute top-2 right-2 p-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>

                  {/* Action Options after Image Upload */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid md:grid-cols-3 gap-3"
                  >
                    <button
                      onClick={handleDirectImageTranslate}
                      disabled={isLoading}
                      className="px-4 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Repeat className="w-4 h-4" />
                          Translate
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleExtractTextFromImage}
                      disabled={isLoading}
                      className="px-4 py-3 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <FileText className="w-4 h-4" />
                      Extract Text
                    </button>
                    <button
                      onClick={async () => {
                        await handleExtractTextFromImage();
                        if (extractedText) {
                          await handleSpeakExtractedText();
                        }
                      }}
                      disabled={isLoading}
                      className="px-4 py-3 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Volume2 className="w-4 h-4" />
                      To Speech
                    </button>
                  </motion.div>
                </>
              )}

              {/* Extracted Text */}
              {extractedText && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">Extracted Text</label>
                    <Check className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg border border-border max-h-48 overflow-y-auto">
                    <p className="text-foreground whitespace-pre-wrap">{extractedText}</p>
                  </div>
                  
                  {/* Action Options */}
                  <div className="grid md:grid-cols-2 gap-3">
                    <button
                      onClick={handleSpeakExtractedText}
                      className="px-6 py-3 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                    >
                      <Volume2 className="w-4 h-4" />
                      Speak Text
                    </button>
                    <button
                      onClick={handleTranslateExtracted}
                      disabled={isLoading}
                      className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Translating...
                        </>
                      ) : (
                        <>
                          <Repeat className="w-4 h-4" />
                          Translate to {languages.find((l: Language) => l.code === targetLang)?.name || targetLang}
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Translation Result */}
              {translatedText && extractedText && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 bg-primary/5 border-2 border-primary/20 rounded-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">Translation</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(translatedText)}
                        className="p-2 rounded-lg bg-background hover:bg-muted transition-colors"
                        title="Copy"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleSpeak(translatedText, targetLang)}
                        className="p-2 rounded-lg bg-background hover:bg-muted transition-colors"
                        title="Speak"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-lg text-foreground whitespace-pre-wrap">{translatedText}</p>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>

        {/* Quick Phrases */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 bg-card rounded-xl shadow-lg p-6 border border-border"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {t('translator.quickPhrases.title')}
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              t('translator.quickPhrases.greetings'),
              t('translator.quickPhrases.thanks'),
              'Please',
              'Excuse me',
              'How much?',
              'Where is the bathroom?',
              t('translator.quickPhrases.help'),
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