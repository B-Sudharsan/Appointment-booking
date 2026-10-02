// Google OAuth Configuration
// To set up Google OAuth:
// 1. Go to https://console.developers.google.com/
// 2. Create a new project or select an existing one
// 3. Enable the Google+ API
// 4. Create credentials (OAuth 2.0 Client ID)
// 5. Add your domain to authorized origins
// 6. Replace the CLIENT_ID below with your actual Google Client ID

export const GOOGLE_CONFIG = {
  // Replace this with your actual Google Client ID from Google Cloud Console
  CLIENT_ID: "your-google-client-id.apps.googleusercontent.com",
  
  // For development, you can use localhost
  // For production, make sure to add your domain to Google Console
  AUTHORIZED_ORIGINS: [
    "http://localhost:8080",
    "http://localhost:8081", 
    "http://localhost:8082",
    "https://yourdomain.com" // Replace with your actual domain
  ]
};

// Instructions for setting up Google OAuth:
/*
1. Go to Google Cloud Console (https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable Google Sign-In API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sign-In API" or "Google+ API"
   - Click "Enable"

4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Choose "Web application"
   - Add authorized origins:
     * http://localhost:8080 (for development)
     * http://localhost:8081 (for development)
     * http://localhost:8082 (for development)
     * https://yourdomain.com (for production)

5. Copy the Client ID and replace the CLIENT_ID above

6. For server-side verification, also note down the Client Secret
   and add it to your server environment variables:
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret

7. Test the integration in development mode first
*/
