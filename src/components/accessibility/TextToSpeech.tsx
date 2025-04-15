"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Pause, Play, SkipForward, SkipBack, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TextToSpeechProps {
  text: string;
  title?: string;
}

export default function TextToSpeech({ text, title }: TextToSpeechProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const textChunksRef = useRef<string[]>([]);
  const currentChunkRef = useRef(0);
  
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
      
      // Clean text (remove extra whitespace, etc.)
      const cleanedText = text
        .replace(/\s+/g, ' ')
        .replace(/\n+/g, '\n')
        .trim();
      
      textChunksRef.current = splitTextIntoChunks(cleanedText);
    }
  }, [text]);
  
  // Create and configure utterance
  const createUtterance = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;
    
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
  
  if (!isSupported) {
    return null; // Don't render anything if speech synthesis is not supported
  }
  
  return (
    <div className="text-to-speech inline-flex items-center bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 py-2 px-3">
      <Volume2 size={16} className="text-vpn-blue dark:text-blue-400 mr-2" />
      <span className="text-sm font-medium text-vpn-gray dark:text-gray-200 mr-3">Listen</span>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={togglePlay}
          className="p-1.5 bg-vpn-blue text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-1"
          aria-label={isPlaying ? (isPaused ? "Resume" : "Pause") : "Play"}
        >
          {isPlaying && !isPaused ? (
            <Pause size={14} />
          ) : (
            <Play size={14} />
          )}
        </button>
        
        {isPlaying && (
          <>
            <button
              onClick={skipBackward}
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label="Skip backward"
            >
              <SkipBack size={14} className="text-vpn-gray dark:text-gray-300" />
            </button>
            
            <button
              onClick={skipForward}
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label="Skip forward"
            >
              <SkipForward size={14} className="text-vpn-gray dark:text-gray-300" />
            </button>
            
            <button
              onClick={stopSpeaking}
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label="Stop"
            >
              <X size={14} className="text-vpn-gray dark:text-gray-300" />
            </button>
          </>
        )}
      </div>
      
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="ml-auto text-xs text-vpn-gray-light dark:text-gray-400 hover:text-vpn-blue dark:hover:text-blue-400"
        aria-label="Settings"
      >
        Settings
      </button>
      
      {/* Settings popover - only visible when expanded */}
      {isExpanded && (
        <div className="absolute z-10 mt-2 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 p-4 top-full left-0 w-64">
          {/* Voice selection */}
          <div className="mb-3">
            <label htmlFor="voice-select" className="block text-sm font-medium text-vpn-gray-light dark:text-gray-400 mb-1">
              Voice
            </label>
            <select
              id="voice-select"
              value={selectedVoice?.name || ''}
              onChange={handleVoiceChange}
              className="w-full p-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-vpn-gray dark:text-gray-200"
            >
              {voices.map(voice => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </div>
          
          {/* Speed control */}
          <div className="mb-3">
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
          <div className="text-xs text-vpn-gray-light dark:text-gray-400">
            {isPlaying ? `Playing section ${currentPosition + 1} of ${textChunksRef.current.length}` : 'Ready to play'}
          </div>
        </div>
      )}
    </div>
  );
}
