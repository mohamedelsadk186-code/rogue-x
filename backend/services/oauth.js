const { OAuth2Client } = require('google-auth-library');
const appleSigninAuth = require('apple-signin-auth');

const googleClient = new OAuth2Client();

async function verifyGoogleIdToken(idToken) {
  const audiences = []
    .concat(process.env.GOOGLE_CLIENT_ID || [])
    .concat(process.env.GOOGLE_IOS_CLIENT_ID || [])
    .concat((process.env.GOOGLE_ALLOWED_AUDIENCES || '').split(',').map((s) => s.trim()).filter(Boolean))
    .flat()
    .filter(Boolean);

  if (audiences.length === 0) throw new Error('GOOGLE_CLIENT_ID is not configured');

  let ticket;
  // google-auth-library supports verifying against multiple audiences too, but safest is looping.
  for (const audience of [...new Set(audiences)]) {
    try {
      ticket = await googleClient.verifyIdToken({ idToken, audience });
      break;
    } catch {
      // try next possible audience/client id
    }
  }

  if (!ticket) throw new Error('Unable to verify Google token for configured audience(s)');

  const payload = ticket.getPayload();
  if (!payload?.email_verified) throw new Error('Google email not verified');
  return {
    email: payload.email?.toLowerCase(),
    name: payload.name || payload.given_name || 'Google User',
    oauthId: payload.sub,
    provider: 'google',
  };
}

async function verifyAppleIdentityToken(identityToken) {
  const audience = process.env.APPLE_CLIENT_ID;
  if (!audience) throw new Error('APPLE_CLIENT_ID is not configured');
  const payload = await appleSigninAuth.verifyIdToken(identityToken, {
    audience,
    ignoreExpiration: false,
  });
  return {
    email: (payload.email || '').toLowerCase(),
    name: payload.email ? payload.email.split('@')[0] : 'Apple User',
    oauthId: payload.sub,
    provider: 'apple',
  };
}

module.exports = { verifyGoogleIdToken, verifyAppleIdentityToken };
