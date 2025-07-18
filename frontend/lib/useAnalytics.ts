import { useEffect } from 'react';

export default function useAnalytics() {
  useEffect(() => {
    // Placeholder: Add analytics logic here if needed
  }, []);

  // Provide no-op functions to match expected usage
  const trackButtonClick = (..._args: any[]) => {};
  const trackSectionView = (..._args: any[]) => {};

  return { trackButtonClick, trackSectionView };
} 