// Facebook Pixel Event Tracking Utilities
// Pixel ID: 891353906448808

declare global {
  interface Window {
    fbq: any;
  }
}

export const fbPixel = {
  // Track page views
  pageView: () => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'PageView');
    }
  },

  // Track when user views content (product details)
  viewContent: (data?: {
    content_name?: string;
    content_category?: string;
    content_ids?: string[];
    content_type?: string;
    value?: number;
    currency?: string;
  }) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'ViewContent', data);
    }
  },

  // Track when user adds item to cart
  addToCart: (data?: {
    content_name?: string;
    content_ids?: string[];
    content_type?: string;
    value?: number;
    currency?: string;
  }) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'AddToCart', data);
    }
  },

  // Track when user adds item to wishlist
  addToWishlist: (data?: {
    content_name?: string;
    content_ids?: string[];
    content_category?: string;
    value?: number;
    currency?: string;
  }) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'AddToWishlist', data);
    }
  },

  // Track when user initiates checkout
  initiateCheckout: (data?: {
    content_ids?: string[];
    contents?: Array<{ id: string; quantity: number }>;
    num_items?: number;
    value?: number;
    currency?: string;
  }) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'InitiateCheckout', data);
    }
  },

  // Track purchase completion
  purchase: (data?: {
    content_ids?: string[];
    contents?: Array<{ id: string; quantity: number }>;
    value?: number;
    currency?: string;
    num_items?: number;
  }) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Purchase', data);
    }
  },

  // Track search
  search: (data?: {
    search_string?: string;
    content_category?: string;
    content_ids?: string[];
  }) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Search', data);
    }
  },

  // Track registration/signup
  completeRegistration: (data?: {
    content_name?: string;
    status?: string;
    value?: number;
    currency?: string;
  }) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'CompleteRegistration', data);
    }
  },

  // Track lead generation
  lead: (data?: {
    content_name?: string;
    content_category?: string;
    value?: number;
    currency?: string;
  }) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Lead', data);
    }
  },

  // Custom event tracking
  trackCustom: (eventName: string, data?: any) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('trackCustom', eventName, data);
    }
  },
};
