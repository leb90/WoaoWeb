import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(process.cwd(), "..", "..");
const SCREENSHOT_DIR = path.join(ROOT, ".codex-run", "screenshots");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const FRONTEND = "http://localhost:3000";
const PASSWORD = "Aodrag22!";
const TOURNAMENT_NPC = { x: 26, y: 64 };

const firstAccount = {
  email: "eze.rc177@gmail.com",
  password: PASSWORD,
};

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const runLetters = lettersFromNumber(Date.now());
const firstCharacterName = `DuelA${runLetters}`;
const secondCharacterName = `DuelB${runLetters}`;
const secondAccount = {
  name: `User${runLetters}`,
  email: `codexduel${Date.now()}@example.com`,
  password: PASSWORD,
};

const consoleMessages = [];
const failedRequests = [];
const badResponses = [];

await fs.mkdir(SCREENSHOT_DIR, { recursive: true });

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

function logStep(message) {
  console.log(`[tournament] ${message}`);
}

async function screenshot(page, name) {
  const file = path.join(SCREENSHOT_DIR, `${stamp}-${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  console.log(`[screenshot] ${file}`);
}

async function installObservers(page, label) {
  page.on("console", (message) => {
    const type = message.type();
    const text = message.text();
    consoleMessages.push({ label, type, text });
    if (type === "error") {
      console.log(`[${label}:console:${type}] ${text}`);
    }
  });

  page.on("requestfailed", (request) => {
    const failure = request.failure();
    failedRequests.push({
      label,
      url: request.url(),
      method: request.method(),
      errorText: failure?.errorText ?? "request failed",
    });
    console.log(`[${label}:request-failed] ${request.method()} ${request.url()} ${failure?.errorText ?? ""}`);
  });

  page.on("response", (response) => {
    const status = response.status();
    const url = response.url();
    if (status >= 400 && !url.includes("/favicon.ico")) {
      badResponses.push({ label, status, url });
      console.log(`[${label}:bad-response] ${status} ${url}`);
    }
  });
}

async function login(page, account) {
  await page.goto(`${FRONTEND}/login`, { waitUntil: "domcontentloaded" });
  await page.getByPlaceholder(/Email|usuario/i).fill(account.email);
  await page.locator('input[type="password"]').fill(account.password);
  await page.getByRole("button", { name: /^Entrar$/i }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"), {
    timeout: 20000,
  });
}

async function register(page, account) {
  await page.goto(`${FRONTEND}/register`, { waitUntil: "domcontentloaded" });
  await page.getByPlaceholder(/Nombre de usuario/i).fill(account.name);
  await page.getByPlaceholder(/^Email$/i).fill(account.email);
  const passwords = page.locator('input[type="password"]');
  await passwords.nth(0).fill(account.password);
  await passwords.nth(1).fill(account.password);
  await page.getByRole("button", { name: /^Crear cuenta$/i }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/register"), {
    timeout: 20000,
  });
}

async function createCharacter(page, name) {
  await page.goto(`${FRONTEND}/createcharacter`, { waitUntil: "domcontentloaded" });
  await page.getByPlaceholder(/Nombre del personaje/i).waitFor({ timeout: 20000 });
  await page.getByPlaceholder(/Nombre del personaje/i).fill(name);
  await screenshot(page, `create-${name}`);
  await page.getByRole("button", { name: /^CREAR$/i }).click();
  await page.waitForURL(/\/characters/, { timeout: 30000 });
  await page.getByText(name, { exact: true }).waitFor({ timeout: 30000 });
  logStep(`personaje creado: ${name}`);
}

function sqlLiteral(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function runDbSql(sql) {
  execFileSync(
    "docker",
    ["exec", "aoweb-postgres", "psql", "-U", "postgres", "-d", "aoweb", "-v", "ON_ERROR_STOP=1", "-c", sql],
    { stdio: "pipe" },
  );
}

function prepareCharacterPosition(name, x, y) {
  runDbSql(`
    UPDATE characters
    SET map_id = 34,
        pos_x = ${x},
        pos_y = ${y},
        home_map = 34,
        home_x = ${x},
        home_y = ${y},
        connected = false,
        dead = false,
        muerto = false,
        navegando = false,
        hp = max_hp,
        mana = max_mana
    WHERE name = ${sqlLiteral(name)};
  `);
  logStep(`${name} preparado en mapa 34 @ ${x},${y}`);
}

async function selectCharacterAndEnter(page, name) {
  await page.goto(`${FRONTEND}/characters`, { waitUntil: "domcontentloaded" });
  await page.getByText(name, { exact: true }).waitFor({ timeout: 30000 });
  await page.getByText(name, { exact: true }).click();
  await page.waitForURL(/\/play/, { timeout: 30000 });
  await page.locator("canvas").first().waitFor({ timeout: 60000 });
  await page.waitForTimeout(6500);
  await dismissGamePrompts(page);
  await screenshot(page, `entered-${name}`);
  logStep(`${name} entro al juego`);
}

async function dismissGamePrompts(page) {
  const continueSmall = page.getByRole("button", { name: /Seguir asi/i });
  if (await continueSmall.count()) {
    await continueSmall.first().click().catch(() => {});
    await page.waitForTimeout(400);
  }

  const understood = page.getByRole("button", { name: /Entendido/i });
  if (await understood.count()) {
    await understood.first().click().catch(() => {});
    await page.waitForTimeout(400);
  }
}

async function getGameCanvas(page) {
  const canvases = await page.locator("canvas").elementHandles();
  let best = null;
  for (const canvas of canvases) {
    const box = await canvas.boundingBox();
    if (!box) continue;
    const area = box.width * box.height;
    if (!best || area > best.area) {
      best = { canvas, box, area };
    }
  }
  if (!best) {
    throw new Error("No se encontro canvas de juego.");
  }
  return best;
}

async function clickTileFromPlayer(page, playerPos, targetPos) {
  const { box } = await getGameCanvas(page);
  const tileWidth = box.width / 25;
  const tileHeight = box.height / 16;
  const dx = targetPos.x - playerPos.x;
  const dy = targetPos.y - playerPos.y;
  const x = box.x + box.width / 2 + dx * tileWidth;
  const y = box.y + box.height / 2 + dy * tileHeight;
  await page.mouse.click(x, y);
  await page.waitForTimeout(600);
}

async function sendChatCommand(page, command) {
  await page.keyboard.press("Enter");
  const input = page.locator('form input[type="text"]').last();
  await input.waitFor({ timeout: 5000 });
  await input.fill(command);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(1800);
}

async function enterTournament(page, name, playerPos) {
  await dismissGamePrompts(page);
  await clickTileFromPlayer(page, playerPos, TOURNAMENT_NPC);
  await sendChatCommand(page, "/torneo");
  await screenshot(page, `torneo-${name}`);
  const bodyText = await page.locator("body").innerText();
  if (!/Entraste a la sala de Torneos 1vs1/i.test(bodyText)) {
    throw new Error(`${name} no recibio confirmacion de entrada al torneo.`);
  }
  logStep(`${name} recibio confirmacion de /torneo`);
}

const browser = await chromium.launch({
  headless: false,
  slowMo: 100,
  executablePath: CHROME,
  args: ["--window-size=1440,950"],
});

try {
  const contextA = await browser.newContext({
    viewport: { width: 1366, height: 900 },
    ignoreHTTPSErrors: true,
  });
  const contextB = await browser.newContext({
    viewport: { width: 1366, height: 900 },
    ignoreHTTPSErrors: true,
  });
  const pageA = await contextA.newPage();
  const pageB = await contextB.newPage();
  await installObservers(pageA, "cuenta-a");
  await installObservers(pageB, "cuenta-b");

  await login(pageA, firstAccount);
  await createCharacter(pageA, firstCharacterName);

  await register(pageB, secondAccount);
  await createCharacter(pageB, secondCharacterName);

  prepareCharacterPosition(firstCharacterName, 26, 65);
  prepareCharacterPosition(secondCharacterName, 27, 65);

  await selectCharacterAndEnter(pageA, firstCharacterName);
  await selectCharacterAndEnter(pageB, secondCharacterName);

  await enterTournament(pageA, firstCharacterName, { x: 26, y: 65 });
  await enterTournament(pageB, secondCharacterName, { x: 27, y: 65 });

  await pageA.waitForTimeout(1500);
  await screenshot(pageA, "torneo-final-a");
  await screenshot(pageB, "torneo-final-b");

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
    firstCharacterName,
    secondCharacterName,
    secondAccountEmail: secondAccount.email,
    consoleErrors: relevantConsoleErrors,
    failedRequests,
    badResponses: relevantBadResponses,
    screenshotsDir: SCREENSHOT_DIR,
  };
  console.log(`[result] ${JSON.stringify(result, null, 2)}`);

  if (relevantConsoleErrors.length || failedRequests.length || relevantBadResponses.length) {
    process.exitCode = 2;
  }

  await pageA.waitForTimeout(2500);
} finally {
  await browser.close();
}
