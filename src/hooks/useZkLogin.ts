import { useState, useCallback, useEffect } from 'react';
import { 
  generateZkLoginAddress, 
  generateUserSalt, 
  createMockJWT, 
  validateJWT,
  getProviderFromJWT 
} from '../utils/zklogin';

export interface UserInfo {
  sub: string;
  email: string;
  name: string;
  picture: string;
  provider: string;
}

export interface UseZkLoginReturn {
  isAuthenticated: boolean;
  userInfo: UserInfo | null;
  address: string | null;
  loading: boolean;
  error: string | null;
  initiateLogin: (provider: 'google' | 'facebook') => Promise<void>;
  logout: () => void;
}

export function useZkLogin(): UseZkLoginReturn {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('zklogin_session');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        setIsAuthenticated(true);
        setUserInfo(session.userInfo);
        setAddress(session.address);
      } catch (err) {
        console.error('Failed to restore session:', err);
        localStorage.removeItem('zklogin_session');
      }
    }
  }, []);

  const initiateLogin = useCallback(async (provider: 'google' | 'facebook') => {
    setLoading(true);
    setError(null);

    try {
      // In a real implementation, this would redirect to OAuth provider
      // For demo purposes, we'll simulate the OAuth flow
      
      // Simulate OAuth redirect delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Create mock user data based on provider
      const mockUserData = {
        sub: `${provider}_${Date.now()}`,
        email: provider === 'google' ? 'user@gmail.com' : 'user@facebook.com',
        name: provider === 'google' ? 'Google User' : 'Facebook User',
        picture: provider === 'google' 
          ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
      };

      // Create mock JWT token
      const jwt = createMockJWT(provider, mockUserData);
      
      // Validate JWT structure
      if (!validateJWT(jwt)) {
        throw new Error('Invalid JWT token received');
      }

      // Generate user salt for address derivation
      const userSalt = generateUserSalt();
      
      // Generate zkLogin address
      const zkAddress = await generateZkLoginAddress(jwt, userSalt);

      const user: UserInfo = {
        ...mockUserData,
        provider: getProviderFromJWT(jwt)
      };

      // Save session
      const session = {
        userInfo: user,
        address: zkAddress,
        jwt,
        userSalt,
        timestamp: Date.now()
      };
      
      localStorage.setItem('zklogin_session', JSON.stringify(session));

      // Update state
      setUserInfo(user);
      setAddress(zkAddress);
      setIsAuthenticated(true);

    } catch (err) {
      console.error('Login failed:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('zklogin_session');
    setIsAuthenticated(false);
    setUserInfo(null);
    setAddress(null);
    setError(null);
  }, []);

  return {
    isAuthenticated,
    userInfo,
    address,
    loading,
    error,
    initiateLogin,
    logout
  };
}
