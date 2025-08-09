# Google OAuth Access Denied Troubleshooting

## Issue: "Do not have access to google auth" Error

### Problem Analysis
After fixing the Client ID format, you're now getting an access denied error. This indicates a Google Cloud Console configuration issue.

### Step-by-Step Resolution

## 1. Verify Google Cloud Console Project Access

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Check if you can access the project**: `1018062018880`
3. **Verify you're the owner/editor** of this project

## 2. Check OAuth Consent Screen Configuration

1. **Navigate to**: APIs & Services > OAuth consent screen
2. **Verify the following settings**:
   - **User Type**: Should be "External" (not Internal)
   - **App name**: Fill in (e.g., "ZkLogin Demo")
   - **User support email**: Your email address
   - **Developer contact**: Your email address
   - **Publishing status**: Should be "Testing" or "Published"

3. **Add Test Users** (if in Testing mode):
   - Go to "Test users" section
   - Add your email address as a test user
   - Add any other emails you want to test with

## 3. Configure OAuth 2.0 Client ID

1. **Go to**: APIs & Services > Credentials
2. **Find your OAuth 2.0 Client ID**: `1018062018880-n1v1avcbpm5dmheh9lor544km4vejb62`
3. **Click to edit and verify**:

   **Authorized JavaScript origins**:
   ```
   http://localhost:5173
   http://192.168.100.242:5173
   http://127.0.0.1:5173
   ```

   **Authorized redirect URIs**:
   ```
   http://localhost:5173/auth/callback
   http://192.168.100.242:5173/auth/callback
   http://127.0.0.1:5173/auth/callback
   ```

## 4. Enable Required APIs

1. **Go to**: APIs & Services > Library
2. **Search and enable these APIs**:
   - ✅ **Google Identity Services API**
   - ✅ **Google+ API** (if available)
   - ✅ **People API** (recommended)

## 5. Check Scopes Configuration

In your OAuth consent screen, ensure these scopes are added:
- `openid`
- `email` 
- `profile`

## 6. Verify Domain Verification (if needed)

If using custom domains, you may need to verify domain ownership:
1. **Go to**: APIs & Services > Domain verification
2. **Add your domain** if using custom domains

## 7. Common Solutions

### Solution A: Reset OAuth Consent Screen
1. Go to OAuth consent screen
2. Click "MAKE EXTERNAL" if it's set to Internal
3. Re-configure all settings
4. Add yourself as a test user

### Solution B: Create New OAuth Client
1. Go to Credentials
2. Create new OAuth 2.0 Client ID
3. Choose "Web application"
4. Add the authorized origins and redirect URIs
5. Update your `.env` file with the new Client ID

### Solution C: Check Project Permissions
1. Go to IAM & Admin > IAM
2. Verify you have "Owner" or "Editor" role
3. If not, ask the project owner to grant access

## 8. Test Configuration

After making changes:

1. **Clear browser cache and cookies**
2. **Restart your dev server**:
   ```bash
   npm run dev
   ```
3. **Test the login flow**
4. **Check browser developer console** for detailed error messages

## 9. Alternative: Create New Google Cloud Project

If the above doesn't work, create a fresh project:

1. **Go to**: https://console.cloud.google.com/
2. **Create new project**: "ZkLogin Demo"
3. **Enable APIs**: Google Identity Services API
4. **Create OAuth 2.0 credentials**
5. **Configure consent screen**
6. **Update your `.env` with new credentials**

## 10. Debug Information

Check these in your browser's developer console when testing:
- Network tab for failed requests
- Console tab for JavaScript errors
- Look for specific error codes (400, 401, 403)

### Current Status
✅ Client ID format corrected  
🔧 Google Cloud Console access configuration needed  
⏳ Testing required after Google Cloud setup

### Next Steps
1. Follow steps 1-3 above to verify your Google Cloud Console setup
2. Ensure you're added as a test user in OAuth consent screen
3. Clear browser cache and test again
