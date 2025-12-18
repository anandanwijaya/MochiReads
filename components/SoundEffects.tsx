
export const playSound = (type: 'pop' | 'woosh' | 'tada') => {
  const sounds = {
    pop: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
    woosh: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
    tada: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3'
  };
  
  const audio = new Audio(sounds[type]);
  audio.volume = 0.3;
  audio.play().catch(() => {}); // Catch browser auto-play blocks
};
