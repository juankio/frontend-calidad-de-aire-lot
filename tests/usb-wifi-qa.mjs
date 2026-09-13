import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const CHROMIUM_PATH = "/home/juankio/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome";

async function runUsbWifiSniperQA() {
  console.log("================================================================================");
  console.log("🎯  [USOPP SNIPER QA] VALIDACIÓN DISPARO CERTERO: USB WIFI PROVISIONING MODAL");
  console.log("🎯  OBJETIVO: MODAL UsbWifiModal & AmberTerminal EN http://localhost:3000");
  console.log("================================================================================");

  const testResults = [];
  const consoleErrors = [];
  const consoleWarnings = [];
  const pageErrors = [];

  const logStep = (msg) => console.log(`[${new Date().toISOString().substring(11, 19)}] ${msg}`);
  const recordResult = (name, passed, details = "") => {
    testResults.push({ name, passed, details });
    const mark = passed ? "✅ [PASS]" : "❌ [FAIL]";
    logStep(`  ${mark} ${name} ${details ? `-> ${details}` : ""}`);
  };

  const screenshotsDir = path.join(process.cwd(), "tests", "screenshots");
  await mkdir(screenshotsDir, { recursive: true });

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

  // Escucha rigurosa de errores de consola y excepciones no controladas
  page.on("console", (msg) => {
    const type = msg.type();
    const text = msg.text();
    if (type === "error") {
      consoleErrors.push(text);
      console.log(`  ❌ [CONSOLA ERROR] ${text}`);
    } else if (type === "warning") {
      consoleWarnings.push(text);
    }
  });

  page.on("pageerror", (err) => {
    pageErrors.push(err.message);
    console.log(`  ❌ [PAGE EXCEPTION] ${err.message}`);
  });

  try {
    // ----------------------------------------------------------------------
    // TIRO 1: Carga de página con domcontentloaded (NUNCA networkidle)
    // ----------------------------------------------------------------------
    logStep("🎯 TIRO 1: Navegando a http://localhost:3000 con waitUntil: 'domcontentloaded'...");
    await page.goto("http://localhost:3000", {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });
    await page.waitForTimeout(600); // Reposo para hidratación de Vue 3 / Nuxt 3

    const pageTitle = await page.title();
    recordResult(
      "Navegación y Título de Página",
      pageTitle.includes("Air Guardian"),
      `Título obtenido: "${pageTitle}"`
    );

    await page.screenshot({ path: path.join(screenshotsDir, "usb-01-dashboard.png") });

    // ----------------------------------------------------------------------
    // TIRO 2: Localización y clic en el botón "USB ESP32" de la cabecera
    // ----------------------------------------------------------------------
    logStep("🎯 TIRO 2: Localización y pulsación del botón 'USB ESP32' en la cabecera...");
    const usbHeaderBtn = page.locator("header button:has-text('USB ESP32')");
    await usbHeaderBtn.waitFor({ state: "visible", timeout: 5000 });
    const isUsbBtnVisible = await usbHeaderBtn.isVisible();

    recordResult(
      "Presencia del Botón 'USB ESP32' en Cabecera",
      isUsbBtnVisible,
      "Botón de enlace serie Web Serial ubicado en el header"
    );

    // Verificar que el modal no está visible antes del clic
    const modalTitleBefore = page.locator("h3:has-text('Aprovisionamiento Wi-Fi por USB')");
    const isModalOpenBefore = await modalTitleBefore.isVisible();
    recordResult(
      "Modal Cerrado Previamente",
      !isModalOpenBefore,
      "El modal UsbWifiModal permanece inactivo antes de la interacción"
    );

    // Clic en el botón USB ESP32
    await usbHeaderBtn.click({ force: true });
    await page.waitForTimeout(400); // Tiempo para la animación Anime.js del modal

    await page.screenshot({ path: path.join(screenshotsDir, "usb-02-modal-abierto.png") });

    // ----------------------------------------------------------------------
    // TIRO 3: Verificación del Título "Aprovisionamiento Wi-Fi por USB"
    // ----------------------------------------------------------------------
    logStep("🎯 TIRO 3: Verificación del Título 'Aprovisionamiento Wi-Fi por USB' en UsbWifiModal...");
    await modalTitleBefore.waitFor({ state: "visible", timeout: 5000 });
    const isTitleVisible = await modalTitleBefore.isVisible();
    const titleText = await modalTitleBefore.innerText();

    recordResult(
      "Título del Modal 'Aprovisionamiento Wi-Fi por USB'",
      isTitleVisible && titleText.includes("Aprovisionamiento Wi-Fi por USB"),
      `Título renderizado: "${titleText.trim()}"`
    );

    // ----------------------------------------------------------------------
    // TIRO 4: Comprobación del Botón "Conectar ESP32 (USB)"
    // ----------------------------------------------------------------------
    logStep("🎯 TIRO 4: Verificación del botón 'Conectar ESP32 (USB)'...");
    const connectBtn = page.locator("button:has-text('Conectar ESP32 (USB)')");
    const isConnectBtnVisible = await connectBtn.isVisible();

    recordResult(
      "Presencia del Botón 'Conectar ESP32 (USB)'",
      isConnectBtnVisible,
      "Botón de solicitud de puerto serie Web Serial disponible"
    );

    // ----------------------------------------------------------------------
    // TIRO 5: Comprobación de los Campos de Texto: SSID, Clave, Servidor
    // ----------------------------------------------------------------------
    logStep("🎯 TIRO 5: Verificación de Campos de Texto (SSID, Clave Wi-Fi, Servidor Backend)...");
    const ssidLabel = page.locator("label:has-text('Red Wi-Fi (SSID)')");
    const ssidInput = page.locator("input[placeholder='Mi_Red_WiFi']");
    const isSsidOk = (await ssidLabel.isVisible()) && (await ssidInput.isVisible());

    recordResult(
      "Campo de Texto: Red Wi-Fi (SSID)",
      isSsidOk,
      "Etiqueta y caja de texto para SSID verificadas"
    );

    const passLabel = page.locator("label:has-text('Clave Wi-Fi')");
    const passInput = page.locator("input[placeholder='••••••••']");
    const isPassOk = (await passLabel.isVisible()) && (await passInput.isVisible());

    recordResult(
      "Campo de Texto: Clave Wi-Fi",
      isPassOk,
      "Etiqueta y caja de texto para clave WPA2/WPA3 verificadas"
    );

    const serverLabel = page.locator("label:has-text('Servidor Backend')");
    const serverInput = page.locator("input[placeholder='192.168.1.100']");
    const isServerOk = (await serverLabel.isVisible()) && (await serverInput.isVisible());

    recordResult(
      "Campo de Texto: Servidor Backend",
      isServerOk,
      "Etiqueta y caja de texto para host/IP de telemetría verificadas"
    );

    // Probar llenado interactivo de prueba
    await ssidInput.fill("AirGuardian_Lab_2G");
    await passInput.fill("KabutoSniper2026");
    await serverInput.fill("192.168.1.150");

    await page.screenshot({ path: path.join(screenshotsDir, "usb-03-formulario-rellenado.png") });

    // ----------------------------------------------------------------------
    // TIRO 6: Comprobación del Terminal CRT de Fósforo Ámbar (AmberTerminal)
    // ----------------------------------------------------------------------
    logStep("🎯 TIRO 6: Verificación de Terminal CRT de Fósforo Ámbar (AmberTerminal)...");
    const terminalTitle = page.locator("text=MONITOR SERIE FÓSFORO ÁMBAR");
    const terminalBaudRate = page.locator("text=115200 • 8N1");
    const terminalStatus = page.locator("text=SIN ENLACE");
    const terminalEmptyNotice = page.locator("text=Terminal de fósforo ámbar en espera de telemetría");

    const isTerminalOk =
      (await terminalTitle.isVisible()) &&
      (await terminalBaudRate.isVisible()) &&
      (await terminalStatus.isVisible()) &&
      (await terminalEmptyNotice.isVisible());

    recordResult(
      "Terminal CRT de Fósforo Ámbar (AmberTerminal)",
      isTerminalOk,
      "Monitor CRT con cabecera 115200 • 8N1 y placeholder de telemetría activo"
    );

    // ----------------------------------------------------------------------
    // TIRO 7: Comprobación del Botón "Transmitir al ESP32"
    // ----------------------------------------------------------------------
    logStep("🎯 TIRO 7: Verificación del botón 'Transmitir al ESP32'...");
    const transmitBtn = page.locator("button:has-text('Transmitir al ESP32')");
    const isTransmitVisible = await transmitBtn.isVisible();

    recordResult(
      "Presencia del Botón 'Transmitir al ESP32'",
      isTransmitVisible,
      "Botón de despacho JSON NVS presente en la barra de acciones"
    );

    // ----------------------------------------------------------------------
    // TIRO 8: Cierre del modal con el botón X
    // ----------------------------------------------------------------------
    logStep("🎯 TIRO 8: Cierre del modal con botón X...");
    const closeBtn = page.locator(".fixed.inset-0 button:has(svg.lucide-xicon), .fixed.inset-0 button:has(svg[class*='xicon']), .fixed.inset-0 button[title='Cerrar modal']").first();
    const isCloseBtnVisible = await closeBtn.isVisible();
    recordResult(
      "Botón X de Cierre Presente",
      isCloseBtnVisible,
      "Control de descarte del modal detectado"
    );

    await closeBtn.click({ force: true });
    await modalTitleBefore.waitFor({ state: "hidden", timeout: 5000 });
    const isModalClosedAfter = !(await modalTitleBefore.isVisible());

    recordResult(
      "Cierre Exitoso de UsbWifiModal",
      isModalClosedAfter,
      "Modal retirado del DOM / oculto tras pulsar botón X"
    );

    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(screenshotsDir, "usb-04-modal-cerrado.png") });

    // ----------------------------------------------------------------------
    // TIRO 9: Auditoría de Cero Errores y Cero Excepciones
    // ----------------------------------------------------------------------
    logStep("🎯 TIRO 9: Auditoría de estabilidad de consola y runtime...");
    recordResult(
      "Cero Errores en Consola (console.error)",
      consoleErrors.length === 0,
      `Errores detectados: ${consoleErrors.length}${consoleErrors.length ? ` (${consoleErrors.join("; ")})` : ""}`
    );

    recordResult(
      "Cero Excepciones no controladas (pageerror)",
      pageErrors.length === 0,
      `Excepciones detectadas: ${pageErrors.length}${pageErrors.length ? ` (${pageErrors.join("; ")})` : ""}`
    );

    const allPassed = testResults.every((r) => r.passed);

    console.log("\n================================================================================");
    if (allPassed) {
      console.log("🎯🎯🎯 ¡DIANA PERFECTA! TODOS LOS DISPAROS DE QA AL 100% GREEN 🎯🎯🎯");
      console.log("🎯 USO-PP: '¡No hay ni un solo bug que escape a mi tirachinas Kabuto!'");
    } else {
      console.log("💥 ALERTA: SE DETECTARON DISPAROS FALLIDOS.");
    }
    console.log("================================================================================\n");

    return {
      allPassed,
      testResults,
      consoleErrors,
      pageErrors,
    };
  } finally {
    await browser.close();
  }
}

runUsbWifiSniperQA()
  .then((res) => {
    if (!res.allPassed) process.exit(1);
  })
  .catch((err) => {
    console.error("💥 ERROR CRÍTICO EN QA RUNNER:", err);
    process.exit(1);
  });
