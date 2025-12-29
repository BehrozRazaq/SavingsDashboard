/**
 * Session Management Middleware for Tink API Integration
 * 
 * Provides secure server-side session storage for Tink OAuth tokens
 * Uses in-memory storage for development (Redis recommended for production)
 * 
 * Security Notes:
 * - Tokens are stored server-side only (NEVER sent to frontend)
 * - Session IDs are stored in httpOnly cookies
 * - Implements automatic session expiry (90 minutes)
 */

import { randomUUID } from 'crypto';

// In-memory session store (use Redis in production)
const sessionStore = new Map();

// Session configuration
const SESSION_EXPIRY_MS = 90 * 60 * 1000; // 90 minutes (Tink token expiry)
const TOKEN_REFRESH_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes before expiry
const COOKIE_NAME = 'flux_session';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: SESSION_EXPIRY_MS,
  path: '/'
};

/**
 * Create a new session with Tink tokens
 * @param {Object} tokens - Tink OAuth tokens
 * @param {string} tokens.access_token - Access token for API calls
 * @param {string} tokens.refresh_token - Refresh token for renewal
 * @param {number} tokens.expires_in - Token expiry in seconds
 * @param {string} [userId] - Tink user ID
 * @returns {string} Session ID
 */
export function createSession(tokens, userId = null) {
  const sessionId = randomUUID();
  const now = Date.now();
  
  sessionStore.set(sessionId, {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: now + (tokens.expires_in * 1000),
    userId,
    createdAt: now,
    lastAccessed: now
  });
  
  return sessionId;
}

/**
 * Get session data by session ID
 * @param {string} sessionId - Session ID from cookie
 * @returns {Object|null} Session data or null if not found/expired
 */
export function getSession(sessionId) {
  if (!sessionId) return null;
  
  const session = sessionStore.get(sessionId);
  if (!session) return null;
  
  // Check if session expired
  if (Date.now() > session.expiresAt) {
    sessionStore.delete(sessionId);
    return null;
  }
  
  // Update last accessed time
  session.lastAccessed = Date.now();
  return session;
}

/**
 * Update session with new tokens (after refresh)
 * @param {string} sessionId - Session ID
 * @param {Object} tokens - New tokens from refresh
 */
export function updateSession(sessionId, tokens) {
  const session = sessionStore.get(sessionId);
  if (!session) return false;
  
  session.accessToken = tokens.access_token;
  if (tokens.refresh_token) {
    session.refreshToken = tokens.refresh_token;
  }
  session.expiresAt = Date.now() + (tokens.expires_in * 1000);
  session.lastAccessed = Date.now();
  
  return true;
}

/**
 * Delete a session
 * @param {string} sessionId - Session ID to delete
 */
export function deleteSession(sessionId) {
  sessionStore.delete(sessionId);
}

/**
 * Check if token is near expiry (within threshold)
 * @param {string} sessionId - Session ID
 * @returns {boolean} True if token needs refresh
 */
export function needsRefresh(sessionId) {
  const session = getSession(sessionId);
  if (!session) return false;
  
  return (session.expiresAt - Date.now()) < TOKEN_REFRESH_THRESHOLD_MS;
}

/**
 * Express middleware to attach session to request
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
export function sessionMiddleware(req, res, next) {
  // Try to get session ID from cookie
  const sessionId = req.cookies?.[COOKIE_NAME];
  
  if (sessionId) {
    const session = getSession(sessionId);
    if (session) {
      req.session = session;
      req.sessionId = sessionId;
    }
  }
  
  // Helper to set session cookie
  req.setSessionCookie = (sessionId) => {
    res.cookie(COOKIE_NAME, sessionId, COOKIE_OPTIONS);
  };
  
  // Helper to clear session cookie
  req.clearSessionCookie = () => {
    res.clearCookie(COOKIE_NAME, { path: '/' });
  };
  
  next();
}

/**
 * Clean up expired sessions (run periodically)
 */
export function cleanupExpiredSessions() {
  const now = Date.now();
  for (const [sessionId, session] of sessionStore.entries()) {
    if (now > session.expiresAt) {
      sessionStore.delete(sessionId);
    }
  }
}

// Clean up expired sessions every 10 minutes
setInterval(cleanupExpiredSessions, 10 * 60 * 1000);

export { COOKIE_NAME, COOKIE_OPTIONS };
