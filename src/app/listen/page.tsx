"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { client } from '@/lib/sanity.client';
import { groq } from 'next-sanity';
import { Volume2, Pause, Play, SkipForward, SkipBack, X, ArrowLeft } from 'lucide-react';

export default function ListenPage() {
  const searchParams = useSearchParams();
  const articleId = searchParams.get('id');
  
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [articleText, setArticleText] = useState('');
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [rate, setRate] = useState(1);
  
  // Refs for managing speech synthesis
  const utteranceRef = React.useRef<SpeechSynthesisUtterance | null>(null);
  const textChunksRef = React.useRef<string[]>([]);
  const currentChunkRef = React.useRef(0);
  
  // Fetch article data
  useEffect(() => {
    if (!articleId) {
      setError('No article ID provided');
      setLoading(false);
      return;
    }
    
    const fetchArticle = async () => {
      try {
        const query = groq`*[_type == "post" && _id == $id][0]{
          _id,
          title,
          slug,
          body,
          mainImage {
            asset->{
              url
            }
          },
          author->{
            name
          }
        }`;
        
        const result = await client.fetch(query, { id: articleId });
        
        if (!result) {
          setError('Article not found');
          setLoading(false);
          return;
        }
        
        setArticle(result);
        
        // Extract text from article body
        if (result.body) {
          const extractText = (blocks: any[]): string => {
            return blocks.map(block => {
              // Handle different block types
              if (block._type === 'block' && block.children) {
                return block.children.map((child: any) => child.text || '').join(' ');
              }
              return '';
            }).join('\n\n');
          };
          
          const text = extractText(result.body);
          setArticleText(text);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching article:', err);
        setError('Failed to fetch article');
        setLoading(false);
      }
    };
    
    fetchArticle();
  }, [articleId]);
  
  // Check if speech synthesis is supported
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!('speechSynthesis' in window)) {
        setIsSupported(false);
        return;
      }
      
      // Get available voices
      const getVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        if (availableVoices.length > 0) {
          setVoices(availableVoices);
          
          // Try to find an English voice
          const englishVoice = availableVoices.find(voice => 
            voice.lang.includes('en') && voice.localService
          );
          
          // Default to the first voice if no English voice is found
          setSelectedVoice(englishVoice || availableVoices[0]);
        }
      };
      
      // Chrome loads voices asynchronously
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = getVoices;
      }
      
      getVoices();
      
      // Split text into manageable chunks (browsers have limits on utterance length)
      const splitTextIntoChunks = (text: string): string[] => {
        // Split by sentences and paragraphs
        const chunks: string[] = [];
        const paragraphs = text.split(/\n\n+/);
        
        for (const paragraph of paragraphs) {
          // If paragraph is short enough, add it as a chunk
          if (paragraph.length < 1000) {
            chunks.push(paragraph);
          } else {
            // Split long paragraphs by sentences
            const sentences = paragraph.split(/(?<=[.!?])\s+/);
            let currentChunk = '';
            
            for (const sentence of sentences) {
              if (currentChunk.length + sentence.length < 1000) {
                currentChunk += (currentChunk ? ' ' : '') + sentence;
              } else {
                if (currentChunk) {
                  chunks.push(currentChunk);
                }
                currentChunk = sentence;
              }
            }
            
            if (currentChunk) {
              chunks.push(currentChunk);
            }
          }
        }
        
        return chunks;
      };
      
      if (articleText) {
        // Clean text (remove extra whitespace, etc.)
        const cleanedText = articleText
          .replace(/\s+/g, ' ')
          .replace(/\n+/g, '\n')
          .trim();
        
        textChunksRef.current = splitTextIntoChunks(cleanedText);
      }
    }
  }, [articleText]);
  
  // Create and configure utterance
  const createUtterance = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.rate = rate;
    
    // Handle events
    utterance.onend = () => {
      // Move to next chunk if available
      if (currentChunkRef.current < textChunksRef.current.length - 1) {
        currentChunkRef.current++;
        speakCurrentChunk();
      } else {
        // End of text
        setIsPlaying(false);
        setIsPaused(false);
        currentChunkRef.current = 0;
      }
    };
    
    utterance.onpause = () => {
      setIsPaused(true);
    };
    
    utterance.onresume = () => {
      setIsPaused(false);
    };
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsPlaying(false);
      setIsPaused(false);
    };
    
    return utterance;
  };
  
  // Speak the current chunk
  const speakCurrentChunk = () => {
    if (textChunksRef.current.length === 0) return;
    
    const text = textChunksRef.current[currentChunkRef.current];
    utteranceRef.current = createUtterance(text);
    
    window.speechSynthesis.speak(utteranceRef.current);
    setCurrentPosition(currentChunkRef.current);
  };
  
  // Toggle play/pause
  const togglePlay = () => {
    if (!isSupported) return;
    
    if (isPlaying) {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } else {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
    } else {
      setIsPlaying(true);
      speakCurrentChunk();
    }
  };
  
  // Stop speaking
  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    currentChunkRef.current = 0;
  };
  
  // Skip forward
  const skipForward = () => {
    if (!isPlaying) return;
    
    window.speechSynthesis.cancel();
    
    if (currentChunkRef.current < textChunksRef.current.length - 1) {
      currentChunkRef.current++;
      speakCurrentChunk();
    } else {
      setIsPlaying(false);
      setIsPaused(false);
      currentChunkRef.current = 0;
    }
  };
  
  // Skip backward
  const skipBackward = () => {
    if (!isPlaying) return;
    
    window.speechSynthesis.cancel();
    
    if (currentChunkRef.current > 0) {
      currentChunkRef.current--;
      speakCurrentChunk();
    } else {
      speakCurrentChunk(); // Restart current chunk
    }
  };
  
  // Handle voice change
  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const voice = voices.find(v => v.name === e.target.value) || null;
    setSelectedVoice(voice);
    
    // If currently playing, update the voice
    if (isPlaying && !isPaused) {
      window.speechSynthesis.cancel();
      speakCurrentChunk();
    }
  };
  
  // Handle rate change
  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRate = parseFloat(e.target.value);
    setRate(newRate);
    
    // If currently playing, update the rate
    if (isPlaying && !isPaused) {
      window.speechSynthesis.cancel();
      speakCurrentChunk();
    }
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);
  
  // Auto-play when the page loads
  useEffect(() => {
    if (articleText && isSupported && textChunksRef.current.length > 0 && !isPlaying) {
      // Small delay to ensure everything is ready
      const timer = setTimeout(() => {
        setIsPlaying(true);
        speakCurrentChunk();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [articleText, isSupported]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-vpn-blue mx-auto"></div>
          <p className="mt-4 text-vpn-gray dark:text-gray-300">Loading article...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-vpn-gray dark:text-white mb-4">Error</h1>
          <p className="text-vpn-gray dark:text-gray-300 mb-6">{error}</p>
          <Link 
            href="/"
            className="inline-block bg-vpn-blue text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }
  
  if (!isSupported) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-yellow-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-vpn-gray dark:text-white mb-4">Browser Not Supported</h1>
          <p className="text-vpn-gray dark:text-gray-300 mb-6">
            Your browser does not support the Web Speech API required for text-to-speech functionality.
            Please try using a modern browser like Chrome, Edge, or Safari.
          </p>
          <Link 
            href={`/${article?.slug?.current || ''}`}
            className="inline-block bg-vpn-blue text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Return to Article
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header with back button */}
        <div className="mb-8">
          <Link 
            href={`/${article?.slug?.current || ''}`}
            className="inline-flex items-center text-vpn-blue hover:underline"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to Article
          </Link>
          
          <h1 className="text-2xl md:text-3xl font-bold text-vpn-gray dark:text-white mt-4">
            {article?.title || 'Article'}
          </h1>
          
          {article?.author?.name && (
            <p className="text-vpn-gray-light dark:text-gray-400 mt-2">
              By {article.author.name}
            </p>
          )}
        </div>
        
        {/* Text-to-Speech Player */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center mb-6">
            <Volume2 size={24} className="text-vpn-blue dark:text-blue-400 mr-2" />
            <h2 className="text-xl font-medium text-vpn-gray dark:text-gray-200">
              Listening to Article
            </h2>
          </div>
          
          {/* Controls */}
          <div className="flex items-center justify-center space-x-6 my-6">
            <button
              onClick={skipBackward}
              disabled={!isPlaying}
              className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Skip backward"
            >
              <SkipBack size={24} className="text-vpn-gray dark:text-gray-300" />
            </button>
            
            <button
              onClick={togglePlay}
              className="p-4 bg-vpn-blue text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label={isPlaying ? (isPaused ? "Resume" : "Pause") : "Play"}
            >
              {isPlaying && !isPaused ? (
                <Pause size={32} />
              ) : (
                <Play size={32} />
              )}
            </button>
            
            <button
              onClick={skipForward}
              disabled={!isPlaying}
              className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Skip forward"
            >
              <SkipForward size={24} className="text-vpn-gray dark:text-gray-300" />
            </button>
            
            <button
              onClick={stopSpeaking}
              disabled={!isPlaying}
              className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Stop"
            >
              <X size={24} className="text-vpn-gray dark:text-gray-300" />
            </button>
          </div>
          
          {/* Voice selection */}
          <div className="mb-4">
            <label htmlFor="voice-select" className="block text-sm font-medium text-vpn-gray-light dark:text-gray-400 mb-1">
              Voice
            </label>
            <select
              id="voice-select"
              value={selectedVoice?.name || ''}
              onChange={handleVoiceChange}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-vpn-gray dark:text-gray-200"
            >
              {voices.map(voice => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </div>
          
          {/* Speed control */}
          <div className="mb-4">
            <label htmlFor="rate-slider" className="block text-sm font-medium text-vpn-gray-light dark:text-gray-400 mb-1">
              Speed: {rate.toFixed(1)}x
            </label>
            <input
              id="rate-slider"
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={rate}
              onChange={handleRateChange}
              className="w-full"
            />
          </div>
          
          {/* Progress indicator */}
          <div className="text-sm text-vpn-gray-light dark:text-gray-400 text-center mt-4">
            {isPlaying ? `Playing section ${currentPosition + 1} of ${textChunksRef.current.length}` : 'Ready to play'}
          </div>
        </div>
        
        {/* Article text preview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-vpn-gray dark:text-gray-200 mb-4">
            Article Text
          </h3>
          <div className="prose dark:prose-invert max-w-none">
            {articleText.split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-4 text-vpn-gray dark:text-gray-300">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
