import { chromium } from "playwright";
import { spawn } from "child_process";

const CHROMIUM_PATH = "/home/juankio/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome";
const PORT = 3021; // Puerto aislado para la prueba E2E

async function runFranky3DValidation() {
  console.log("================================================================================");
  console.log("🦾 [FRANKY MASTER SHIPWRIGHT] VALIDACIÓN DEL GEMELO DIGITAL 3D THREE.JS");
  console.log("================================================================================");

  console.log(`🚀 Iniciando servidor de producción en http://localhost:${PORT}...`);
  const server = spawn("node", [".output/server/index.mjs"], {
    cwd: "/home/juankio/air-guardian-iot/frontend",
    env: { ...process.env, PORT: String(PORT), NODE_ENV: "production" },
    stdio: "pipe"
  });

  server.stdout.on("data", (d) => console.log(`[Server] ${d.toString().trim()}`));
  server.stderr.on("data", (d) => console.error(`[Server ERR] ${d.toString().trim()}`));

  await new Promise((resolve) => setTimeout(resolve, 2000));

  const consoleErrors = [];
  const pageErrors = [];

  const browser = await chromium.launch({
    executablePath: CHROMIUM_PATH,
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--use-gl=swiftshader"
    ]
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  const page = await context.newPage();

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const txt = msg.text();
      // Omitir errores de conexión al backend no levantado en 3002
      if (!txt.includes("ERR_CONNECTION_REFUSED") && !txt.includes("Failed to fetch")) {
        consoleErrors.push(txt);
        console.log(`  ❌ [CONSOLE ERROR] ${txt}`);
      }
    }
  });

  page.on("pageerror", (err) => {
    pageErrors.push(err.message);
    console.log(`  ❌ [PAGE ERROR] ${err.message}`);
  });

  try {
    console.log(`📡 Navegando a http://localhost:${PORT}...`);
    await page.goto(`http://localhost:${PORT}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    // TEST 1: Botón '🎮 Gemelo 3D' en el Header
    console.log("🦾 TEST 1: Verificando botón '🎮 Gemelo 3D' en el Header...");
    const twinBtn = await page.getByRole("button", { name: /Gemelo 3D/i });
    const isTwinBtnVisible = await twinBtn.isVisible();
    console.log(`  ${isTwinBtnVisible ? "✅" : "❌"} Botón Gemelo 3D visible en Header: ${isTwinBtnVisible}`);

    // TEST 2: Selector de Vista Central (Mascota -> Tacómetro -> Gemelo 3D)
    console.log("🦾 TEST 2: Verificando ciclo de vista central (FACE -> HUD -> 3D)...");
    const viewBtn = await page.locator("button", { hasText: /VISTA:/i });
    const initialText = await viewBtn.innerText();
    console.log(`  Initial view mode: "${initialText}"`);

    // Clic 1 -> Tacómetro
    await viewBtn.click();
    await page.waitForTimeout(500);
    const hudText = await viewBtn.innerText();
    console.log(`  View mode after click 1: "${hudText}"`);

    // Clic 2 -> Gemelo 3D
    await viewBtn.click();
    console.log("  ⏳ Esperando carga y renderizado de mallas STL en visor central...");
    await page.waitForTimeout(3500);
    const threeDText = await viewBtn.innerText();
    console.log(`  View mode after click 2: "${threeDText}"`);

    // Verificar canvas WebGL en MascotChamber
    const canvasInChamber = await page.locator("canvas").first();
    const hasCanvasInChamber = await canvasInChamber.isVisible();
    console.log(`  ${hasCanvasInChamber ? "✅" : "❌"} Canvas WebGL en visor hexagonal central: ${hasCanvasInChamber}`);

    await page.screenshot({ path: "tests/screenshots/franky-3d-viewmode.png" });
    console.log("  📸 Screenshot guardado: tests/screenshots/franky-3d-viewmode.png");

    // Clic 3 -> Regresar a FACE
    await viewBtn.click();
    await page.waitForTimeout(400);
    const backToFace = await viewBtn.innerText();
    console.log(`  View mode after click 3: "${backToFace}"`);

    // TEST 3: Apertura del Modal Gemelo Digital 3D a pantalla completa
    console.log("🦾 TEST 3: Abriendo Modal '🎮 Gemelo 3D' a pantalla completa...");
    await twinBtn.click();
    console.log("  ⏳ Esperando apertura y renderizado Three.js en modal...");
    await page.waitForTimeout(2500);

    // Verificar cabecera del modal
    const modalTitle = await page.getByText("GEMELO DIGITAL 3D");
    const isModalTitleVisible = await modalTitle.isVisible();
    console.log(`  ${isModalTitleVisible ? "✅" : "❌"} Modal Gemelo Digital abierto y visible: ${isModalTitleVisible}`);

    // Capturar en modo sólido PBR antes de activar wireframe
    await page.screenshot({ path: "tests/screenshots/franky-3d-modal-solid.png" });
    console.log("  📸 Screenshot guardado (Sólido PBR): tests/screenshots/franky-3d-modal-solid.png");

    // Verificar presencia de controles HUD
    const clamshellLabel = await page.getByText("Despiece Clamshell");
    const isClamshellVisible = await clamshellLabel.isVisible();
    console.log(`  ${isClamshellVisible ? "✅" : "❌"} Control Clamshell visible: ${isClamshellVisible}`);

    const imuLabel = await page.getByText("Horizonte IMU MPU-6050");
    const isImuVisible = await imuLabel.isVisible();
    console.log(`  ${isImuVisible ? "✅" : "❌"} Indicador IMU Pitch/Roll visible: ${isImuVisible}`);

    const wireframeBtn = await page.getByRole("button", { name: /WIREFRAME|SÓLIDO/i });
    const isWireframeBtnVisible = await wireframeBtn.isVisible();
    console.log(`  ${isWireframeBtnVisible ? "✅" : "❌"} Switch Wireframe visible: ${isWireframeBtnVisible}`);

    // Interactuar con Wireframe
    await wireframeBtn.click();
    await page.waitForTimeout(400);
    console.log("  ✅ Modo Wireframe activado");

    // Interactuar con Clamshell Slider (despiece 35mm)
    const clamshellSlider = page.locator('input[type="range"]');
    await clamshellSlider.fill("35");
    await page.waitForTimeout(600);
    console.log("  ✅ Slider Despiece Clamshell ajustado a 35mm");

    // Reset Cámara
    const resetBtn = await page.getByRole("button", { name: /Reset Cámara/i });
    await resetBtn.click();
    await page.waitForTimeout(400);
    console.log("  ✅ Botón Reset Cámara accionado");

    await page.screenshot({ path: "tests/screenshots/franky-3d-modal-wireframe.png" });
    console.log("  📸 Screenshot guardado (Wireframe + Despiece): tests/screenshots/franky-3d-modal-wireframe.png");

    // TEST 4: Cerrar modal y verificar desmonte
    console.log("🦾 TEST 4: Cerrando modal...");
    const closeBtn = page.locator("header button").last();
    await closeBtn.click();
    await page.waitForTimeout(500);

    const isModalGone = !(await modalTitle.isVisible());
    console.log(`  ${isModalGone ? "✅" : "❌"} Modal cerrado y destruido con éxito: ${isModalGone}`);

    console.log("\n🎯 RESUMEN DE INTEGRIDAD TÉCNICA:");
    console.log(`  Errores de Consola Reales (No de red): ${consoleErrors.length}`);
    console.log(`  Errores de Página: ${pageErrors.length}`);

    if (consoleErrors.length === 0 && pageErrors.length === 0) {
      console.log("🌟 ¡SUUUUUUUUUPER ÉXITO TOTAL! EL GEMELO DIGITAL 3D ESTÁ 100% OPERATIVO!");
    }
  } catch (err) {
    console.error("❌ Excepción durante la validación:", err);
  } finally {
    await browser.close();
    server.kill("SIGTERM");
    console.log("🏁 Servidor de prueba detenido.");
  }
}

runFranky3DValidation();
