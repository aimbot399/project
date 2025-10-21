import { useEffect, useRef, useState } from 'react';

type AmbientAudioProps = {
  enabled: boolean;
  type: 'forest' | 'waves' | 'city';
};

export function AmbientAudio({ enabled, type }: AmbientAudioProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [userInteracted, setUserInteracted] = useState(false);

  // Get the audio source URL based on type
  const getAudioSrc = () => {
    switch (type) {
      case 'forest':
        return 'https://cdn.pixabay.com/download/audio/2021/10/08/audio_3fdc3d7eaf.mp3?filename=forest-ambient-9891.mp3';
      case 'waves':
        return 'https://cdn.pixabay.com/download/audio/2021/09/01/audio_4f5a40c5d0.mp3?filename=waves-ambient-5985.mp3';
      case 'city':
        return 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_61e0d4bde7.mp3?filename=city-street-ambient-111397.mp3';
      default:
        return '';
    }
  };

  // Enable audio on first user interaction
  useEffect(() => {
    const enableAudio = () => {
      setUserInteracted(true);
      // Try to play audio immediately on first interaction
      const audio = audioRef.current;
      if (audio && enabled) {
        audio.play().catch((e) => console.log('Initial audio play failed:', e));
      }
    };

    // Listen for any user interaction
    document.addEventListener('click', enableAudio, { once: true });
    document.addEventListener('keydown', enableAudio, { once: true });
    document.addEventListener('touchstart', enableAudio, { once: true });

    return () => {
      document.removeEventListener('click', enableAudio);
      document.removeEventListener('keydown', enableAudio);
      document.removeEventListener('touchstart', enableAudio);
    };
  }, [enabled]);

  // Handle audio playback
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Set volume
    audio.volume = 0.4;

    // Only try to play if user has interacted
    if (enabled && userInteracted) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('✅ Ambient audio started:', type);
          })
          .catch((error) => {
            console.error('❌ Audio play failed:', error);
          });
      }
    } else if (!enabled) {
      audio.pause();
      console.log('⏸️ Ambient audio paused');
    }
  }, [enabled, type, userInteracted]);

  // Handle type change
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // When type changes, reload the audio
    audio.load();
    
    // If enabled and user has interacted, play the new audio
    if (enabled && userInteracted) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('🔄 Switched to:', type);
          })
          .catch((error) => {
            console.error('❌ Audio type change play failed:', error);
          });
      }
    }
  }, [type, enabled, userInteracted]);

  return (
    <audio 
      ref={audioRef} 
      src={getAudioSrc()} 
      loop 
      preload="auto"
      crossOrigin="anonymous"
    />
  );
}


