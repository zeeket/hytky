# Google Calendar OAuth 2.0 Setup Guide

This guide walks you through setting up OAuth 2.0 authentication for the Google Calendar integration.

## Prerequisites

- Google Workspace admin access or Google account with calendar access
- Calendar already shared (you've done this: `hytky-calendar-service-account@hytky-calendar.iam.gserviceaccount.com`)

## Step 1: Create OAuth 2.0 Credentials in Google Cloud

### 1.1 Configure OAuth Consent Screen

1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Select **Internal** (if Google Workspace) or **External**
3. Fill in:
   - **App name**: `HYTKY Calendar Sync`
   - **User support email**: Your email
   - **Developer contact**: Your email
4. Click **Save and Continue**

### 1.2 Add Calendar Scope

1. Click **Add or Remove Scopes**
2. Filter for: `calendar.readonly`
3. Check: `https://www.googleapis.com/auth/calendar.readonly`
4. Click **Update**
5. Click **Save and Continue**
6. If External: Add your email as a test user
7. Click **Save and Continue** → **Back to Dashboard**

### 1.3 Create OAuth Client ID

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click **Create Credentials** → **OAuth client ID**
3. **Application type**: Desktop app
4. **Name**: `hytky-calendar-desktop`
5. Click **Create**
6. **Copy** the Client ID and Client Secret (or download JSON)

## Step 2: Generate Refresh Token

### 2.1 Install Dependencies

```bash
cd gcalservice
npm install
```

### 2.2 Run OAuth Setup Script

```bash
npm run setup-oauth
```

### 2.3 Follow the Interactive Prompts

The script will:
1. Ask for your **Client ID** and **Client Secret**
2. Generate an authorization URL
3. Open this URL in your browser (or copy/paste it)
4. Sign in with your Google account
5. Click **Allow** to grant calendar access
6. Copy the **authorization code** from the browser
7. Paste it back into the terminal
8. Display your **refresh token**

**Example output:**
```
✅ Success! Your refresh token:

1//0xxxxx-xxxxxxxxxxxxxxxxxxxx

📝 Add this to your .gcalservice.env file:

GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxx
GOOGLE_REFRESH_TOKEN=1//0xxxxx-xxxxxxxxxxxxxxxxxxxx
```

## Step 3: Configure Environment

### 3.1 Create .gcalservice.env

Copy the example file:
```bash
cp .gcalservice.env.example .gcalservice.env
```

### 3.2 Fill in the Values

Edit `.gcalservice.env`:
```bash
# From Step 1.3
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxx

# From Step 2.3
GOOGLE_REFRESH_TOKEN=1//0xxxxx-xxxxxxxxxxxxxxxxxxxx

# Your calendar ID
GOOGLE_CALENDAR_ID=your-calendar-id@group.calendar.google.com

# Sync configuration (optional)
SYNC_INTERVAL_MINUTES=15
MAIN_APP_URL=http://hytky:3000
PORT=3002
NODE_ENV=production
```

## Step 4: Verify Setup

Test the configuration:
```bash
npm run dev
```

You should see:
```
gcalservice running on port 3002
Sync interval: 15 minutes
[SYNC] Starting calendar sync...
[SYNC] Fetched X events
[SYNC] Sync completed successfully
```

## Troubleshooting

### "No refresh token received"

This happens if you've already authorized the app. Fix:
1. Go to: https://myaccount.google.com/permissions
2. Find "HYTKY Calendar Sync"
3. Click **Remove access**
4. Run `npm run setup-oauth` again

### "Access denied"

Make sure:
- You added yourself as a test user (if External app)
- You used the correct Google account
- The calendar is shared with your account

### "Invalid grant"

The refresh token may have expired or been revoked. Re-run `npm run setup-oauth`.

## Security Notes

- **Never commit** `.gcalservice.env` to git (it's in `.gitignore`)
- Store the refresh token securely
- The refresh token doesn't expire unless:
  - You revoke access
  - You change your Google password
  - 6 months of inactivity (for External apps)
- Refresh tokens are automatically used to get new access tokens

## What's Next?

Once configured, the gcalservice will:
1. Automatically refresh access tokens as needed
2. Sync events every 15 minutes (configurable)
3. Store events in the PostgreSQL database
4. Display them on the `/events` page

Continue with the main setup by running:
```bash
# Back to project root
cd ..

# Run database migration
make migrate

# Start dev environment
make dev
```
