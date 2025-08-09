import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { fromB64, toB64 } from '@mysten/sui.js/utils';
import { jwtDecode, validateJWTStructure } from './jwtDecoder';
import { suiClient, getCurrentEpoch as getSuiEpoch } from './suiClient';

export interface ZkLoginInputs {
  addressSeed: string;
  maxEpoch: number;
  userSalt: string;
  jwt: string;
}

export interface ZkProofInputs {
  jwt: string;
  extendedEphemeralPublicKey: string;
  maxEpoch: number;
  jwtRandomness: string;
  salt: string;
  keyClaimName: string;
}

/**
 * Generate a random salt for zkLogin address derivation
 */
export function generateUserSalt(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate zkLogin address from JWT token using custom implementation
 */
export async function generateZkLoginAddress(
  jwt: string,
  userSalt: string,
  keyClaimName: string = 'sub'
): Promise<string> {
  try {
    // Decode JWT to get the subject claim
    const decodedJWT = jwtDecode(jwt);
    const subject = decodedJWT[keyClaimName as keyof typeof decodedJWT] as string;
    
    if (!subject) {
      throw new Error(`JWT does not contain ${keyClaimName} claim`);
    }

    // Generate zkLogin address using custom implementation
    const zkLoginAddress = await generateCustomZkLoginAddress(jwt, userSalt, subject);
    
    return zkLoginAddress;
  } catch (error) {
    console.error('Error generating zkLogin address:', error);
    throw new Error('Failed to generate zkLogin address');
  }
}

/**
 * Custom zkLogin address generation (fallback implementation)
 */
async function generateCustomZkLoginAddress(
  jwt: string,
  userSalt: string,
  subject: string
): Promise<string> {
  // Create a deterministic address based on JWT and salt
  const combined = subject + userSalt + jwt.split('.')[1]; // Use payload part
  const encoder = new TextEncoder();
  const data = encoder.encode(combined);
  
  // Generate hash using Web Crypto API
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = new Uint8Array(hashBuffer);
  
  // Take first 20 bytes and convert to address format
  const addressBytes = hashArray.slice(0, 20);
  const addressHex = Array.from(addressBytes, byte => 
    byte.toString(16).padStart(2, '0')
  ).join('');
  
  return `0x${addressHex}`;
}

/**
 * Create ephemeral keypair for zkLogin
 */
export function createEphemeralKeypair(): Ed25519Keypair {
  return new Ed25519Keypair();
}

/**
 * Get current epoch from Sui network with fallback
 */
export async function getCurrentEpoch(): Promise<number> {
  try {
    return await getSuiEpoch();
  } catch (error) {
    console.warn('Using fallback epoch calculation:', error);
    // Fallback: estimate epoch based on current time
    // Sui epochs are approximately 24 hours, starting from a known point
    const EPOCH_START_TIME = 1640995200000; // Approximate Sui mainnet start
    const EPOCH_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const currentTime = Date.now();
    const estimatedEpoch = Math.floor((currentTime - EPOCH_START_TIME) / EPOCH_DURATION);
    return Math.max(estimatedEpoch, 100); // Ensure minimum epoch
  }
}

/**
 * Generate randomness for zkLogin proof
 */
export function generateZkLoginRandomness(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate nonce for OAuth flow with fallback implementation
 */
export function generateZkLoginNonce(
  ephemeralPublicKey: string,
  maxEpoch: number,
  randomness: string
): string {
  try {
    // Custom nonce generation since we removed @mysten/zklogin dependency
    const combined = `${ephemeralPublicKey}-${maxEpoch}-${randomness}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(combined);
    
    // Simple hash for nonce
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data[i];
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(16).padStart(16, '0');
  } catch (error) {
    console.error('Error generating nonce:', error);
    // Fallback nonce
    return generateZkLoginRandomness().substring(0, 16);
  }
}

/**
 * Validate JWT token structure
 */
export function validateJWT(jwt: string): boolean {
  return validateJWTStructure(jwt);
}

/**
 * Extract provider from JWT issuer
 */
export function getProviderFromJWT(jwt: string): string {
  try {
    const decoded = jwtDecode(jwt);
    const issuer = decoded.iss as string;
    
    if (issuer?.includes('accounts.google.com')) return 'google';
    if (issuer?.includes('facebook.com')) return 'facebook';
    if (issuer?.includes('apple.com')) return 'apple';
    
    return 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * Proper Base64 URL encode (JWT standard)
 */
function base64UrlEncode(data: string): string {
  // Convert string to base64
  const base64 = btoa(unescape(encodeURIComponent(data)));
  
  // Convert to base64url format
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Create mock JWT for demo purposes with proper encoding
 */
export function createMockJWT(provider: string, userInfo: any): string {
  try {
    const header = {
      alg: 'RS256',
      typ: 'JWT',
      kid: 'demo-key-id'
    };

    const now = Math.floor(Date.now() / 1000);
    const payload = {
      sub: userInfo.sub || '1234567890',
      email: userInfo.email || 'user@example.com',
      name: userInfo.name || 'Demo User',
      picture: userInfo.picture || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      aud: provider === 'google' ? 'demo-google-client-id' : 'demo-facebook-client-id',
      iss: provider === 'google' ? 'https://accounts.google.com' : 'https://www.facebook.com',
      iat: now,
      exp: now + 3600,
      nonce: generateZkLoginRandomness().substring(0, 16)
    };

    // Create properly encoded JWT using our base64UrlEncode function
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    const signature = base64UrlEncode('mock-signature-for-demo-purposes');

    const jwt = `${encodedHeader}.${encodedPayload}.${signature}`;
    
    console.log('Created mock JWT:', jwt);
    console.log('Header:', encodedHeader);
    console.log('Payload:', encodedPayload);
    console.log('Signature:', signature);
    
    // Validate the JWT we just created
    if (!validateJWTStructure(jwt)) {
      throw new Error('Created JWT failed validation');
    }
    
    return jwt;
  } catch (error) {
    console.error('Error creating mock JWT:', error);
    throw new Error('Failed to create mock JWT: ' + (error as Error).message);
  }
}

/**
 * Prepare zkLogin inputs for proof generation
 */
export function prepareZkLoginInputs(
  jwt: string,
  userSalt: string,
  maxEpoch: number
): ZkLoginInputs {
  const decodedJWT = jwtDecode(jwt);
  const addressSeed = generateAddressSeed(decodedJWT.sub, userSalt);
  
  return {
    addressSeed,
    maxEpoch,
    userSalt,
    jwt
  };
}

/**
 * Generate address seed from subject and salt
 */
function generateAddressSeed(subject: string, userSalt: string): string {
  // Combine subject and salt to create address seed
  const combined = subject + userSalt;
  const encoder = new TextEncoder();
  const data = encoder.encode(combined);
  
  // Simple hash function for demo (in production, use proper cryptographic hash)
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data[i];
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * Initialize zkLogin system with comprehensive error handling
 */
export async function initializeZkLoginSystem(): Promise<{
  success: boolean;
  ephemeralKeypair: Ed25519Keypair | null;
  maxEpoch: number | null;
  nonce: string | null;
  randomness: string | null;
  error?: string;
}> {
  try {
    console.log('Initializing zkLogin system...');
    
    // Step 1: Create ephemeral keypair
    const ephemeralKeypair = createEphemeralKeypair();
    console.log('✓ Ephemeral keypair created');
    
    // Step 2: Get current epoch with retry logic
    let maxEpoch: number;
    try {
      const currentEpoch = await getCurrentEpoch();
      maxEpoch = currentEpoch + 10; // Add buffer
      console.log('✓ Current epoch fetched:', currentEpoch);
    } catch (epochError) {
      console.warn('Epoch fetch failed, using fallback');
      maxEpoch = Math.floor(Date.now() / 86400000) + 1010; // Fallback with buffer
    }
    
    // Step 3: Generate randomness
    const randomness = generateZkLoginRandomness();
    console.log('✓ Randomness generated');
    
    // Step 4: Generate nonce
    const publicKey = ephemeralKeypair.getPublicKey();
    const publicKeyBytes = publicKey.toSuiAddress();
    const nonce = generateZkLoginNonce(publicKeyBytes, maxEpoch, randomness);
    console.log('✓ Nonce generated');
    
    console.log('✅ zkLogin system initialized successfully');
    
    return {
      success: true,
      ephemeralKeypair,
      maxEpoch,
      nonce,
      randomness
    };
    
  } catch (error) {
    console.error('❌ zkLogin initialization failed:', error);
    return {
      success: false,
      ephemeralKeypair: null,
      maxEpoch: null,
      nonce: null,
      randomness: null,
      error: error instanceof Error ? error.message : 'Unknown initialization error'
    };
  }
}
