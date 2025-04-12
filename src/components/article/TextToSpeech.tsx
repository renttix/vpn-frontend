'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipForward, SkipBack, Volume2 } from 'lucide-react';

interface TextToSpeechProps {
  title: string;
  content: string;
}

export default function TextToSpeech({ title, content }: TextToSpeechProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [currentVoice, setCurrentVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [progress, setProgress] = useState(0);
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const textToRead = `${title}. ${content.replace(/\s+/g, ' ')}`;
  
  // Check if speech synthesis is supported
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSpeechSupported(true);
      
      // Initialize utterance
      utteranceRef.current = new SpeechSynthesisUtterance(textToRead);
      
      // Get available voices
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        
        // Try to find an English voice
        const englishVoice = voices.find(voice => 
          voice.lang.includes('en-') && voice.localService
        );
        
        if (englishVoice) {
          setCurrentVoice(englishVoice);
          if (utteranceRef.current) utteranceRef.current.voice = englishVoice;
        } else if (voices.length > 0) {
          setCurrentVoice(voices[0]);
          if (utteranceRef.current) utteranceRef.current.voice = voices[0];
        }
      };
      
      // Chrome loads voices asynchronously
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
      
      loadVoices();
      
      // Set up event handlers for tracking progress
      if (utteranceRef.current) {
        utteranceRef.current.onboundary = (event) => {
          if (event.name === 'word') {
            const totalLength = textToRead.length;
            const currentPosition = event.charIndex;
            setProgress(Math.min((currentPosition / totalLength) * 100, 100));
          }
        };
        
        utteranceRef.current.onend = () => {
          setIsPlaying(false);
          setIsPaused(false);
          setProgress(0);
        };
      }
    }
    
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [textToRead]);
  
  // Play/pause handlers
  const handlePlay = () => {
    if (!isSpeechSupported || !utteranceRef.current) return;
    
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
    } else {
      window.speechSynthesis.cancel();
      if (currentVoice) utteranceRef.current.voice = currentVoice;
      window.speechSynthesis.speak(utteranceRef.current);
      setIsPlaying(true);
    }
  };
  
  const handlePause = () => {
    if (!isSpeechSupported) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(true);
  };
  
  const handleStop = () => {
    if (!isSpeechSupported) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
  };
  
  // Skip forward/backward
  const handleSkipForward = () => {
    handleStop();
    setTimeout(() => {
      if (utteranceRef.current) {
        // Skip forward by adjusting the text (simplified approach)
        const words = textToRead.split(' ');
        const currentWordIndex = Math.floor((progress / 100) * words.length);
        const newStartIndex = Math.min(currentWordIndex + 10, words.length - 1);
        utteranceRef.current.text = words.slice(newStartIndex).join(' ');
        window.speechSynthesis.speak(utteranceRef.current);
        setIsPlaying(true);
      }
    }, 100);
  };
  
  const handleSkipBackward = () => {
    handleStop();
    setTimeout(() => {
      if (utteranceRef.current) {
        // Skip backward by adjusting the text (simplified approach)
        const words = textToRead.split(' ');
        const currentWordIndex = Math.floor((progress / 100) * words.length);
        const newStartIndex = Math.max(currentWordIndex - 10, 0);
        utteranceRef.current.text = words.slice(newStartIndex).join(' ');
        window.speechSynthesis.speak(utteranceRef.current);
        setIsPlaying(true);
      }
    }, 100);
  };
  
  // Voice selection handler
  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedVoice = availableVoices.find(voice => voice.name === e.target.value);
    if (selectedVoice) {
      setCurrentVoice(selectedVoice);
      if (utteranceRef.current) {
        utteranceRef.current.voice = selectedVoice;
        if (isPlaying) {
          handleStop();
          setTimeout(handlePlay, 100);
        }
      }
    }
  };
  
  if (!isSpeechSupported) {
    return null; // Don't render anything if speech synthesis isn't supported
  }
  
  return (
    <div className="mt-2 mb-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-2">
        <Volume2 className="h-4 w-4 text-vpn-blue dark:text-blue-400" />
        <h3 className="text-xs font-semibold font-body text-vpn-gray-light dark:text-gray-400">Listen to this article</h3>
      </div>
      
      {/* Progress bar */}
      <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mb-2">
        <div 
          className="h-full bg-vpn-blue dark:bg-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button 
            onClick={handleSkipBackward} 
            variant="ghost" 
            size="sm" 
            className="h-7 w-7 p-0 rounded-full"
            aria-label="Skip backward"
            disabled={!isPlaying}
          >
            <SkipBack size={14} />
          </Button>
          
          {!isPlaying || isPaused ? (
            <Button 
              onClick={handlePlay} 
              variant="outline" 
              size="sm" 
              className="h-7 w-7 p-0 rounded-full"
              aria-label="Play"
            >
              <Play size={14} />
            </Button>
          ) : (
            <Button 
              onClick={handlePause} 
              variant="outline" 
              size="sm" 
              className="h-7 w-7 p-0 rounded-full"
              aria-label="Pause"
            >
              <Pause size={14} />
            </Button>
          )}
          
          <Button 
            onClick={handleSkipForward} 
            variant="ghost" 
            size="sm" 
            className="h-7 w-7 p-0 rounded-full"
            aria-label="Skip forward"
            disabled={!isPlaying}
          >
            <SkipForward size={14} />
          </Button>
        </div>
        
        {/* Voice selector */}
        <select 
          value={currentVoice?.name || ''} 
          onChange={handleVoiceChange}
          className="text-xs bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2 py-1 max-w-[120px] text-vpn-gray-light dark:text-gray-400"
          aria-label="Select voice"
        >
          {availableVoices.map(voice => (
            <option key={voice.name} value={voice.name}>
              {voice.name.length > 15 ? voice.name.substring(0, 15) + '...' : voice.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
