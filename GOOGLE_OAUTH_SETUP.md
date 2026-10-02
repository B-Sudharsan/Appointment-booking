# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for the MediBook appointment booking system.

## Prerequisites

- Google account
- Access to Google Cloud Console
- Basic understanding of OAuth 2.0

## Step 1: Google Cloud Console Setup

### 1.1 Create or Select a Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note down your project ID

### 1.2 Enable Google Sign-In API
1. Navigate to **APIs & Services** > **Library**
2. Search for "Google Sign-In API" or "Google+ API"
3. Click on the API and press **Enable**

### 1.3 Create OAuth 2.0 Credentials
1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client ID**
3. If prompted, configure the OAuth consent screen:
   - Choose **External** for testing
   - Fill in required fields (App name, User support email, etc.)
   - Add your email to test users
4. Choose **Web application** as the application type
5. Add authorized origins:
   - `http://localhost:8080` (development)
   - `http://localhost:8081` (development)
   - `http://localhost:8082` (development)
   - `https://yourdomain.com` (production - replace with your actual domain)
6. Add authorized redirect URIs (if needed):
   - `http://localhost:8080/auth/callback`
   - `https://yourdomain.com/auth/callback`

### 1.4 Get Your Credentials
1. After creating the OAuth client, you'll see:
   - **Client ID** (ends with `.apps.googleusercontent.com`)
   - **Client Secret**
2. Copy both values - you'll need them for configuration

## Step 2: Client-Side Configuration

### 2.1 Update Google Configuration
1. Open `client/config/google.ts`
2. Replace the `CLIENT_ID` with your actual Google Client ID:

```typescript
export const GOOGLE_CONFIG = {
  CLIENT_ID: "your-actual-client-id.apps.googleusercontent.com",
  AUTHORIZED_ORIGINS: [
    "http://localhost:8080",
    "http://localhost:8081", 
    "http://localhost:8082",
    "https://yourdomain.com"
  ]
};
```

## Step 3: Server-Side Configuration

### 3.1 Environment Variables
Create a `.env` file in your project root (if it doesn't exist) and add:

```env
GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-actual-client-secret
JWT_SECRET=your-jwt-secret-key
```

### 3.2 Update Server Configuration
The server is already configured to use these environment variables. Make sure your server reads from the `.env` file.

## Step 4: Testing

### 4.1 Development Testing
1. Start your development server: `npm run dev`
2. Navigate to the login page
3. Click the Google Sign-In button
4. You should see the Google OAuth popup
5. Sign in with a Google account (must be added to test users if app is not published)

### 4.2 Troubleshooting Common Issues

**Issue: "Error 400: redirect_uri_mismatch"**
- Solution: Make sure your authorized origins in Google Console match your development URL

**Issue: "Error 403: access_blocked"**
- Solution: Add your email to test users in OAuth consent screen

**Issue: Google Sign-In button doesn't appear**
- Solution: Check browser console for errors, ensure Google script is loaded

**Issue: "Invalid token" error**
- Solution: Verify Client ID matches between frontend and backend

## Step 5: Production Deployment

### 5.1 OAuth Consent Screen
1. Go back to **APIs & Services** > **OAuth consent screen**
2. Fill in all required information
3. Add privacy policy and terms of service URLs
4. Submit for verification (required for production use)

### 5.2 Update Production URLs
1. Add your production domain to authorized origins
2. Update the `GOOGLE_CONFIG` in your deployed application
3. Set environment variables in your production environment

## Security Best Practices

1. **Never expose Client Secret in frontend code**
2. **Use HTTPS in production**
3. **Regularly rotate your Client Secret**
4. **Monitor OAuth usage in Google Console**
5. **Implement proper error handling**

## Features Included

✅ **Google Sign-In Integration**
- One-click sign-in with Google account
- Automatic user creation for new Google users
- Secure token verification on server-side

✅ **Fallback Authentication**
- Traditional email/password login still available
- Seamless integration with existing user system

✅ **User Experience**
- Loading states and error handling
- Toast notifications for success/error states
- Responsive design for mobile and desktop

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify all configuration steps
3. Test with a simple HTML page first
4. Check Google Cloud Console logs

For more information, visit:
- [Google Sign-In Documentation](https://developers.google.com/identity/sign-in/web)
- [Google Cloud Console](https://console.cloud.google.com/)
