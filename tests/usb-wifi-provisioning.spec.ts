import { test, expect } from "bun:test";
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const CHROMIUM_PATH = "/home/juankio/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome";

test("UsbWifiModal - Aprovisionamiento Wi-Fi por USB Playwright Sniper Suite", async () => {
  const screenshotsDir = path.join(import.meta.dir, "screenshots");
  await mkdir(screenshotsDir, { recursive: true });

  const consoleErrors: string[] = [];
  const consoleWarnings: string[] = [];
  const pageErrors: string[] = [];

  const browser = await chromium.launch({
    executablePath: CHROMIUM_PATH,
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    permissions: ["clipboard-read", "clipboard-write"],
  });

  const page = await context.newPage();

  page.on("console", (msg) => {
    const type = msg.type();
    const text = msg.text();
    if (type === "error") {
      consoleErrors.push(text);
    } else if (type === "warning") {
      consoleWarnings.push(text);
    }
  });

  page.on("pageerror", (err) => {
    pageErrors.push(err.message);
  });

  try {
    // 1. Carga con waitUntil: "domcontentloaded" (NUNCA networkidle)
    console.log("[QA Step 1] Navegando a http://localhost:3000 con domcontentloaded...");
    await page.goto("http://localhost:3000", {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });
    await page.waitForTimeout(500);

    const title = await page.title();
    expect(title).toContain("Air Guardian");

    // 2. Localizar y pulsar el botón "USB ESP32" de la cabecera
    console.log("[QA Step 2] Pulsando botón 'USB ESP32' en la cabecera...");
    const usbHeaderBtn = page.locator("header button:has-text('USB ESP32')");
    await usbHeaderBtn.waitFor({ state: "visible", timeout: 5000 });
    expect(await usbHeaderBtn.isVisible()).toBe(true);

    await usbHeaderBtn.click({ force: true });
    await page.waitForTimeout(400); // reposo animación Anime.js

    // 3. Verificar apertura del modal y título "Aprovisionamiento Wi-Fi por USB"
    console.log("[QA Step 3] Verificando título del modal 'Aprovisionamiento Wi-Fi por USB'...");
    const modalTitle = page.locator("h3:has-text('Aprovisionamiento Wi-Fi por USB')");
    await modalTitle.waitFor({ state: "visible", timeout: 5000 });
    expect(await modalTitle.isVisible()).toBe(true);

    // 4. Comprobar botón "Conectar ESP32 (USB)"
    console.log("[QA Step 4] Comprobando presencia de botón 'Conectar ESP32 (USB)'...");
    const connectBtn = page.locator("button:has-text('Conectar ESP32 (USB)')");
    expect(await connectBtn.isVisible()).toBe(true);

    // 5. Comprobar campos de texto: Red Wi-Fi (SSID), Clave Wi-Fi, Servidor Backend
    console.log("[QA Step 5] Comprobando campos de texto SSID, Clave, Servidor Backend...");
    const ssidLabel = page.locator("label:has-text('Red Wi-Fi (SSID)')");
    expect(await ssidLabel.isVisible()).toBe(true);
    const ssidInput = page.locator("input[placeholder='Mi_Red_WiFi']");
    expect(await ssidInput.isVisible()).toBe(true);

    const passLabel = page.locator("label:has-text('Clave Wi-Fi')");
    expect(await passLabel.isVisible()).toBe(true);
    const passInput = page.locator("input[placeholder='••••••••']");
    expect(await passInput.isVisible()).toBe(true);

    const serverLabel = page.locator("label:has-text('Servidor Backend')");
    expect(await serverLabel.isVisible()).toBe(true);
    const serverInput = page.locator("input[placeholder='192.168.1.100']");
    expect(await serverInput.isVisible()).toBe(true);

    // 6. Comprobar terminal CRT de fósforo ámbar (AmberTerminal)
    console.log("[QA Step 6] Comprobando terminal CRT AmberTerminal...");
    const terminalTitle = page.locator("text=MONITOR SERIE FÓSFORO ÁMBAR");
    expect(await terminalTitle.isVisible()).toBe(true);
    const terminalBaud = page.locator("text=115200 • 8N1");
    expect(await terminalBaud.isVisible()).toBe(true);
    const terminalWaiting = page.locator("text=Terminal de fósforo ámbar en espera de telemetría");
    expect(await terminalWaiting.isVisible()).toBe(true);

    // 7. Comprobar botón "Transmitir al ESP32"
    console.log("[QA Step 7] Comprobando presencia de botón 'Transmitir al ESP32'...");
    const transmitBtn = page.locator("button:has-text('Transmitir al ESP32')");
    expect(await transmitBtn.isVisible()).toBe(true);

    // 8. Cerrar modal con botón X
    console.log("[QA Step 8] Cerrando modal con botón X...");
    const closeBtn = page.locator(".fixed.inset-0 button:has(svg.lucide-xicon), .fixed.inset-0 button:has(svg[class*='xicon']), .fixed.inset-0 button[title='Cerrar modal']").first();
    expect(await closeBtn.isVisible()).toBe(true);
    await closeBtn.click({ force: true });

    await modalTitle.waitFor({ state: "hidden", timeout: 5000 });
    expect(await modalTitle.isVisible()).toBe(false);

    // 9. Comprobar ausencia de excepciones o errores de consola
    console.log("[QA Step 9] Verificando cero errores de consola y cero excepciones...");
    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);

    console.log("✅ UsbWifiModal Playwright Suite completada con éxito!");
  } finally {
    await browser.close();
  }
}, 30000);
