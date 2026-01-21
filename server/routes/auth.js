import express from "express";
import axios from "axios";
import {
  createSession,
  getSession,
  updateSession,
  deleteSession,
  needsRefresh,
  sessionMiddleware,
} from "../middleware/session.js";

const router = express.Router();

// Tink API Configuration
const TINK_API_URL = process.env.TINK_API_URL || "https://api.tink.com";
const TINK_CLIENT_ID = process.env.TINK_CLIENT_ID;
const TINK_CLIENT_SECRET = process.env.TINK_CLIENT_SECRET;
const REDIRECT_URI =
  process.env.TINK_REDIRECT_URI || "http://localhost:3001/api/tink/callback";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Market configuration for Swedish banks
const MARKET = "SE";
const LOCALE = "sv_SE";

// Apply session middleware to all routes
router.use(sessionMiddleware);

/**
 * GET /api/tink/connect
 * Generates a Tink Link URL for the user to authenticate with BankID
 * Supports Nordea Sweden and Bank Norwegian
 */
router.get("/connect", async (req, res) => {
  try {
    if (!TINK_CLIENT_ID || !TINK_CLIENT_SECRET) {
      return res.status(500).json({
        error: "Tink credentials not configured",
        message:
          "Please set TINK_CLIENT_ID and TINK_CLIENT_SECRET environment variables",
      });
    }

    // Step 1: Get client access token
    const tokenResponse = await axios.post(
      `${TINK_API_URL}/api/v1/oauth/token`,
      new URLSearchParams({
        client_id: TINK_CLIENT_ID,
        client_secret: TINK_CLIENT_SECRET,
        grant_type: "client_credentials",
        scope: "authorization:grant,user:create",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const clientAccessToken = tokenResponse.data.access_token;

    // Step 2: Create a new user in Tink with external_user_id
    const externalUserId = `user_${crypto.randomUUID()}`;

    await axios.post(
      `${TINK_API_URL}/api/v1/user/create`,
      {
        external_user_id: externalUserId,
        market: MARKET,
        locale: LOCALE,
        retention_class: "permanent",
      },
      {
        headers: {
          Authorization: `Bearer ${clientAccessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Step 3: Delegate authorization to Tink Link for this user
    const authResponse = await axios.post(
      `${TINK_API_URL}/api/v1/oauth/authorization-grant/delegate`,
      new URLSearchParams({
        external_user_id: externalUserId,
        actor_client_id: "df05e4b379934cd09963197cc855bfe9",
        scope:
          "credentials:read,credentials:write,credentials:refresh,providers:read,user:read,authorization:read,accounts:read,transactions:read,identity:read",
        id_hint: externalUserId,
      }),
      {
        headers: {
          Authorization: `Bearer ${clientAccessToken}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const authorizationCode = authResponse.data.code;

    // Step 4: Build Tink Link URL using permanent-user credentials flow
    const tinkLinkParams = new URLSearchParams({
      client_id: TINK_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      authorization_code: authorizationCode,
      scope: "accounts:read,transactions:read,identity:read",
      market: MARKET,
      locale: LOCALE,
      // Test mode for development
      test: process.env.NODE_ENV !== "production" ? "true" : "false",
    });

    const tinkLinkUrl = `https://link.tink.com/1.0/credentials/add?${tinkLinkParams.toString()}`;

    res.json({
      url: tinkLinkUrl,
      externalUserId: externalUserId,
      message: "Redirect user to this URL to authenticate with BankID",
    });
  } catch (error) {
    console.error("Tink connect error:", error.response?.data || error.message);
    res.status(500).json({
      error: "Failed to generate Tink Link",
      details: error.response?.data?.errorMessage || error.message,
    });
  }
});

/**
 * GET /api/tink/callback
 * Handles the authorization code callback from Tink
 * Exchanges the code for an access_token and stores in session
 */
router.get("/callback", async (req, res) => {
  try {
    const { code, credentialsId, error, error_description } = req.query;

    // Handle error cases from Tink
    if (error) {
      console.error("Tink callback error:", error, error_description);
      return res.redirect(
        `${FRONTEND_URL}?error=${encodeURIComponent(
          error_description || error
        )}`
      );
    }

    if (!code) {
      return res.redirect(
        `${FRONTEND_URL}?error=No authorization code received`
      );
    }

    // Exchange authorization code for access token
    const tokenResponse = await axios.post(
      `${TINK_API_URL}/api/v1/oauth/token`,
      new URLSearchParams({
        client_id: TINK_CLIENT_ID,
        client_secret: TINK_CLIENT_SECRET,
        grant_type: "authorization_code",
        code: code,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const tokens = tokenResponse.data;

    // Create session and store tokens securely server-side
    const sessionId = createSession(tokens, credentialsId);

    // Set session cookie
    req.setSessionCookie(sessionId);

    console.log("Successfully authenticated with Tink");
    console.log("Credentials ID:", credentialsId);
    console.log("Session created:", sessionId);

    // Redirect to frontend with success indicator only (no sensitive data in URL)
    res.redirect(`${FRONTEND_URL}?connected=true`);
  } catch (error) {
    console.error(
      "Tink callback token exchange error:",
      error.response?.data || error.message
    );
    res.redirect(`${FRONTEND_URL}?error=Token exchange failed`);
  }
});

/**
 * GET /api/transactions
 * Fetches live transaction data from Tink
 * Uses session-stored access token
 */
router.get("/transactions", async (req, res) => {
  try {
    // Get access token from session
    if (!req.session || !req.session.accessToken) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Please connect your bank first.",
        connected: false,
      });
    }

    // Check if token needs refresh
    if (needsRefresh(req.sessionId)) {
      try {
        await refreshTokens(req.sessionId, req.session.refreshToken);
      } catch (refreshError) {
        console.error(
          "Token refresh failed:",
          refreshError.response?.data || refreshError.message
        );
        return res.status(401).json({
          error: "Session expired",
          message: "Please re-authenticate with your bank",
          details:
            refreshError.response?.data?.errorMessage || refreshError.message,
          connected: false,
        });
      }
    }

    const accessToken = req.session.accessToken;

    // Fetch accounts first to get account IDs
    const accountsResponse = await axios.get(
      `${TINK_API_URL}/data/v2/accounts`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const accounts = accountsResponse.data.accounts || [];

    // Fetch transactions for all accounts
    const transactionsResponse = await axios.get(
      `${TINK_API_URL}/data/v2/transactions`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        params: {
          pageSize: 100,
          // Get last 90 days of transactions
          bookedDateGte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
        },
      }
    );

    const transactions = transactionsResponse.data.transactions || [];

    // Map Tink transactions to our normalized format
    const normalizedTransactions = transactions.map((t) => ({
      id: t.id,
      date: t.dates?.booked || t.dates?.value,
      merchant:
        t.descriptions?.display || t.descriptions?.original || "Unknown",
      // Default scale to 2 for currency amounts (standard for most currencies)
      amount:
        parseFloat(t.amount?.value?.unscaledValue) /
        Math.pow(10, t.amount?.value?.scale ?? 2),
      currency: t.amount?.currencyCode || "SEK",
      category: t.categories?.pfm?.name || "Uncategorized",
      source: determineSource(t.accountId, accounts),
      raw: {
        description: t.descriptions?.original,
        status: t.status,
        providerMutability: t.providerMutability,
      },
    }));

    res.json({
      connected: true,
      accounts: accounts.map((a) => ({
        id: a.id,
        name: a.name,
        type: a.type,
        balance: a.balances?.booked?.amount,
        provider: a.financialInstitutionId,
      })),
      transactions: normalizedTransactions,
      meta: {
        count: normalizedTransactions.length,
        fetchedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error(
      "Tink transactions error:",
      error.response?.data || error.message
    );

    if (error.response?.status === 401) {
      return res.status(401).json({
        error: "Token expired",
        message: "Please re-authenticate with your bank",
        connected: false,
      });
    }

    res.status(500).json({
      error: "Failed to fetch transactions",
      details: error.response?.data?.errorMessage || error.message,
      connected: true,
    });
  }
});

/**
 * GET /api/tink/status
 * Returns the connection status for the user's linked banks
 * Uses session-stored access token
 */
router.get("/status", async (req, res) => {
  try {
    // Check if user has a valid session
    if (!req.session || !req.session.accessToken) {
      return res.json({
        connected: false,
        banks: [],
        message: "No active session",
      });
    }

    const accessToken = req.session.accessToken;

    // Fetch credentials to check connection status
    const credentialsResponse = await axios.get(
      `${TINK_API_URL}/api/v1/credentials`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const credentials = credentialsResponse.data.credentials || [];

    const banks = credentials.map((cred) => ({
      id: cred.id,
      provider: cred.providerName,
      status: cred.status,
      statusUpdated: cred.statusUpdated,
      // Map status to user-friendly state
      state: mapCredentialStatus(cred.status),
      // Check if re-authentication is needed
      needsReauth: [
        "AUTHENTICATION_ERROR",
        "TEMPORARY_ERROR",
        "PERMANENT_ERROR",
      ].includes(cred.status),
    }));

    res.json({
      connected: banks.length > 0,
      banks,
      sessionExpiresAt: req.session.expiresAt,
      lastSynced: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Tink status error:", error.response?.data || error.message);

    if (error.response?.status === 401) {
      return res.json({
        connected: false,
        banks: [],
        error: "Session expired - please reconnect",
      });
    }

    res.json({
      connected: false,
      banks: [],
      error: "Failed to fetch connection status",
    });
  }
});

/**
 * POST /api/tink/refresh
 * Refresh access token before expiry
 */
router.post("/refresh", async (req, res) => {
  try {
    if (!req.session || !req.session.refreshToken) {
      return res.status(401).json({
        error: "No session to refresh",
        connected: false,
      });
    }

    await refreshTokens(req.sessionId, req.session.refreshToken);

    res.json({
      success: true,
      message: "Session refreshed successfully",
    });
  } catch (error) {
    console.error(
      "Token refresh error:",
      error.response?.data || error.message
    );
    res.status(401).json({
      error: "Failed to refresh session",
      message: "Please re-authenticate with your bank",
    });
  }
});

/**
 * POST /api/tink/disconnect
 * Disconnect bank and clear session
 */
router.post("/disconnect", async (req, res) => {
  try {
    if (req.sessionId) {
      deleteSession(req.sessionId);
      req.clearSessionCookie();
    }

    res.json({
      success: true,
      message: "Disconnected successfully",
    });
  } catch (error) {
    console.error("Disconnect error:", error.message);
    res.status(500).json({
      error: "Failed to disconnect",
    });
  }
});

/**
 * Helper: Refresh access token using refresh token
 */
async function refreshTokens(sessionId, refreshToken) {
  const tokenResponse = await axios.post(
    `${TINK_API_URL}/api/v1/oauth/token`,
    new URLSearchParams({
      client_id: TINK_CLIENT_ID,
      client_secret: TINK_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  updateSession(sessionId, tokenResponse.data);
  return tokenResponse.data;
}

/**
 * Helper: Determine bank source from account ID
 */
function determineSource(accountId, accounts) {
  const account = accounts.find((a) => a.id === accountId);
  if (!account) return "unknown";

  const provider = (account.financialInstitutionId || "").toLowerCase();

  if (provider.includes("nordea")) return "nordea";
  if (provider.includes("norwegian")) return "norwegian";

  return provider;
}

/**
 * Helper: Map Tink credential status to user-friendly state
 */
function mapCredentialStatus(status) {
  const statusMap = {
    CREATED: "pending",
    AUTHENTICATING: "connecting",
    AWAITING_MOBILE_BANKID_AUTHENTICATION: "awaiting_bankid",
    AWAITING_SUPPLEMENTAL_INFORMATION: "needs_input",
    UPDATING: "syncing",
    UPDATED: "connected",
    AUTHENTICATION_ERROR: "expired",
    TEMPORARY_ERROR: "error",
    PERMANENT_ERROR: "failed",
    DISABLED: "disabled",
    SESSION_EXPIRED: "expired",
  };

  return statusMap[status] || "unknown";
}

export default router;
