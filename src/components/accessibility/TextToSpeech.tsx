"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Pause, Play, SkipForward, SkipBack, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TextToSpeechProps {
  text: string;
  title?: string;
}

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

export default function TextToSpeech({ text, title }: TextToSpeechProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(false); // Default to false until we confirm support
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const textChunksRef = useRef<string[]>([]);
  const currentChunkRef = useRef(0);
  
  // Check if speech synthesis is supported and load voices
  useEffect(() => {
    // Only run in browser environment
    if (!isBrowser) return;
    
    try {
      // Check if the API exists
      if (!('speechSynthesis' in window)) {
        console.error('Speech synthesis not supported in this browser');
        return;
      }
      
      // Mark as supported since we've confirmed the API exists
      setIsSupported(true);
      
      // Get available voices
      const getVoices = () => {
        try {
          const availableVoices = window.speechSynthesis.getVoices();
          if (availableVoices.length > 0) {
            setVoices(availableVoices);
            
            // Try to find an English voice
            const englishVoice = availableVoices.find(voice => 
              voice.lang.includes('en') && voice.localService
            );
            
            // Default to the first voice if no English voice is found
            setSelectedVoice(englishVoice || availableVoices[0]);
            setVoicesLoaded(true);
          }
        } catch (e) {
          console.error('Error getting voices:', e);
          // Don't set isSupported to false here, as the API might still work
        }
      };
      
      // Initial attempt to get voices
      getVoices();
      
      // Chrome loads voices asynchronously
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = getVoices;
      }
    } catch (e) {
      console.error('Error initializing speech synthesis:', e);
      setIsSupported(false);
    }
  }, []);
  
  // Process text into chunks
  useEffect(() => {
    // Only run in browser environment and if speech synthesis is supported
    if (!isBrowser || !isSupported || !text) return;
    
    try {
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
    } catch (e) {
      console.error('Error processing text:', e);
      // Don't set isSupported to false here, as the API might still work
    }
  }, [text, isSupported]);
  
  // Create and configure utterance
  const createUtterance = (text: string) => {
    // Only run in browser environment
    if (!isBrowser || !window.SpeechSynthesisUtterance) {
      console.error('SpeechSynthesisUtterance not available');
      return null;
    }
    
    try {
      const utterance = new window.SpeechSynthesisUtterance(text);
      
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
        // More defensive error reporting with safer property access
        try {
          // Create a simplified error details object with safe property access
          const errorDetails = {
            // Use optional chaining and provide fallbacks for all properties
            error: typeof event.error === 'string' ? event.error : 'Unknown error',
            type: event.type || 'error',
            // Avoid accessing potentially undefined nested properties
            browserDetails: isBrowser ? navigator.userAgent : 'Server'
          };
          
          // Log error details but avoid stringifying the entire event object
          console.error('Speech synthesis error:', errorDetails);
          
          // Create a user-friendly error message
          const errorMessage = `Speech synthesis error: ${errorDetails.error}`;
          setSpeechError(errorMessage);
        } catch (err) {
          // Fallback error handling if the error event itself causes issues
          console.error('Error in speech synthesis error handler:', err);
          setSpeechError('Speech synthesis failed. Please try again.');
        } finally {
          // Always reset the player state
          setIsPlaying(false);
          setIsPaused(false);
        }
      };
      
      return utterance;
    } catch (e) {
      console.error('Error creating utterance:', e);
      setSpeechError(`Failed to create speech: ${e instanceof Error ? e.message : 'Unknown error'}`);
      return null;
    }
  };
  
  // Speak the current chunk
  const speakCurrentChunk = () => {
    // Only run in browser environment
    if (!isBrowser || !window.speechSynthesis) {
      setSpeechError("Speech synthesis not available");
      return;
    }
    
    if (textChunksRef.current.length === 0) {
      setSpeechError("No text to speak");
      return;
    }
    
    // Clear any previous errors
    setSpeechError(null);
    
    try {
      const text = textChunksRef.current[currentChunkRef.current];
      utteranceRef.current = createUtterance(text);
      
      if (utteranceRef.current) {
        window.speechSynthesis.speak(utteranceRef.current);
        setCurrentPosition(currentChunkRef.current);
      } else {
        throw new Error("Failed to create speech utterance");
      }
    } catch (error) {
      console.error('Error in speakCurrentChunk:', error);
      setSpeechError(`Failed to start speech: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsPlaying(false);
      setIsPaused(false);
    }
  };
  
  // Toggle play/pause
  const togglePlay = () => {
    // Only run in browser environment
    if (!isBrowser || !window.speechSynthesis || !isSupported) return;
    
    // Clear any previous errors
    setSpeechError(null);
    
    try {
      if (isPlaying) {
        if (isPaused) {
          window.speechSynthesis.resume();
          setIsPaused(false);
        } else {
          window.speechSynthesis.pause();
          setIsPaused(true);
        }
      } else {
        // Check if voices are loaded now (they might have loaded since component mounted)
        if (voices.length === 0) {
          const availableVoices = window.speechSynthesis.getVoices();
          if (availableVoices.length > 0) {
            setVoices(availableVoices);
            const englishVoice = availableVoices.find(voice => 
              voice.lang.includes('en') && voice.localService
            );
            setSelectedVoice(englishVoice || availableVoices[0]);
            setVoicesLoaded(true);
          } else {
            setSpeechError("No voices available. Speech synthesis may not be fully supported in this browser.");
            return;
          }
        }
        
        setIsPlaying(true);
        speakCurrentChunk();
      }
    } catch (error) {
      console.error('Error in togglePlay:', error);
      setSpeechError(`Failed to control playback: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsPlaying(false);
      setIsPaused(false);
    }
  };
  
  // Stop speaking
  const stopSpeaking = () => {
    // Only run in browser environment
    if (!isBrowser || !window.speechSynthesis) return;
    
    try {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
      currentChunkRef.current = 0;
      setSpeechError(null);
    } catch (error) {
      console.error('Error in stopSpeaking:', error);
      setSpeechError(`Failed to stop speech: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  // Skip forward
  const skipForward = () => {
    // Only run in browser environment
    if (!isBrowser || !window.speechSynthesis || !isPlaying) return;
    
    try {
      window.speechSynthesis.cancel();
      
      if (currentChunkRef.current < textChunksRef.current.length - 1) {
        currentChunkRef.current++;
        speakCurrentChunk();
      } else {
        setIsPlaying(false);
        setIsPaused(false);
        currentChunkRef.current = 0;
      }
    } catch (error) {
      console.error('Error in skipForward:', error);
      setSpeechError(`Failed to skip forward: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsPlaying(false);
      setIsPaused(false);
    }
  };
  
  // Skip backward
  const skipBackward = () => {
    // Only run in browser environment
    if (!isBrowser || !window.speechSynthesis || !isPlaying) return;
    
    try {
      window.speechSynthesis.cancel();
      
      if (currentChunkRef.current > 0) {
        currentChunkRef.current--;
        speakCurrentChunk();
      } else {
        speakCurrentChunk(); // Restart current chunk
      }
    } catch (error) {
      console.error('Error in skipBackward:', error);
      setSpeechError(`Failed to skip backward: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsPlaying(false);
      setIsPaused(false);
    }
  };
  
  // Handle voice change
  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // Only run in browser environment
    if (!isBrowser || !window.speechSynthesis) return;
    
    try {
      const voice = voices.find(v => v.name === e.target.value) || null;
      setSelectedVoice(voice);
      
      // If currently playing, update the voice
      if (isPlaying && !isPaused) {
        window.speechSynthesis.cancel();
        speakCurrentChunk();
      }
    } catch (error) {
      console.error('Error in handleVoiceChange:', error);
      setSpeechError(`Failed to change voice: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  // Handle rate change
  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only run in browser environment
    if (!isBrowser || !window.speechSynthesis) return;
    
    try {
      const newRate = parseFloat(e.target.value);
      setRate(newRate);
      
      // If currently playing, update the rate
      if (isPlaying && !isPaused) {
        window.speechSynthesis.cancel();
        speakCurrentChunk();
      }
    } catch (error) {
      console.error('Error in handleRateChange:', error);
      setSpeechError(`Failed to change rate: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  // Reset error and try again with default settings
  const resetAndTryAgain = () => {
    // Only run in browser environment
    if (!isBrowser || !window.speechSynthesis) return;
    
    setSpeechError(null);
    setRate(1);
    setPitch(1);
    
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      console.error('Error canceling speech synthesis:', e);
    }
    
    currentChunkRef.current = 0;
    
    // Try to reload voices if they weren't loaded
    if (voices.length === 0 && 'speechSynthesis' in window) {
      try {
        const availableVoices = window.speechSynthesis.getVoices();
        if (availableVoices.length > 0) {
          setVoices(availableVoices);
          const englishVoice = availableVoices.find(voice => 
            voice.lang.includes('en') && voice.localService
          );
          setSelectedVoice(englishVoice || availableVoices[0]);
          setVoicesLoaded(true);
        }
      } catch (e) {
        console.error('Error reloading voices:', e);
      }
    }
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
        } catch (error) {
          console.error('Error cleaning up speech synthesis:', error);
        }
      }
    };
  }, []);
  
  // If speech synthesis is not supported, still render the component but disable functionality
  return (
    <div className="text-to-speech inline-flex flex-wrap items-center bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 py-2 px-3">
      <Volume2 size={16} className="text-vpn-blue dark:text-blue-400 mr-2" />
      <span className="text-sm font-medium text-vpn-gray dark:text-gray-200 mr-3">Listen</span>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={togglePlay}
          disabled={!isSupported}
          className="p-1.5 bg-vpn-blue text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
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
      
      {/* Error message display */}
      {speechError && (
        <div className="w-full mt-2 flex items-start space-x-2 text-red-500 text-xs">
          <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
          <div>
            <p>{speechError}</p>
            <button 
              onClick={resetAndTryAgain}
              className="text-vpn-blue hover:underline mt-1"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
      
      {/* Not supported message */}
      {!isSupported && (
        <div className="w-full mt-2 text-xs text-amber-500">
          Speech synthesis is not supported in your browser.
        </div>
      )}
      
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
              disabled={!isSupported || voices.length === 0}
            >
              {voices.length === 0 ? (
                <option value="">No voices available</option>
              ) : (
                voices.map(voice => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </option>
                ))
              )}
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
              disabled={!isSupported}
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
