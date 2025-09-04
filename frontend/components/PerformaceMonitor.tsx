'use client';

import { useEffect } from 'react';

export default function PerformanceMonitor() {
	useEffect(() => {
		if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
			// Largest Contentful Paint (LCP)
			const lcpObserver = new PerformanceObserver((list) => {
				const entries = list.getEntries();
				const lastEntry = entries[entries.length - 1];
				// Avoid noisy console logs; send to analytics if configured
				if (window.gtag && lastEntry) {
					window.gtag('event', 'LCP', {
						value: Math.round(lastEntry.startTime),
						event_category: 'Web Vitals',
						event_label: window.location.pathname,
					});
				}
			});
			lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

			// First Input Delay (FID)
			const fidObserver = new PerformanceObserver((list) => {
				for (const entry of list.getEntries()) {
					// Guard for PerformanceEventTiming
					const anyEntry = entry as any;
					const hasProcessingStart = typeof anyEntry?.processingStart === 'number';
					if (!hasProcessingStart) continue;
					const fid = anyEntry.processingStart - entry.startTime;
					if (window.gtag) {
						window.gtag('event', 'FID', {
							value: Math.round(fid),
							event_category: 'Web Vitals',
							event_label: window.location.pathname,
						});
					}
				}
			});
			fidObserver.observe({ entryTypes: ['first-input'] });

			// Cumulative Layout Shift (CLS)
			let clsValue = 0;
			const clsObserver = new PerformanceObserver((list) => {
				for (const entry of list.getEntries() as any[]) {
					if (!entry?.hadRecentInput) {
						clsValue += entry?.value ?? 0;
					}
				}
				if (window.gtag) {
					window.gtag('event', 'CLS', {
						value: Math.round(clsValue * 1000) / 1000,
						event_category: 'Web Vitals',
						event_label: window.location.pathname,
					});
				}
			});
			clsObserver.observe({ entryTypes: ['layout-shift'] });

			// Time to First Byte (TTFB)
			const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
			if (navigationEntry && window.gtag) {
				const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
				window.gtag('event', 'TTFB', {
					value: Math.round(ttfb),
					event_category: 'Web Vitals',
					event_label: window.location.pathname,
				});
			}

			return () => {
				lcpObserver.disconnect();
				fidObserver.disconnect();
				clsObserver.disconnect();
			};
		}
	}, []);

	return null;
}
