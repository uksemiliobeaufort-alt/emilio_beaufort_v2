// tracking.ts - Custom analytics tracking utility

// Generate or get a persistent anonymous user ID
export function getOrCreateUserId() {
  let userId = localStorage.getItem('emilio-user-id');
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem('emilio-user-id', userId);
  }
  return userId;
}

// Send a tracking event to the backend
export async function trackEvent(event_type: string, event_data: Record<string, any> = {}) {
  const user_id = getOrCreateUserId();
  try {
    await fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id, event_type, event_data }),
    });
  } catch (e) {
    // Silently fail
  }
}

// Track a page view
export function trackPageView(pagePath?: string) {
  trackEvent('page_view', { page: pagePath || window.location.pathname });
} 