/**
 * JWT decoder utility for zkLogin
 */
export interface JWTPayload {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
  aud: string;
  iss: string;
  iat: number;
  exp: number;
  nonce?: string;
  [key: string]: any;
}

/**
 * Base64 URL decode (JWT standard) - Fixed implementation
 */
function base64UrlDecode(str: string): string {
  try {
    // Remove any whitespace
    let cleanStr = str.trim();
    
    // Add padding if needed
    while (cleanStr.length % 4) {
      cleanStr += '=';
    }
    
    // Replace URL-safe characters with standard base64 characters
    const base64 = cleanStr.replace(/-/g, '+').replace(/_/g, '/');
    
    // Decode using atob
    const decoded = atob(base64);
    return decoded;
  } catch (error) {
    console.error('Base64 decode error:', error);
    console.error('Input string:', str);
    throw new Error(`Invalid base64 encoding: ${error}`);
  }
}

/**
 * Alternative base64 URL decode using manual implementation
 */
function manualBase64UrlDecode(str: string): string {
  try {
    // Base64 character set
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    
    // Clean and pad the string
    let cleanStr = str.trim().replace(/-/g, '+').replace(/_/g, '/');
    while (cleanStr.length % 4) {
      cleanStr += '=';
    }
    
    let result = '';
    let buffer = 0;
    let bits = 0;
    
    for (let i = 0; i < cleanStr.length; i++) {
      const char = cleanStr[i];
      if (char === '=') break;
      
      const index = chars.indexOf(char);
      if (index === -1) {
        throw new Error(`Invalid character: ${char}`);
      }
      
      buffer = (buffer << 6) | index;
      bits += 6;
      
      if (bits >= 8) {
        bits -= 8;
        result += String.fromCharCode((buffer >> bits) & 0xFF);
      }
    }
    
    return result;
  } catch (error) {
    throw new Error(`Manual base64 decode failed: ${error}`);
  }
}

/**
 * Decode JWT token without verification (client-side only)
 */
export function jwtDecode(jwt: string): JWTPayload {
  try {
    if (!jwt || typeof jwt !== 'string') {
      throw new Error('JWT must be a non-empty string');
    }

    const parts = jwt.split('.');
    if (parts.length !== 3) {
      throw new Error(`Invalid JWT format - expected 3 parts, got ${parts.length}`);
    }

    const [header, payload, signature] = parts;
    
    if (!payload) {
      throw new Error('JWT payload is empty');
    }

    console.log('Decoding JWT payload:', payload);
    
    let decodedPayload: string;
    
    // Try standard base64 URL decode first
    try {
      decodedPayload = base64UrlDecode(payload);
    } catch (error) {
      console.warn('Standard decode failed, trying manual decode:', error);
      // Fallback to manual implementation
      decodedPayload = manualBase64UrlDecode(payload);
    }
    
    console.log('Decoded payload string:', decodedPayload);
    
    const parsedPayload = JSON.parse(decodedPayload);
    console.log('Parsed payload object:', parsedPayload);
    
    return parsedPayload;
  } catch (error) {
    console.error('JWT decode error:', error);
    console.error('JWT input:', jwt);
    throw new Error('Failed to decode JWT: ' + (error as Error).message);
  }
}

/**
 * Validate JWT structure
 */
export function validateJWTStructure(jwt: string): boolean {
  try {
    if (!jwt || typeof jwt !== 'string') return false;
    
    const parts = jwt.split('.');
    if (parts.length !== 3) return false;
    
    // Try to decode header and payload
    base64UrlDecode(parts[0]);
    base64UrlDecode(parts[1]);
    
    // Try to parse payload as JSON
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    
    // Check for required fields
    return !!(payload.sub && payload.iss && payload.aud);
  } catch (error) {
    console.error('JWT validation error:', error);
    return false;
  }
}

/**
 * Extract issuer from JWT
 */
export function getJWTIssuer(jwt: string): string {
  try {
    const payload = jwtDecode(jwt);
    return payload.iss || '';
  } catch {
    return '';
  }
}

/**
 * Check if JWT is expired
 */
export function isJWTExpired(jwt: string): boolean {
  try {
    const payload = jwtDecode(jwt);
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  } catch {
    return true;
  }
}
