import { google } from 'googleapis';
import * as readline from 'readline';
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const question = (prompt) => {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
};
const setupOAuth = async () => {
  console.log('\n🔐 Google Calendar OAuth 2.0 Setup\n');
  console.log(
    'This will generate a refresh token for accessing Google Calendar API.\n'
  );
  const clientId = await question('Enter your Google OAuth Client ID: ');
  const clientSecret = await question(
    'Enter your Google OAuth Client Secret: '
  );
  const oauth2Client = new google.auth.OAuth2(
    clientId.trim(),
    clientSecret.trim(),
    'http://localhost:3002/oauth2callback'
  );
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar.readonly'],
    prompt: 'consent',
  });
  console.log('\n📋 Step 1: Authorize this application\n');
  console.log('Visit this URL in your browser:\n');
  console.log(authUrl);
  console.log('\n');
  console.log(
    'After authorizing, you will be redirected to a page that cannot load.'
  );
  console.log(
    'Copy the ENTIRE URL from your browser address bar and paste it below.\n'
  );
  const redirectUrl = await question('Paste the full redirect URL here: ');
  // Extract the code from the URL
  const urlParams = new URL(redirectUrl.trim()).searchParams;
  const code = urlParams.get('code');
  if (!code) {
    console.error('\n❌ Error: Could not find authorization code in URL.');
    console.error(
      'Make sure you copied the entire URL from the address bar.\n'
    );
    process.exit(1);
  }
  try {
    const { tokens } = await oauth2Client.getToken(code.trim());
    if (!tokens.refresh_token) {
      console.error('\n❌ Error: No refresh token received.');
      console.error(
        'This may happen if you have already authorized this app before.'
      );
      console.error(
        'Try revoking access at: https://myaccount.google.com/permissions'
      );
      console.error('Then run this script again.\n');
      process.exit(1);
    }
    console.log('\n✅ Success! Your refresh token:\n');
    console.log(tokens.refresh_token);
    console.log('\n📝 Add this to your .gcalservice.env file:\n');
    console.log(`GOOGLE_CLIENT_ID=${clientId.trim()}`);
    console.log(`GOOGLE_CLIENT_SECRET=${clientSecret.trim()}`);
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log('\n');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('\n❌ Error getting tokens:', message);
    process.exit(1);
  } finally {
    rl.close();
  }
};
setupOAuth().catch(console.error);
