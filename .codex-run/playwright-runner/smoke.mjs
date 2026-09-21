import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(process.cwd(), "..", "..");
const SCREENSHOT_DIR = path.join(ROOT, ".codex-run", "screenshots");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const FRONTEND = "http://localhost:3000";

const account = {
  email: "eze.rc177@gmail.com",
  password: "Aodrag22!",
};

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
function lettersFromNumber(value) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  let current = value;
  let result = "";
  for (let i = 0; i < 7; i += 1) {
    result += alphabet[current % alphabet.length];
    current = Math.floor(current / alphabet.length);
  }
  return result;
}

const characterName = `Codex${lettersFromNumber(Date.now())}`;
const consoleMessages = [];
const failedRequests = [];
const badResponses = [];

await fs.mkdir(SCREENSHOT_DIR, { recursive: true });

function logStep(message) {
  console.log(`[e2e] ${message}`);
}

async function screenshot(page, name) {
  const file = path.join(SCREENSHOT_DIR, `${stamp}-${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  console.log(`[screenshot] ${file}`);
}

async function waitAndScreenshot(page, name, ms = 700) {
  await page.waitForTimeout(ms);
  await screenshot(page, name);
}

async function installObservers(page) {
  page.on("console", (message) => {
    const type = message.type();
    const text = message.text();
    consoleMessages.push({ type, text });
    if (type === "error") {
      console.log(`[browser-console:${type}] ${text}`);
    }
  });

  page.on("requestfailed", (request) => {
    const failure = request.failure();
    failedRequests.push({
      url: request.url(),
      method: request.method(),
      errorText: failure?.errorText ?? "request failed",
    });
    console.log(`[request-failed] ${request.method()} ${request.url()} ${failure?.errorText ?? ""}`);
  });

  page.on("response", (response) => {
    const status = response.status();
    const url = response.url();
    if (status >= 400 && !url.includes("/favicon.ico")) {
      badResponses.push({ status, url });
      console.log(`[bad-response] ${status} ${url}`);
    }
  });
}

async function fillLogin(page) {
  await page.goto(`${FRONTEND}/login`, { waitUntil: "domcontentloaded" });
  await page.getByPlaceholder(/Email|usuario/i).fill(account.email);
  await page.locator('input[type="password"]').fill(account.password);
  await screenshot(page, "01-login-filled");
  await Promise.all([
    page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 20000 }),
    page.getByRole("button", { name: /^Entrar$/i }).click(),
  ]);
  logStep(`login OK -> ${page.url()}`);
}

async function createCharacter(page) {
  await page.goto(`${FRONTEND}/createcharacter`, { waitUntil: "domcontentloaded" });
  await page.getByPlaceholder(/Nombre del personaje/i).waitFor({ timeout: 20000 });
  await page.getByPlaceholder(/Nombre del personaje/i).fill(characterName);
  await waitAndScreenshot(page, "02-create-character-ready", 1000);
  await Promise.all([
    page.waitForURL(/\/characters/, { timeout: 30000 }),
    page.getByRole("button", { name: /^CREAR$/i }).click(),
  ]);
  await page.getByText(characterName, { exact: true }).waitFor({ timeout: 30000 });
  await screenshot(page, "03-character-created");
  logStep(`personaje creado: ${characterName}`);
}

async function enterGame(page) {
  await page.goto(`${FRONTEND}/characters`, { waitUntil: "domcontentloaded" });
  await page.getByText(characterName, { exact: true }).waitFor({ timeout: 30000 });
  await Promise.all([
    page.waitForURL(/\/play/, { timeout: 30000 }),
    page.getByText(characterName, { exact: true }).click(),
  ]);

  await page.locator("canvas").first().waitFor({ timeout: 60000 });
  await page.waitForTimeout(8000);
  const continueSmall = page.getByRole("button", { name: /Seguir asi/i });
  if (await continueSmall.count()) {
    await continueSmall.first().click().catch(() => {});
    await page.waitForTimeout(500);
  }
  const understood = page.getByRole("button", { name: /Entendido/i });
  if (await understood.count()) {
    await understood.first().click().catch(() => {});
    await page.waitForTimeout(500);
  }
  await waitAndScreenshot(page, "04-game-loaded", 1000);
  logStep(`juego cargado con ${characterName}`);
}

const browser = await chromium.launch({
  headless: false,
  slowMo: 120,
  executablePath: CHROME,
  args: ["--window-size=1440,950"],
});

try {
  const context = await browser.newContext({
    viewport: { width: 1366, height: 900 },
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();
  await installObservers(page);

  await fillLogin(page);
  await createCharacter(page);
  await enterGame(page);

  const relevantBadResponses = badResponses.filter(
    (entry) =>
      !(
        entry.status === 401 &&
        entry.url.includes("/api/auth/me")
      ),
  );
  const relevantConsoleErrors = consoleMessages.filter(
    (entry) =>
      entry.type === "error" &&
      entry.text !==
        "Failed to load resource: the server responded with a status of 401 (Unauthorized)",
  );
  const result = {
    characterName,
    consoleErrors: relevantConsoleErrors,
    failedRequests,
    badResponses: relevantBadResponses,
    screenshotsDir: SCREENSHOT_DIR,
  };
  console.log(`[result] ${JSON.stringify(result, null, 2)}`);

  if (relevantConsoleErrors.length || failedRequests.length || relevantBadResponses.length) {
    process.exitCode = 2;
  }

  await page.waitForTimeout(3000);
} finally {
  await browser.close();
}
