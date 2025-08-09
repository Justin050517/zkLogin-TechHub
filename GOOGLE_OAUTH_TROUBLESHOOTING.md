# Google OAuth Troubleshooting Guide

## Issue: 401 invalid_client Error

### Problem Identified
Your Google Client ID had an incorrect format:
- ❌ **Wrong**: `http://1018062018880-n1v1avcbpm5dmheh9lor544km4vejb62.apps.googleusercontent.com`
- ✅ **Correct**: `1018062018880-n1v1avcbpm5dmheh9lor544km4vejb62.apps.googleusercontent.com`

### Fixed Issues
1. **Removed `http://` prefix** - Client IDs should not have protocol prefixes
2. **Proper format validation** - Client ID should be just the identifier with `.apps.googleusercontent.com`

### Next Steps to Complete Setup

1. **Verify Google Cloud Console Configuration**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to **APIs & Services** > **Credentials**
   - Find your OAuth 2.0 Client ID: `1018062018880-n1v1avcbpm5dmheh9lor544km4vejb62`
   - Click on it to edit

2. **Add Authorized JavaScript Origins**:
   ```
   http://localhost:5173
   http://192.168.100.242:5173
   http://127.0.0.1:5173
   ```

3. **Add Authorized Redirect URIs**:
   ```
   http://localhost:5173/auth/callback
   http://192.168.100.242:5173/auth/callback
   http://127.0.0.1:5173/auth/callback
   ```

4. **Enable Required APIs**:
   - Go to **APIs & Services** > **Library**
   - Search for and enable:
     - Google+ API (or Google Identity API)
     - Google OAuth2 API

5. **Configure OAuth Consent Screen**:
   - Go to **APIs & Services** > **OAuth consent screen**
   - Choose **External** user type
   - Fill in required fields:
     - App name: "ZkLogin Demo App"
     - User support email: your email
     - Developer contact information: your email
   - Add scopes: `openid`, `email`, `profile`

### Test the Fix

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Check configuration status**:
   - Click the settings icon in the app
   - Verify Google OAuth shows as "Configured"

3. **Test Google Sign-in**:
   - Click "Sign in with Google"
   - You should be redirected to Google's consent screen
   - After authorization, you'll be redirected back with a code

### Common Issues and Solutions

**If you still get `invalid_client`**:
- Double-check the Client ID matches exactly in Google Cloud Console
- Ensure no extra spaces or characters in the `.env` file
- Verify the OAuth consent screen is properly configured
- Clear browser cache and cookies

**If redirect doesn't work**:
- Verify redirect URIs are exactly matching in Google Cloud Console
- Check that the current URL matches one of the authorized origins

**If scopes are missing**:
- Ensure `openid email profile` scopes are requested
- Verify OAuth consent screen has these scopes configured

### Security Notes

⚠️ **Important**: The client secret (`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`) should be handled server-side in production. For this demo, we're using it client-side, but this is not recommended for production applications.

### Current Status
✅ Client ID format fixed  
🔧 Google Cloud Console configuration needed  
⏳ Testing required after Google Cloud setup
