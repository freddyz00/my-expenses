// Haptic feedback utilities for PWA
// Works on mobile devices that support the Vibration API

export const hapticFeedback = {
  // Light tap feedback for button presses
  light: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  },

  // Medium feedback for selections and toggles
  medium: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(20);
    }
  },

  // Strong feedback for success actions
  success: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([30, 10, 30]);
    }
  },

  // Error feedback for invalid actions
  error: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 30, 50, 30, 50]);
    }
  },

  // Selection feedback for category changes
  selection: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(15);
    }
  },

  // Swipe feedback for gesture interactions
  swipe: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(8);
    }
  }
};

// Check if haptic feedback is supported
export const isHapticSupported = () => {
  return 'vibrate' in navigator;
};
