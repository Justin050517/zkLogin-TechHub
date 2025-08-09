/**
 * OAuth configuration for zkLogin
 */

// Google OAuth Configuration
export const GOOGLE_CONFIG = {
  CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id.apps.googleusercontent.com',
  REDIRECT_URI: `${window.location.origin}/auth/callback`,
  SCOPES: 'openid email profile',
  RESPONSE_TYPE: 'code',
};

// Facebook OAuth Configuration (for future use)
export const FACEBOOK_CONFIG = {
  CLIENT_ID: import.meta.env.VITE_FACEBOOK_CLIENT_ID || 'your-facebook-client-id',
  REDIRECT_URI: `${window.location.origin}/auth/callback`,
  SCOPES: 'openid email',
  RESPONSE_TYPE: 'code',
};

/**
 * Build Google OAuth URL
 */
export function buildGoogleAuthUrl(nonce: string): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_CONFIG.CLIENT_ID,
    redirect_uri: GOOGLE_CONFIG.REDIRECT_URI,
    response_type: GOOGLE_CONFIG.RESPONSE_TYPE,
    scope: GOOGLE_CONFIG.SCOPES,
    nonce,
    access_type: 'offline',
    prompt: 'consent',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Build Facebook OAuth URL
 */
export function buildFacebookAuthUrl(nonce: string): string {
  const params = new URLSearchParams({
    client_id: FACEBOOK_CONFIG.CLIENT_ID,
    redirect_uri: FACEBOOK_CONFIG.REDIRECT_URI,
    response_type: FACEBOOK_CONFIG.RESPONSE_TYPE,
    scope: FACEBOOK_CONFIG.SCOPES,
    nonce,
  });

  return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
}

/**
 * Validate OAuth configuration
 */
export function validateOAuthConfig(): {
  google: boolean;
  facebook: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  const googleValid = GOOGLE_CONFIG.CLIENT_ID !== 'your-google-client-id.apps.googleusercontent.com' 
    && GOOGLE_CONFIG.CLIENT_ID.includes('.apps.googleusercontent.com');
  
  const facebookValid = FACEBOOK_CONFIG.CLIENT_ID !== 'your-facebook-client-id' 
    && FACEBOOK_CONFIG.CLIENT_ID.length > 10;

  if (!googleValid) {
    errors.push('Google Client ID not configured properly');
  }
  
  if (!facebookValid) {
    errors.push('Facebook Client ID not configured properly');
  }

  return {
    google: googleValid,
    facebook: facebookValid,
    errors
  };
}
