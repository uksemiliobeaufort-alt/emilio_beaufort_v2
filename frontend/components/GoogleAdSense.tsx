"use client";

import { useEffect } from 'react';

interface GoogleAdSenseProps {
  adSlot?: string;
  adFormat?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
  adLayout?: 'in-article' | 'in-feed' | 'auto';
  style?: React.CSSProperties;
  className?: string;
}

export default function GoogleAdSense({ 
  adSlot, 
  adFormat = 'fluid', 
  adLayout = 'in-article',
  style = {}, 
  className = '' 
}: GoogleAdSenseProps) {
  useEffect(() => {
    // Load Google AdSense script if not already loaded
    if (typeof window !== 'undefined' && !window.adsbygoogle) {
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5512739027608050';
      script.async = true;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }

    // Initialize ads after script loads
    const initAds = () => {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (error) {
          console.error('AdSense initialization error:', error);
        }
      }
    };

    // Wait for script to load
    const timer = setTimeout(initAds, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!adSlot) {
    return null;
  }

  return (
    <div className={`ad-container ${className}`} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', textAlign: 'center' }}
        data-ad-layout={adLayout}
        data-ad-format={adFormat}
        data-ad-client="ca-pub-5512739027608050"
        data-ad-slot={adSlot}
      />
    </div>
  );
}

// Blog-specific ad components using the in-article ad unit
export function BlogHeaderAd() {
  return (
    <div className="my-8">
      <GoogleAdSense 
        adSlot="8173362196" 
        adFormat="fluid"
        adLayout="in-article"
        className="text-center"
      />
    </div>
  );
}

export function BlogContentAd() {
  return (
    <div className="my-12">
      <GoogleAdSense 
        adSlot="8173362196" 
        adFormat="fluid"
        adLayout="in-article"
        className="text-center"
      />
    </div>
  );
}

export function BlogSidebarAd() {
  return (
    <div className="my-6">
      <GoogleAdSense 
        adSlot="8173362196" 
        adFormat="fluid"
        adLayout="in-article"
        className="text-center"
        style={{ minHeight: '250px' }}
      />
    </div>
  );
}

export function BlogFooterAd() {
  return (
    <div className="my-8">
      <GoogleAdSense 
        adSlot="8173362196" 
        adFormat="fluid"
        adLayout="in-article"
        className="text-center"
      />
    </div>
  );
}
