"use client";

import { useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { 
  trackEngagement, 
  trackEcommerce, 
  trackUserBehavior, 
  trackEventWithConsent,
  trackPageViewWithConsent 
} from './analytics';

export const useAnalytics = () => {
  const pathname = usePathname();
  const pageStartTime = useRef<number>(Date.now());
  const scrollDepth = useRef<number>(0);
  const hasTrackedScroll = useRef<Set<number>>(new Set());

  // Track time on page when component unmounts
  useEffect(() => {
    return () => {
      const timeOnPage = Math.round((Date.now() - pageStartTime.current) / 1000);
      if (timeOnPage > 5) { // Only track if user spent more than 5 seconds
        trackEngagement.timeOnPage(timeOnPage, pathname || '/');
      }
    };
  }, [pathname]);

  // Track scroll depth
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);

      // Track scroll depth at 25%, 50%, 75%, and 100%
      const milestones = [25, 50, 75, 100];
      milestones.forEach(milestone => {
        if (scrollPercent >= milestone && !hasTrackedScroll.current.has(milestone)) {
          trackEngagement.scrollDepth(milestone);
          hasTrackedScroll.current.add(milestone);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track section visibility
  const trackSectionView = useCallback((sectionName: string) => {
    trackUserBehavior.sectionView(sectionName);
  }, []);

  // Track button clicks
  const trackButtonClick = useCallback((buttonName: string, location: string) => {
    trackEngagement.buttonClick(buttonName, location);
  }, []);

  // Track form submissions
  const trackFormSubmission = useCallback((formName: string, success: boolean) => {
    trackEngagement.formSubmission(formName, success);
  }, []);

  // Track product interactions
  const trackProductView = useCallback((productName: string, category: string) => {
    trackEngagement.productView(productName, category);
  }, []);

  // Track partnership inquiries
  const trackPartnershipInquiry = useCallback((source: string) => {
    trackEngagement.partnershipInquiry(source);
  }, []);

  // Track team member clicks
  const trackTeamMemberClick = useCallback((memberName: string, platform: string) => {
    trackEngagement.teamMemberClick(memberName, platform);
  }, []);

  // Track video interactions
  const trackVideoInteraction = useCallback((
    action: 'play' | 'pause' | 'complete', 
    videoName: string
  ) => {
    trackEngagement.videoInteraction(action, videoName);
  }, []);

  // Track ecommerce events
  const trackViewItem = useCallback((
    productId: string, 
    productName: string, 
    category: string, 
    price: number
  ) => {
    trackEcommerce.viewItem(productId, productName, category, price);
  }, []);

  const trackAddToCart = useCallback((
    productId: string, 
    productName: string, 
    price: number, 
    quantity: number = 1
  ) => {
    trackEcommerce.addToCart(productId, productName, price, quantity);
  }, []);

  const trackPurchase = useCallback((
    transactionId: string, 
    value: number, 
    items: Array<{
      id: string;
      name: string;
      category: string;
      price: number;
      quantity: number;
    }>
  ) => {
    trackEcommerce.purchase(transactionId, value, items);
  }, []);

  // Track custom events
  const trackCustomEvent = useCallback((
    action: string,
    category: string,
    label?: string,
    value?: number,
    customParameters?: Record<string, any>
  ) => {
    trackEventWithConsent(action, category, label, value, customParameters);
  }, []);

  // Track errors
  const trackError = useCallback((
    errorType: string, 
    errorMessage: string
  ) => {
    trackUserBehavior.error(errorType, errorMessage, pathname || '/');
  }, [pathname]);

  // Track navigation
  const trackNavigation = useCallback((toPage: string) => {
    trackUserBehavior.navigation(pathname || '/', toPage);
  }, [pathname]);

  // Track search
  const trackSearch = useCallback((searchTerm: string, resultsCount: number) => {
    trackUserBehavior.search(searchTerm, resultsCount);
  }, []);

  return {
    // Page tracking
    trackPageView: trackPageViewWithConsent,
    
    // Engagement tracking
    trackButtonClick,
    trackFormSubmission,
    trackProductView,
    trackPartnershipInquiry,
    trackTeamMemberClick,
    trackVideoInteraction,
    trackSectionView,
    
    // Ecommerce tracking
    trackViewItem,
    trackAddToCart,
    trackPurchase,
    
    // User behavior tracking
    trackNavigation,
    trackSearch,
    trackError,
    
    // Custom event tracking
    trackCustomEvent,
  };
}; 