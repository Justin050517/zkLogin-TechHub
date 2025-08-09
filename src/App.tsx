import React, { useState, useEffect } from 'react';
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { LogIn, User, Shield, CheckCircle, AlertCircle, Loader, Settings, Copy, ExternalLink } from 'lucide-react';
import {
    generateZkLoginAddress,
    generateUserSalt,
    generateZkLoginRandomness,
    generateZkLoginNonce,
    createEphemeralKeypair,
    getCurrentEpoch,
    validateJWT,
    getProviderFromJWT,
    createMockJWT,
    initializeZkLoginSystem
} from './utils/zklogin';
import { jwtDecode } from './utils/jwtDecoder';
import { buildGoogleAuthUrl, validateOAuthConfig } from './config/oauth';

interface ZkLoginState {
    isAuthenticated: boolean;
    userAddress: string | null;
    userInfo: {
        email: string;
        name: string;
        picture: string;
        provider: string;
    } | null;
    ephemeralKeyPair: Ed25519Keypair | null;
    userSalt: string | null;
    jwt: string | null;
}

function App() {
    const [zkLoginState, setZkLoginState] = useState<ZkLoginState>({
        isAuthenticated: false,
        userAddress: null,
        userInfo: null,
        ephemeralKeyPair: null,
        userSalt: null,
        jwt: null,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [demoMode, setDemoMode] = useState(false);
    const [showConfig, setShowConfig] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const [imageError, setImageError] = useState(false);

    const suiClient = new SuiClient({ url: getFullnodeUrl('testnet') });

    useEffect(() => {
        // Check for authentication callback
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
            handleAuthCallback(code);
        }

        // Load saved session
        loadSavedSession();
    }, []);

    const loadSavedSession = () => {
        try {
            const savedSession = localStorage.getItem('zklogin_session');
            if (savedSession) {
                const session = JSON.parse(savedSession);
                if (session.userAddress && session.userInfo) {
                    setZkLoginState(prev => ({
                        ...prev,
                        isAuthenticated: true,
                        userAddress: session.userAddress,
                        userInfo: session.userInfo,
                    }));
                }
            }
        } catch (error) {
            console.error('Error loading saved session:', error);
        }
    };

    const saveSession = (address: string, userInfo: any) => {
        const session = {
            userAddress: address,
            userInfo,
            timestamp: Date.now(),
        };
        localStorage.setItem('zklogin_session', JSON.stringify(session));
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const openInExplorer = () => {
        if (zkLoginState.userAddress) {
            window.open(`https://suiexplorer.com/address/${zkLoginState.userAddress}?network=testnet`, '_blank');
        }
    };

    const handleImageError = () => {
        setImageError(true);
    };

    const getProfileImageUrl = (picture: string | undefined) => {
        if (!picture || imageError) {
            return 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face';
        }

        // For Google profile pictures, ensure we get a high-quality version
        if (picture.includes('googleusercontent.com')) {
            // Remove size parameters and add our own for better quality
            const baseUrl = picture.split('=')[0];
            return `${baseUrl}=s150-c`;
        }

        return picture;
    };

    const initiateZkLogin = async () => {
        try {
            setLoading(true);
            setError(null);

            // Check OAuth configuration
            const oauthConfig = validateOAuthConfig();
            if (!oauthConfig.google) {
                throw new Error('Google OAuth not configured. Please check your VITE_GOOGLE_CLIENT_ID in .env file.');
            }

            // Initialize zkLogin system
            const initResult = await initializeZkLoginSystem();

            if (!initResult.success) {
                throw new Error(initResult.error || 'Failed to initialize zkLogin system');
            }

            const { ephemeralKeypair, maxEpoch, nonce, randomness } = initResult;

            // Store ephemeral key pair and randomness
            localStorage.setItem('ephemeral_keypair', JSON.stringify({
                privateKey: ephemeralKeypair!.getSecretKey(),
                publicKey: ephemeralKeypair!.getPublicKey().toSuiBytes(),
                randomness,
                maxEpoch,
            }));

            // Redirect to Google OAuth using configured URL
            const googleAuthUrl = buildGoogleAuthUrl(nonce!);
            console.log('Redirecting to Google OAuth:', googleAuthUrl);

            window.location.href = googleAuthUrl;
        } catch (error) {
            console.error('Error initiating zkLogin:', error);
            setError('Failed to initiate authentication: ' + (error as Error).message);
            setLoading(false);
        }
    };

    const handleAuthCallback = async (code: string) => {
        try {
            setLoading(true);
            setError(null);

            // Exchange code for JWT token
            const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                    client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '', // Should be handled server-side
                    code,
                    grant_type: 'authorization_code',
                    redirect_uri: `${window.location.origin}/auth/callback`,
                }),
            });

            const tokenData = await tokenResponse.json();

            if (tokenData.error) {
                throw new Error(`OAuth error: ${tokenData.error_description || tokenData.error}`);
            }

            const jwt = tokenData.id_token;

            if (!jwt) {
                throw new Error('No JWT token received from Google');
            }

            await processJWTAuthentication(jwt);
        } catch (error) {
            console.error('Error handling auth callback:', error);
            setError('Authentication failed: ' + (error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = async () => {
        try {
            setLoading(true);
            setError(null);
            setDemoMode(true);

            console.log('Starting demo login...');

            // Create mock JWT for demo
            const mockUserInfo = {
                sub: 'demo_user_123',
                email: 'demo@example.com',
                name: 'Demo User',
                picture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
            };

            console.log('Creating mock JWT with user info:', mockUserInfo);
            const mockJWT = createMockJWT('google', mockUserInfo);
            console.log('Mock JWT created successfully');

            await processJWTAuthentication(mockJWT);
        } catch (error) {
            console.error('Error in demo login:', error);
            setError('Demo login failed: ' + (error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const processJWTAuthentication = async (jwt: string) => {
        try {
            console.log('Processing JWT authentication...');
            console.log('JWT received:', jwt);

            // Validate JWT structure first
            if (!validateJWT(jwt)) {
                throw new Error('Invalid JWT format');
            }
            console.log('JWT validation passed');

            // Decode JWT to get user info using our custom decoder
            console.log('Decoding JWT payload...');
            const jwtPayload = jwtDecode(jwt);
            console.log('JWT payload decoded:', jwtPayload);

            // Extract user information with better fallbacks
            const userInfo = {
                email: jwtPayload.email || jwtPayload.email_verified || 'demo@example.com',
                name: jwtPayload.name || jwtPayload.given_name || jwtPayload.family_name || 'Demo User',
                picture: jwtPayload.picture || jwtPayload.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
                provider: getProviderFromJWT(jwt),
            };

            console.log('User info extracted:', userInfo);
            console.log('Profile picture URL:', userInfo.picture);

            // Generate user salt (in production, this should be consistent per user)
            const userSalt = generateUserSalt();
            console.log('User salt generated');

            // Generate zkLogin address
            console.log('Generating zkLogin address...');
            const zkLoginAddress = await generateZkLoginAddress(jwt, userSalt);
            console.log('zkLogin address generated:', zkLoginAddress);

            // Reset image error state for new login
            setImageError(false);

            // Update state
            setZkLoginState({
                isAuthenticated: true,
                userAddress: zkLoginAddress,
                userInfo,
                ephemeralKeyPair: null, // Clear sensitive data
                userSalt,
                jwt,
            });

            // Save session
            saveSession(zkLoginAddress, userInfo);
            console.log('Session saved successfully');

            // Clear URL parameters
            window.history.replaceState({}, document.title, window.location.pathname);

            console.log('JWT authentication completed successfully');
        } catch (error) {
            console.error('JWT processing error details:', error);
            throw new Error('JWT processing failed: ' + (error as Error).message);
        }
    };

    const logout = () => {
        setZkLoginState({
            isAuthenticated: false,
            userAddress: null,
            userInfo: null,
            ephemeralKeyPair: null,
            userSalt: null,
            jwt: null,
        });
        localStorage.removeItem('zklogin_session');
        localStorage.removeItem('ephemeral_keypair');
        setDemoMode(false);
        setImageError(false);
    };

    const oauthConfig = validateOAuthConfig();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12 relative">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
                        <div className="flex items-center justify-center mb-4">
                            <div className="relative">
                                <div className="absolute -inset-1 bg-cyan-500 rounded-full blur opacity-75 animate-pulse"></div>
                                <Shield className="relative w-12 h-12 text-cyan-400 mr-3 z-10" />
                            </div>
                            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
                                TECHHUB ZKLOGIN
                            </h1>
                            <button
                                onClick={() => setShowConfig(!showConfig)}
                                className="ml-4 p-2 text-cyan-400 hover:text-purple-400"
                                title="Configuration Status"
                            >
                                <Settings className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-xl text-gray-400">
                            Privacy-preserving authentication using <span className="text-cyan-400">zero-knowledge proofs</span>
                        </p>
                        <div className="mt-2 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
                    </div>

                    {/* Configuration Status */}
                    {showConfig && (
                        <div className="mb-8 p-6 bg-gray-800/80 backdrop-blur-sm rounded-lg border border-cyan-500/30 shadow-lg shadow-cyan-900/30">
                            <h3 className="text-lg font-semibold text-cyan-300 mb-4">OAuth Configuration Status</h3>
                            <div className="space-y-2">
                                <div className="flex items-center">
                                    {oauthConfig.google ? (
                                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                                    ) : (
                                        <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                                    )}
                                    <span className={oauthConfig.google ? 'text-green-400' : 'text-red-400'}>
                                        Google OAuth: {oauthConfig.google ? 'Configured' : 'Not Configured'}
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    {oauthConfig.facebook ? (
                                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                                    ) : (
                                        <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
                                    )}
                                    <span className={oauthConfig.facebook ? 'text-green-400' : 'text-yellow-400'}>
                                        Facebook OAuth: {oauthConfig.facebook ? 'Configured' : 'Not Configured (Optional)'}
                                    </span>
                                </div>
                            </div>
                            {oauthConfig.errors.length > 0 && (
                                <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-700 rounded">
                                    <p className="text-sm text-yellow-400">
                                        <strong>Setup Required:</strong> Check GOOGLE_OAUTH_SETUP.md for configuration instructions.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Main Content */}
                    <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-cyan-500/30 shadow-lg shadow-cyan-900/30 p-8 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-purple-500"></div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg flex items-center">
                                <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
                                <span className="text-red-300">{error}</span>
                            </div>
                        )}

                        {!zkLoginState.isAuthenticated ? (
                            <div className="text-center">
                                <div className="mb-8">
                                    <div className="relative mx-auto mb-6">
                                        <div className="absolute -inset-1 bg-cyan-500 rounded-full blur opacity-50 animate-pulse"></div>
                                        <User className="relative w-24 h-24 text-cyan-400 mx-auto z-10" />
                                    </div>
                                    <h2 className="text-2xl font-semibold text-cyan-300 mb-2">
                                        ACCESS THE NETWORK
                                    </h2>
                                    <p className="text-gray-400 mb-8">
                                        Sign in with your credentials to access the decentralized grid
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <button
                                        onClick={initiateZkLogin}
                                        disabled={loading || !oauthConfig.google}
                                        className="cyber-button relative inline-flex items-center px-8 py-4 bg-gray-900 border border-cyan-500 text-cyan-400 font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-cyan-900/30 hover:border-cyan-300 hover:text-cyan-300"
                                    >
                                        {loading ? (
                                            <Loader className="w-5 h-5 mr-3 animate-spin" />
                                        ) : (
                                            <LogIn className="w-5 h-5 mr-3" />
                                        )}
                                        {loading ? 'CONNECTING...' : 'SIGN IN WITH GOOGLE'}
                                    </button>

                                    {!oauthConfig.google && (
                                        <p className="text-sm text-red-500">
                                            Google OAuth not configured. Check setup instructions.
                                        </p>
                                    )}

                                    <div className="text-gray-500">or</div>

                                    <button
                                        onClick={handleDemoLogin}
                                        disabled={loading}
                                        className="cyber-button relative inline-flex items-center px-8 py-4 bg-gray-900 border border-purple-500 text-purple-400 font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-purple-900/30 hover:border-purple-300 hover:text-purple-300"
                                    >
                                        {loading ? (
                                            <Loader className="w-5 h-5 mr-3 animate-spin" />
                                        ) : (
                                            <User className="w-5 h-5 mr-3" />
                                        )}
                                        TRY SIMULATION MODE
                                    </button>
                                </div>

                                <div className="mt-8 p-6 bg-gray-900/50 border border-cyan-500/30 rounded-lg">
                                    <h3 className="text-lg font-semibold text-cyan-300 mb-3">HOW ZKLOGIN WORKS</h3>
                                    <div className="text-left space-y-2 text-gray-400">
                                        <div className="flex items-start">
                                            <div className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 bg-cyan-500 rounded-full flex items-center justify-center">
                                                <CheckCircle className="w-3 h-3 text-black" />
                                            </div>
                                            <span>Authenticate without revealing your identity</span>
                                        </div>
                                        <div className="flex items-start">
                                            <div className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 bg-cyan-500 rounded-full flex items-center justify-center">
                                                <CheckCircle className="w-3 h-3 text-black" />
                                            </div>
                                            <span>Generate a unique Sui address cryptographically</span>
                                        </div>
                                        <div className="flex items-start">
                                            <div className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 bg-cyan-500 rounded-full flex items-center justify-center">
                                                <CheckCircle className="w-3 h-3 text-black" />
                                            </div>
                                            <span>Maintain privacy while proving authentication</span>
                                        </div>
                                        <div className="flex items-start">
                                            <div className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 bg-cyan-500 rounded-full flex items-center justify-center">
                                                <CheckCircle className="w-3 h-3 text-black" />
                                            </div>
                                            <span>Zero-knowledge cryptography for maximum security</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center">
                                {/* Profile Section */}
                                <div className="mb-8">
                                    <div className="relative w-32 h-32 mx-auto mb-6">
                                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 blur-md opacity-60"></div>
                                        <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-cyan-400 shadow-lg shadow-cyan-500/20">
                                            <img
                                                src={getProfileImageUrl(zkLoginState.userInfo?.picture)}
                                                alt={`${zkLoginState.userInfo?.name}'s profile`}
                                                className="w-full h-full object-cover"
                                                onError={handleImageError}
                                                onLoad={() => setImageError(false)}
                                            />
                                        </div>
                                        <div className="absolute bottom-2 right-2 w-6 h-6 bg-cyan-500 border-2 border-gray-900 rounded-full flex items-center justify-center">
                                            <CheckCircle className="w-3 h-3 text-black" />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-center mb-2">
                                        <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center mr-2">
                                            <CheckCircle className="w-3 h-3 text-black" />
                                        </div>
                                        <h2 className="text-2xl font-semibold text-cyan-300">
                                            ACCESS GRANTED
                                        </h2>
                                    </div>
                                    <p className="text-gray-400 text-lg">Welcome back, <span className="font-bold text-cyan-300">{zkLoginState.userInfo?.name}</span></p>
                                    <p className="text-gray-500 text-sm mt-1">{zkLoginState.userInfo?.email}</p>
                                    {demoMode && (
                                        <p className="text-xs text-cyan-400 mt-2 bg-cyan-900/30 px-3 py-1 rounded-full inline-block border border-cyan-500/30">SIMULATION MODE</p>
                                    )}
                                </div>

                                {/* Wallet Address Display */}
                                <div className="bg-gray-900/50 rounded-xl p-8 mb-8 border border-cyan-500/30 relative">
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-purple-500"></div>
                                    <div className="flex items-center justify-center mb-4">
                                        <Shield className="w-8 h-8 text-cyan-400 mr-3" />
                                        <h3 className="text-2xl font-bold text-cyan-300">YOUR SUI ADDRESS</h3>
                                    </div>

                                    <div className="bg-gray-800 rounded-lg p-6 border border-cyan-500/30">
                                        <p className="text-sm text-cyan-400 mb-3 font-medium">DECENTRALIZED IDENTIFIER:</p>
                                        <div className="bg-gray-900 rounded-lg p-4 border border-cyan-500/20">
                                            <p className="font-mono text-cyan-300 break-all leading-relaxed">
                                                {zkLoginState.userAddress}
                                            </p>
                                        </div>

                                        <div className="flex gap-3 mt-4 justify-center">
                                            <button
                                                onClick={() => copyToClipboard(zkLoginState.userAddress!)}
                                                className="cyber-button-small flex items-center gap-2 px-4 py-2 bg-gray-800 border border-cyan-500 text-cyan-400 rounded-lg hover:bg-cyan-900/30 hover:border-cyan-300 hover:text-cyan-300 transition-all font-bold"
                                            >
                                                <Copy className="w-4 h-4" />
                                                {copySuccess ? 'COPIED!' : 'COPY'}
                                            </button>
                                            <button
                                                onClick={openInExplorer}
                                                className="cyber-button-small flex items-center gap-2 px-4 py-2 bg-gray-800 border border-purple-500 text-purple-400 rounded-lg hover:bg-purple-900/30 hover:border-purple-300 hover:text-purple-300 transition-all font-bold"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                                EXPLORER
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-4 text-sm text-cyan-400">
                                        <p className="font-bold">✅ ZK-PROTECTED SUI ADDRESS</p>
                                        <p>• Derived from your OAuth authentication</p>
                                        <p>• Ready for blockchain transactions</p>
                                        <p>• Searchable on Sui Explorer</p>
                                    </div>
                                </div>

                                {/* User Profile Summary */}
                                <div className="bg-gray-900/50 rounded-lg p-6 mb-8 border border-cyan-500/30">
                                    <h3 className="text-lg font-semibold text-cyan-300 mb-4">PROFILE SUMMARY</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-400">Name:</span>
                                            <span className="font-medium text-cyan-300">{zkLoginState.userInfo?.name}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-400">Email:</span>
                                            <span className="font-medium text-cyan-300">{zkLoginState.userInfo?.email}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-400">Provider:</span>
                                            <span className="font-medium text-cyan-300 capitalize">{zkLoginState.userInfo?.provider}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-400">Network:</span>
                                            <span className="font-medium text-cyan-300">Sui Testnet</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Next Steps */}
                                <div className="bg-gray-900/50 rounded-lg p-6 mb-8 border border-cyan-500/30">
                                    <h3 className="text-lg font-semibold text-cyan-300 mb-4">WHAT YOU CAN DO NOW</h3>
                                    <div className="grid md:grid-cols-3 gap-4 text-left">
                                        <div className="bg-gray-800 rounded-lg p-4 border border-cyan-500/30">
                                            <h4 className="font-medium text-cyan-300 mb-2">💰 RECEIVE TOKENS</h4>
                                            <p className="text-sm text-gray-400">
                                                Use your address to receive SUI tokens and other assets
                                            </p>
                                        </div>

                                        <div className="bg-gray-800 rounded-lg p-4 border border-cyan-500/30">
                                            <h4 className="font-medium text-cyan-300 mb-2">🔗 CONNECT DAPPS</h4>
                                            <p className="text-sm text-gray-400">
                                                Connect to decentralized applications with your zkLogin address
                                            </p>
                                        </div>

                                        <div className="bg-gray-800 rounded-lg p-4 border border-cyan-500/30">
                                            <h4 className="font-medium text-cyan-300 mb-2">📊 VIEW ON EXPLORER</h4>
                                            <p className="text-sm text-gray-400">
                                                Check your address activity and balance on Sui Explorer
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={logout}
                                    className="px-6 py-3 bg-gray-800 border border-red-500 text-red-400 font-bold rounded-lg hover:bg-red-900/30 hover:border-red-300 hover:text-red-300 transition-all"
                                >
                                    TERMINATE SESSION
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="text-center mt-8 text-gray-500">
                        <p className="text-sm">Powered by <span className="text-cyan-400">Sui ZkLogin</span> - Secured by Zero-Knowledge Proofs</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;