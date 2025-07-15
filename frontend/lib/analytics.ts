// Google Analytics 4 Configuration
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// Google Analytics Measurement ID
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Initialize Google Analytics
export const initGA = () => {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID) {
    return;
  }

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];

  // Initialize gtag function
  window.gtag = function() {
    window.dataLayer.push(arguments);
  };

  // Set initial timestamp
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_title: document.title,
    page_location: window.location.href,
    send_page_view: false, // We'll handle page views manually
  });
};

// Track page views
export const trackPageView = (url: string, title?: string) => {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID) {
    return;
  }

  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
    page_title: title || document.title,
    page_location: window.location.origin + url,
  });
};

// Track custom events
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number,
  customParameters?: Record<string, any>
) => {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID) {
    return;
  }

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
    ...customParameters,
  });
};

// Track user engagement events
export const trackEngagement = {
  // Button clicks
  buttonClick: (buttonName: string, location: string) => {
    trackEvent('button_click', 'engagement', buttonName, undefined, {
      button_location: location,
    });
  },

  // Form submissions
  formSubmission: (formName: string, success: boolean) => {
    trackEvent('form_submit', 'engagement', formName, undefined, {
      form_success: success,
    });
  },

  // Product interactions
  productView: (productName: string, category: string) => {
    trackEvent('product_view', 'ecommerce', productName, undefined, {
      product_category: category,
    });
  },

  // Partnership form
  partnershipInquiry: (source: string) => {
    trackEvent('partnership_inquiry', 'business', source);
  },

  // Team member clicks
  teamMemberClick: (memberName: string, platform: string) => {
    trackEvent('team_member_click', 'social', memberName, undefined, {
      social_platform: platform,
    });
  },

  // Scroll depth
  scrollDepth: (depth: number) => {
    trackEvent('scroll_depth', 'engagement', `${depth}%`, depth);
  },

  // Time on page
  timeOnPage: (seconds: number, page: string) => {
    trackEvent('time_on_page', 'engagement', page, seconds);
  },

  // Video interactions
  videoInteraction: (action: 'play' | 'pause' | 'complete', videoName: string) => {
    trackEvent('video_interaction', 'media', videoName, undefined, {
      video_action: action,
    });
  },
};

// Track ecommerce events
export const trackEcommerce = {
  // Product views
  viewItem: (productId: string, productName: string, category: string, price: number) => {
    trackEvent('view_item', 'ecommerce', productName, undefined, {
      item_id: productId,
      item_category: category,
      value: price,
      currency: 'INR',
    });
  },

  // Add to cart
  addToCart: (productId: string, productName: string, price: number, quantity: number = 1) => {
    trackEvent('add_to_cart', 'ecommerce', productName, undefined, {
      item_id: productId,
      value: price * quantity,
      quantity: quantity,
      currency: 'INR',
    });
  },

  // Purchase
  purchase: (transactionId: string, value: number, items: Array<{
    id: string;
    name: string;
    category: string;
    price: number;
    quantity: number;
  }>) => {
    trackEvent('purchase', 'ecommerce', transactionId, undefined, {
      transaction_id: transactionId,
      value: value,
      currency: 'INR',
      items: items,
    });
  },
};

// Track user behavior
export const trackUserBehavior = {
  // Section visibility
  sectionView: (sectionName: string) => {
    trackEvent('section_view', 'user_behavior', sectionName);
  },

  // Navigation
  navigation: (fromPage: string, toPage: string) => {
    trackEvent('navigation', 'user_behavior', `${fromPage} -> ${toPage}`);
  },

  // Search
  search: (searchTerm: string, resultsCount: number) => {
    trackEvent('search', 'user_behavior', searchTerm, resultsCount);
  },

  // Error tracking
  error: (errorType: string, errorMessage: string, page: string) => {
    trackEvent('error', 'user_behavior', errorType, undefined, {
      error_message: errorMessage,
      page: page,
    });
  },
};

// Privacy-compliant tracking (respects cookie consent)
export const trackWithConsent = (trackingFunction: () => void) => {
  if (typeof window === 'undefined') return;

  const hasConsented = localStorage.getItem('emilio-beaufort-cookies-consent') === 'accepted';
  
  if (hasConsented) {
    trackingFunction();
  }
};

// Enhanced page view tracking with consent
export const trackPageViewWithConsent = (url: string, title?: string) => {
  trackWithConsent(() => {
    trackPageView(url, title);
  });
};

// Enhanced event tracking with consent
export const trackEventWithConsent = (
  action: string,
  category: string,
  label?: string,
  value?: number,
  customParameters?: Record<string, any>
) => {
  trackWithConsent(() => {
    trackEvent(action, category, label, value, customParameters);
  });
}; 