# Google OAuth Setup Guide

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (or Google Identity API)

## Step 2: Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Choose **External** user type
3. Fill in required fields:
   - App name: "ZkLogin Demo App"
   - User support email: your email
   - Developer contact information: your email
4. Add scopes: `openid`, `email`, `profile`
5. Save and continue

## Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client IDs**
3. Choose **Web application**
4. Set name: "ZkLogin Web Client"
5. Add Authorized JavaScript origins:
   - `http://localhost:5173`
   - `http://192.168.100.242:5173` (your current local IP)
   - `http://127.0.0.1:5173`
6. Add Authorized redirect URIs:
   - `http://localhost:5173/auth/callback`
   - `http://192.168.100.242:5173/auth/callback`
   - `http://127.0.0.1:5173/auth/callback`
7. Click **Create**

## Step 4: Update Environment Variables

Copy the Client ID from Google Cloud Console and update your `.env` file:

```env
VITE_GOOGLE_CLIENT_ID=your_actual_google_client_id_here.apps.googleusercontent.com
```

## Step 5: Test OAuth Flow

1. Restart your development server
2. Click "Sign in with Google"
3. You should be redirected to Google's OAuth consent screen

## Important Notes

- **Client Secret**: For security, the client secret should be handled server-side in production
- **HTTPS**: Google OAuth requires HTTPS in production
- **Domain Verification**: For production, you'll need to verify your domain
- **Scopes**: We're requesting `openid email profile` which provides the JWT token needed for zkLogin

## Current Status

✅ Demo mode working (zkLogin implementation verified)
⚠️ Google OAuth needs proper client configuration
🔧 Follow steps above to enable real Google authentication

## Troubleshooting

If you still get `401: invalid_client`:
1. Double-check the Client ID is correct
2. Verify redirect URIs match exactly
3. Ensure OAuth consent screen is configured
4. Try clearing browser cache/cookies
