import { useRef, useCallback } from 'react';

export const useAudio = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  };

  const playSound = useCallback((
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine'
  ) => {
    const audioContext = getAudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + duration
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  }, []);

  const playBuildingPlaced = useCallback(() => {
    playSound(440, 0.1, 'square');
    setTimeout(() => playSound(550, 0.1, 'square'), 100);
  }, [playSound]);

  const playError = useCallback(() => {
    playSound(200, 0.2, 'sawtooth');
  }, [playSound]);

  const playHover = useCallback(() => {
    playSound(800, 0.05, 'sine');
  }, [playSound]);

  return {
    playBuildingPlaced,
    playError,
    playHover,
  };
};
