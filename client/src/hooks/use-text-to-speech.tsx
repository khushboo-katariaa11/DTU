import { useState, useEffect, useCallback } from 'react';
import { useAccessibility } from '@/context/AccessibilityContext';

export function useTextToSpeech() {
  const { enableTTS, textToSpeechRate } = useAccessibility();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  
  // Cancel any ongoing speech when component unmounts
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);
  
  // Update the speech rate when it changes in accessibility settings
  useEffect(() => {
    if (utterance && window.speechSynthesis) {
      utterance.rate = textToSpeechRate;
      
      if (isPlaying && !isPaused) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [textToSpeechRate, utterance, isPlaying, isPaused]);
  
  const speak = useCallback((text: string) => {
    if (!enableTTS || !window.speechSynthesis) return;
    
    // Cancel any existing speech
    window.speechSynthesis.cancel();
    
    // Create a new utterance
    const newUtterance = new SpeechSynthesisUtterance(text);
    newUtterance.rate = textToSpeechRate;
    
    // Event handlers
    newUtterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };
    
    newUtterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };
    
    newUtterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };
    
    // Save the utterance and start speaking
    setUtterance(newUtterance);
    window.speechSynthesis.speak(newUtterance);
  }, [enableTTS, textToSpeechRate]);
  
  const pause = useCallback(() => {
    if (window.speechSynthesis && isPlaying && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isPlaying, isPaused]);
  
  const resume = useCallback(() => {
    if (window.speechSynthesis && isPlaying && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isPlaying, isPaused]);
  
  const stop = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  }, []);
  
  return { speak, pause, resume, stop, isPlaying, isPaused };
}