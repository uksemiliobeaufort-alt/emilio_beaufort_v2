"use client";

import { useEffect, useState, useCallback } from 'react';
import FeedbackFormDialog from '@/components/ui/FeedbackFormDialog';

interface AutoFeedbackTriggerProps {
  footerSelector?: string;
}

export default function AutoFeedbackTrigger({ footerSelector = 'footer' }: AutoFeedbackTriggerProps) {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  // Check if feedback form was already shown in this session
  useEffect(() => {
    const feedbackShown = sessionStorage.getItem('auto-feedback-shown');
    if (feedbackShown) {
      setHasTriggered(true);
    }
  }, []);

  const triggerFeedback = useCallback(() => {
    if (!hasTriggered && !showFeedbackForm) {
      setShowFeedbackForm(true);
      setHasTriggered(true);
      sessionStorage.setItem('auto-feedback-shown', 'true');
    }
  }, [hasTriggered, showFeedbackForm]);

  useEffect(() => {
    if (hasTriggered) return;

    // Method 1: Intersection Observer for footer visibility
    const footerElement = document.querySelector(footerSelector);
    let footerObserver: IntersectionObserver | null = null;

    if (footerElement) {
      footerObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            // Trigger when footer is 30% visible
            if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
              triggerFeedback();
            }
          });
        },
        {
          threshold: [0.3, 0.5], // Trigger when 30% or 50% of footer is visible
          rootMargin: '0px 0px -10% 0px' // Slightly reduce the trigger area
        }
      );

      footerObserver.observe(footerElement);
    }

    // Method 2: Scroll position detection (fallback)
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollPosition = window.scrollY + window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollPercentage = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;

        // Trigger when user is 85% down the page or within 200px of bottom
        if (scrollPercentage >= 0.85 || (documentHeight - scrollPosition) <= 200) {
          triggerFeedback();
        }
      }, 100); // Debounce scroll events
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Method 3: Time-based trigger (as additional fallback)
    const timeBasedTrigger = setTimeout(() => {
      // Only trigger after 30 seconds if user is at least 50% down the page
      const scrollPercentage = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
      if (scrollPercentage >= 0.5) {
        triggerFeedback();
      }
    }, 30000); // 30 seconds

    // Cleanup
    return () => {
      if (footerObserver) {
        footerObserver.disconnect();
      }
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
      clearTimeout(timeBasedTrigger);
    };
  }, [footerSelector, triggerFeedback, hasTriggered]);

  // Reset trigger state when component unmounts (page navigation)
  useEffect(() => {
    return () => {
      // Don't clear session storage on unmount, only on new session
    };
  }, []);

  return (
    <FeedbackFormDialog 
      isOpen={showFeedbackForm}
      onClose={() => setShowFeedbackForm(false)}
      isAutoTriggered={true}
    />
  );
} 