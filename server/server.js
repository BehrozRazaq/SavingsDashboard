import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import authRoutes from "./routes/auth.js";

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Middleware
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true, // Allow cookies to be sent
  })
);
app.use(cookieParser());
app.use(express.json());

// Mount Tink authentication routes
app.use("/api/tink", authRoutes);

// API Status endpoint
app.get("/api/status", (req, res) => {
  res.json({
    status: "online",
    service: "FluxFinance API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    endpoints: [
      "GET /api/status",
      "GET /api/tink/connect",
      "GET /api/tink/callback",
      "GET /api/tink/status",
      "GET /api/transactions",
      "POST /api/calculate/fire",
      "POST /api/calculate/runway",
      "POST /api/calculate/compound",
      "POST /api/calculate/inflation",
    ],
  });
});

// FIRE Calculator endpoint
app.post("/api/calculate/fire", (req, res) => {
  const { netWorth, monthlySavings, annualReturn } = req.body;

  // Validate inputs
  if (!netWorth || !monthlySavings || annualReturn === undefined) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  const targetWealth = monthlySavings * 12 * 25; // 25x annual expenses (4% rule)
  const monthlyReturn = annualReturn / 100 / 12;

  let currentWealth = parseFloat(netWorth);
  let months = 0;
  const maxMonths = 1200; // 100 years max

  while (currentWealth < targetWealth && months < maxMonths) {
    currentWealth =
      currentWealth * (1 + monthlyReturn) + parseFloat(monthlySavings);
    months++;
  }

  const years = months / 12;

  res.json({
    yearsToFIRE: Math.round(years * 10) / 10,
    targetWealth: Math.round(targetWealth),
    projectedWealth: Math.round(currentWealth),
  });
});

// Runway Calculator endpoint
app.post("/api/calculate/runway", (req, res) => {
  const { totalCash, monthlyBurn } = req.body;

  if (!totalCash || !monthlyBurn) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  const MONTHS_PER_YEAR = 12;
  const DAYS_PER_MONTH = 30;
  const HOURS_PER_DAY = 24;
  const MINUTES_PER_HOUR = 60;
  const SECONDS_PER_MINUTE = 60;
  const MS_PER_SECOND = 1000;
  const MS_PER_MONTH =
    DAYS_PER_MONTH *
    HOURS_PER_DAY *
    MINUTES_PER_HOUR *
    SECONDS_PER_MINUTE *
    MS_PER_SECOND;

  const months = parseFloat(totalCash) / parseFloat(monthlyBurn);
  const years = months / MONTHS_PER_YEAR;

  res.json({
    monthsRemaining: Math.round(months * 10) / 10,
    yearsRemaining: Math.round(years * 10) / 10,
    runwayDate: new Date(Date.now() + months * MS_PER_MONTH).toISOString(),
  });
});

// Compound Interest Calculator endpoint
app.post("/api/calculate/compound", (req, res) => {
  const { principal, monthlyContribution, annualReturn, years } = req.body;

  if (
    principal === undefined ||
    monthlyContribution === undefined ||
    annualReturn === undefined ||
    !years
  ) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  const monthlyRate = parseFloat(annualReturn) / 100 / 12;
  const totalMonths = parseInt(years) * 12;
  const data = [];

  let balance = parseFloat(principal);
  let totalContributions = parseFloat(principal);

  for (let month = 0; month <= totalMonths; month++) {
    if (month % 12 === 0) {
      data.push({
        year: month / 12,
        balance: Math.round(balance),
        contributions: Math.round(totalContributions),
        interest: Math.round(balance - totalContributions),
      });
    }

    if (month < totalMonths) {
      balance = balance * (1 + monthlyRate) + parseFloat(monthlyContribution);
      totalContributions += parseFloat(monthlyContribution);
    }
  }

  res.json({
    finalBalance: Math.round(balance),
    totalContributions: Math.round(totalContributions),
    totalInterest: Math.round(balance - totalContributions),
    data,
  });
});

// Inflation Adjuster endpoint
app.post("/api/calculate/inflation", (req, res) => {
  const { currentAmount, inflationRate, years } = req.body;

  if (!currentAmount || !inflationRate || !years) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  const rate = parseFloat(inflationRate) / 100;
  const futureValue =
    parseFloat(currentAmount) * Math.pow(1 + rate, parseInt(years));
  const realValue =
    parseFloat(currentAmount) / Math.pow(1 + rate, parseInt(years));
  const purchasingPowerLoss =
    ((parseFloat(currentAmount) - realValue) / parseFloat(currentAmount)) * 100;

  res.json({
    futureEquivalent: Math.round(futureValue),
    realValue: Math.round(realValue * 100) / 100,
    purchasingPowerLoss: Math.round(purchasingPowerLoss * 10) / 10,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start server
app.listen(PORT, () => {
  console.log(`
  ╔═════════════════════════════════╗
  ║                                 ║
  ║   🚀 FluxFinance API Server     ║
  ║                                 ║
  ║   Status: Online                ║
  ║   Port:   ${PORT}                  ║
  ║   Mode:   ${process.env.NODE_ENV || "development"}           ║
  ║                                 ║
  ╚═════════════════════════════════╝
  `);
});

export default app;
