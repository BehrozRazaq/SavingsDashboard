# GitHub Copilot Agent: Complete Tink Integration Implementation

## Context
You are implementing a complete Tink API integration for FluxFinance, a Swedish personal finance dashboard. The application helps users track transactions from Nordea and Bank Norwegian using Swedish BankID authentication through Tink's open banking platform.

## Current Architecture

### Tech Stack
- **Frontend**: React 18 + Vite, Tailwind CSS, Framer Motion
- **Backend**: Express.js (Node.js), running on port 3001
- **Bank Integration**: Tink API (Open Banking)
- **Authentication**: Swedish BankID via Tink Link
- **Target Banks**: Nordea Sweden, Bank Norwegian

### Existing Code Structure
```
server/
  ├── server.js                 # Express server with calculator endpoints
  ├── routes/
  │   └── auth.js              # Partial Tink OAuth implementation
  └── .env.example             # Environment template

src/
  ├── App.jsx                  # Main dashboard with bank connection UI
  ├── hooks/
  │   └── useFinancialData.js  # Currently uses mock JSON data
  ├── components/
  │   └── ConnectionStatus.jsx # Bank connection status UI
  └── data/
      ├── nordeaTransactions.json     # Mock data
      └── norwegianTransactions.json  # Mock data
```

### Partially Implemented Features
1. **Backend Routes** (`server/routes/auth.js`):
   - `GET /api/tink/connect` - Generates Tink Link URL (✅ IMPLEMENTED)
   - `GET /api/tink/callback` - OAuth callback handler (⚠️ INCOMPLETE - no token storage)
   - `GET /api/tink/transactions` - Fetches transactions (⚠️ INCOMPLETE - no auth state)
   - `GET /api/tink/status` - Connection status (⚠️ INCOMPLETE - no user session)

2. **Frontend Integration** (`src/App.jsx`):
   - `handleConnectBank()` - Redirects to Tink Link (✅ IMPLEMENTED)
   - Bank connection state management (⚠️ MOCK DATA ONLY)

3. **Data Hook** (`src/hooks/useFinancialData.js`):
   - Currently reads from static JSON files
   - Needs to fetch from `/api/tink/transactions`

## Implementation Requirements

### 1. Backend: Session & Token Management

**Create `server/middleware/session.js`**
```javascript
/**
 * Implement secure server-side session storage for Tink tokens
 * Requirements:
 * - Store user access tokens securely (in-memory Map for development, Redis for production)
 * - Session expiry management (tokens expire after 90 minutes)
 * - Session middleware to attach user context to requests
 * - HTTP-only cookie-based session IDs (NOT URL parameters)
 * 
 * Security Notes:
 * - NEVER send access tokens to frontend
 * - Use httpOnly, secure, sameSite cookies
 * - Implement CSRF protection if needed
 */
```

**Update `server/routes/auth.js`**
- ✅ Fix `/callback`: Store tokens in session instead of redirecting with sensitive data
- ✅ Implement automatic token refresh before expiry
- ✅ Add user ID persistence (generate UUID per user, store in cookie)
- ✅ Update `/transactions` to use session-stored token
- ✅ Update `/status` to use session-stored token
- ✅ Add proper error handling for expired/invalid tokens

**Add Token Refresh Endpoint**
```javascript
/**
 * POST /api/tink/refresh
 * - Check if access token is near expiry (< 5 minutes remaining)
 * - Use refresh_token to get new access_token
 * - Update session storage
 * - Return success/failure to frontend
 */
```

### 2. Frontend: Live Data Integration

**Update `src/hooks/useFinancialData.js`**
```javascript
/**
 * Replace static JSON imports with live API calls
 * Requirements:
 * - Fetch transactions from GET /api/tink/transactions
 * - Maintain backward compatibility (fallback to mock data if API fails)
 * - Implement loading states
 * - Handle errors gracefully
 * - Add automatic refresh every 5 minutes
 * - Merge transactions from multiple banks
 * 
 * Data Flow:
 * 1. Check if user is connected (GET /api/tink/status)
 * 2. If connected, fetch transactions (GET /api/tink/transactions)
 * 3. If not connected or error, use mock data
 * 4. Apply existing normalization and analysis logic
 */
```

**Update `src/App.jsx`**
```javascript
/**
 * Integrate real connection status from backend
 * Requirements:
 * - On mount, check URL params for ?connected=true or ?error=...
 * - If connected=true, fetch /api/tink/status to update bank states
 * - Poll /api/tink/status every 30 seconds when connected
 * - Update bankConnections state with real data
 * - Handle Tink callback errors (show user-friendly messages)
 * - Add "Disconnect Bank" functionality
 */
```

**Update `src/components/ConnectionStatus.jsx`**
```javascript
/**
 * Display real-time bank connection status
 * Requirements:
 * - Show actual connection state from /api/tink/status
 * - Display last sync timestamp
 * - Show "Reauthorize" button if needsReauth is true
 * - Handle different Tink credential statuses:
 *   - UPDATED → "Connected"
 *   - AUTHENTICATION_ERROR → "Expired - Reauthorize"
 *   - UPDATING → "Syncing..."
 *   - AWAITING_MOBILE_BANKID_AUTHENTICATION → "Waiting for BankID"
 */
```

### 3. Error Handling & User Experience

**Implement Comprehensive Error States**
- Network errors (API down)
- Authentication errors (expired tokens)
- Tink API errors (rate limits, temporary failures)
- Missing credentials (user hasn't connected)

**User Feedback**
- Toast notifications for errors
- Loading skeletons during data fetch
- Clear error messages in Swedish and English
- Retry mechanisms for transient failures

### 4. Environment Setup

**Create `server/.env` from template**
```bash
# Guide user to:
# 1. Sign up at https://console.tink.com
# 2. Create an application
# 3. Add Swedish market support
# 4. Configure redirect URI: http://localhost:3001/api/tink/callback
# 5. Copy client ID and secret to .env
```

**Add environment validation**
```javascript
/**
 * In server/server.js startup:
 * - Check if TINK_CLIENT_ID and TINK_CLIENT_SECRET are set
 * - Warn if using default redirect URI in production
 * - Log Tink API URL being used
 */
```

### 5. Testing & Validation

**Create Manual Test Checklist**
1. Start server and frontend
2. Click "Connect Bank" button
3. Verify redirect to Tink Link
4. Complete BankID authentication (use Tink test credentials)
5. Verify callback redirect to frontend with ?connected=true
6. Check that transactions appear in dashboard
7. Verify subscription detection works with live data
8. Test token expiry (force expire and check refresh)
9. Test disconnection flow
10. Verify error handling (disconnect internet, check behavior)

**Optional: Unit Tests**
- Token storage and retrieval
- Session expiry logic
- Transaction normalization
- Error handling flows

### 6. Data Normalization

**Ensure Tink → App Format Mapping**
```javascript
/**
 * Tink transaction format:
 * {
 *   id: string,
 *   amount: { value: { unscaledValue: number, scale: number }, currencyCode: string },
 *   dates: { booked: string, value: string },
 *   descriptions: { display: string, original: string },
 *   categories: { pfm: { name: string } },
 *   accountId: string
 * }
 * 
 * App expected format (from mock data):
 * {
 *   id: string,
 *   date: string (YYYY-MM-DD),
 *   merchant: string,
 *   amount: number (negative for expenses, positive for income),
 *   category: string,
 *   source: 'nordea' | 'norwegian'
 * }
 * 
 * Implement robust mapping in auth.js /transactions endpoint
 */
```

### 7. Security Considerations

**Mandatory Security Measures**
- ✅ Store tokens server-side only (NEVER send to frontend)
- ✅ Use httpOnly cookies for session IDs
- ✅ Implement CORS properly (whitelist frontend origin)
- ✅ Validate all API responses from Tink
- ✅ Sanitize transaction data before sending to frontend
- ✅ Add rate limiting to Tink endpoints (prevent abuse)
- ✅ Log security events (authentication failures, token refresh)

**Production Readiness** (Document for future)
- Use PostgreSQL/MongoDB for persistent token storage
- Implement Redis for session caching
- Add proper user authentication (not just anonymous sessions)
- Encrypt tokens at rest
- Implement proper GDPR compliance (data deletion)
- Use production Tink API endpoint (not test mode)

## Expected Deliverables

1. **Fully Functional Token Management**
   - Tokens stored server-side securely
   - Automatic refresh before expiry
   - Session persistence across page reloads

2. **Live Transaction Fetching**
   - Real data from Nordea and Bank Norwegian via Tink
   - Fallback to mock data if not connected
   - Proper error handling

3. **Complete OAuth Flow**
   - User clicks "Connect Bank" → Redirects to Tink Link
   - Authenticates with BankID → Callback to server
   - Server stores tokens → Redirects to frontend
   - Frontend updates connection status

4. **Updated UI**
   - Shows real connection status
   - Displays actual sync timestamps
   - Handles all credential states from Tink

5. **Developer Documentation**
   - Setup instructions in README.md
   - API endpoint documentation
   - Troubleshooting guide

## Additional Notes

### Swedish Banking Specifics
- Use BankID authentication (standard for Swedish banks)
- Set market to 'SE' and locale to 'sv_SE'
- Nordea provider ID: `se-nordea-bankid`
- Norwegian provider ID: `se-norwegian-bankid`
- Transactions must support Swedish currency (SEK)

### Tink API Quotas (Be Aware)
- Test mode has limited API calls
- Production requires verified Tink account
- Rate limiting: ~5 requests/second
- Transaction history: Up to 24 months

### Testing Without Real Bank Credentials
- Use Tink's test mode (already configured in code)
- Test credentials provided by Tink console
- Simulate different scenarios (errors, expired tokens)

## Priority Order

1. **Session management** (critical foundation)
2. **Token storage and refresh** (prevents re-auth every session)
3. **Frontend data fetching** (useFinancialData hook)
4. **Connection status UI** (user feedback)
5. **Error handling** (production readiness)
6. **Documentation** (maintainability)

## Success Criteria

- ✅ User can connect Nordea account via BankID
- ✅ User can connect Bank Norwegian account via BankID
- ✅ Transactions from both banks appear in dashboard
- ✅ Subscription detection works with live data
- ✅ Points calculator shows real missed opportunities
- ✅ Connection persists across page reloads
- ✅ Tokens refresh automatically (no re-auth needed)
- ✅ Graceful degradation (works with mock data if API fails)
- ✅ Clear error messages for all failure scenarios

---

## Implementation Instructions for Copilot Agent

1. **Start with backend session management** - This is the foundation
2. **Update auth routes** - Fix token handling in callback and endpoints
3. **Update frontend hook** - Replace mock data with API calls
4. **Update App.jsx** - Integrate real connection status
5. **Add error handling** - Make it production-ready
6. **Test thoroughly** - Follow the test checklist
7. **Document changes** - Update README with setup instructions

Work incrementally, test each component, and ensure backward compatibility with mock data during development.
