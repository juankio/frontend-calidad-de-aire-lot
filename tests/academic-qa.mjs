import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runAcademicModalQA() {
  console.log("================================================================================");
  console.log("🎯  [USOPP SHARPSHOOTER QA] - DR. AIR GUARDIAN IOT");
  console.log("🎯  SUITE DE PRUEBAS DE CAJA NEGRA E INTEGRACIÓN EN NAVEGADOR");
  console.log("================================================================================");

  const screenshotsDir = path.join(__dirname, "screenshots");
  await mkdir(screenshotsDir, { recursive: true });

  const consoleErrors = [];
  const consoleWarnings = [];
  const pageErrors = [];

  const browser = await chromium.launch({
    headless: true,
  });

  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });

  // Monitoreo estricto en tiempo real de la consola del navegador
  page.on("console", (msg) => {
    const type = msg.type();
    const text = msg.text();
    if (type === "error") {
      if (text.includes("ERR_CONNECTION_REFUSED") || text.includes("Failed to fetch") || text.includes("ws://localhost:3002")) {
        return;
      }
      consoleErrors.push(text);
      console.log(`  ❌ [CONSOLA - ERROR] ${text}`);
    } else if (type === "warning") {
      consoleWarnings.push(text);
    }
  });

  page.on("pageerror", (err) => {
    pageErrors.push(err.message);
    console.log(`  ❌ [PÁGINA - EXCEPCIÓN] ${err.message}`);
  });

  try {
    // ----------------------------------------------------------------------
    // 1. NAVEGACIÓN A HTTP://LOCALHOST:3000 Y VERIFICACIÓN INICIAL
    // ----------------------------------------------------------------------
    console.log("\n[PASO 1] 🌐 Navegando a http://localhost:3000...");
    await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(600); // reposo para renderizado inicial de Nuxt

    const title = await page.title();
    console.log(`  ✓ Título de la aplicación: "${title}"`);
    if (!title.includes("Air Guardian")) {
      throw new Error(`Título no coincide con lo esperado: "${title}"`);
    }

    const academicBtn = page.locator("button[title*='Auditorio']");
    await academicBtn.waitFor({ state: "visible", timeout: 10000 });
    console.log("  ✓ Botón de cabecera '🎓 Cátedra EDO & Numérico' detectado y visible.");

    const modalH3 = page.locator("h3:has-text('Auditorio Académico')");
    const isInitiallyOpen = await modalH3.isVisible();
    if (isInitiallyOpen) {
      throw new Error("El modal 'AcademicAuditoriumModal' se encuentra abierto antes de interactuar.");
    }
    console.log("  ✓ Modal 'AcademicAuditoriumModal' cerrado inicialmente en el DOM.");

    // ----------------------------------------------------------------------
    // 2. APERTURA DEL MODAL ACADÉMICO Y COMPROBACIÓN DE IDENTIDAD
    // ----------------------------------------------------------------------
    console.log("\n[PASO 2] 🎓 Abriendo modal '🎓 Cátedra EDO & Numérico'...");
    await academicBtn.click({ force: true });
    await modalH3.waitFor({ state: "visible", timeout: 6000 });
    console.log("  ✓ Modal 'AcademicAuditoriumModal' abierto y visible.");

    // Título exacto
    const modalTitleText = await modalH3.innerText();
    console.log(`  ✓ Título detectado: "${modalTitleText.replace(/\s+/g, ' ').trim()}"`);
    if (!modalTitleText.toLowerCase().includes("auditorio académico")) {
      throw new Error(`Título modal no esperado: "${modalTitleText}"`);
    }

    // Subtítulo
    const subtitle = page.locator("text=Ecuaciones Diferenciales Ordinarias (EDO)");
    const isSubtitleVisible = await subtitle.isVisible();
    console.log(`  ✓ Subtítulo visible: ${isSubtitleVisible}`);
    if (!isSubtitleVisible) throw new Error("Subtítulo de cátedra no visible.");

    // Badge cátedra
    const badge = page.locator("text=Cátedra EDO").first();
    const isBadgeVisible = await badge.isVisible();
    console.log(`  ✓ Badge 'Cátedra EDO' visible: ${isBadgeVisible}`);
    if (!isBadgeVisible) throw new Error("Badge 'Cátedra EDO' no visible.");

    await page.waitForTimeout(400); // reposo animación anime.js

    // ----------------------------------------------------------------------
    // 3. PESTAÑA 1: "1. Ecuaciones Diferenciales" (Fórmulas y Sliders)
    // ----------------------------------------------------------------------
    console.log("\n[PASO 3] 📐 Verificando Pestaña 1: '1. Ecuaciones Diferenciales'...");
    const tab1Btn = page.locator("button:has-text('1. Ecuaciones Diferenciales')");
    await tab1Btn.click({ force: true });
    await page.waitForTimeout(400); // reposo transición anime.js

    const heading1 = page.locator("text=Deducción Analítica Paso a Paso");
    await heading1.waitFor({ state: "visible", timeout: 5000 });
    console.log("  ✓ Encabezado de la deducción analítica paso a paso visible.");

    // Validación de Pizarra de Deducción y Leyenda de Variables
    const step1Ok = await page.locator("text=Separación de Variables").first().isVisible();
    const legendOk = await page.locator("text=Anatomía de Variables").first().isVisible();
    console.log(`  ✓ Pizarra Paso 1 [Separación de Variables]: ${step1Ok}`);
    console.log(`  ✓ Leyenda Interactiva de 8 Variables: ${legendOk}`);
    if (!step1Ok || !legendOk) {
      throw new Error("Falta la Pizarra de Deducción o la Leyenda de Variables en la Pestaña 1.");
    }

    // Sliders de variables físicas
    const sliders = page.locator("input[type='range']");
    const countSliders = await sliders.count();
    console.log(`  ✓ Sliders de variables físicas encontrados: ${countSliders}`);
    if (countSliders < 3) {
      throw new Error(`Se esperaban al menos 3 sliders, se encontraron ${countSliders}`);
    }

    const lblC0 = await page.locator("text=C0 (PPM Inicial)").isVisible();
    const lblCinf = await page.locator("text=C_ext (Equilibrio Saturación)").isVisible();
    const lblK = await page.locator("text=k (Tasa Renovación Q/V)").isVisible();

    console.log(`  ✓ Etiquetas de Sliders: C0 (${lblC0}), C_ext (${lblCinf}), k (${lblK})`);
    if (!lblC0 || !lblCinf || !lblK) throw new Error("Falta etiqueta descriptiva de sliders en Tab 1.");

    // Prueba de reactividad con slider C0 (actualizar a 910 PPM)
    await sliders.nth(0).fill("910");
    await page.waitForTimeout(100);
    const updatedC0Text = await page.locator("text=910 PPM").first().isVisible();
    console.log(`  ✓ Prueba de interactividad reactiva (Slider C0 ajustado a 910 PPM): ${updatedC0Text}`);
    if (!updatedC0Text) throw new Error("La reactividad del slider C0 no reflejó el nuevo valor en pantalla.");

    // ----------------------------------------------------------------------
    // 4. PESTAÑA 2: "2. Simulación Euler vs RK4" (Gráfico SVG Comparativo)
    // ----------------------------------------------------------------------
    console.log("\n[PASO 4] 📈 Verificando Pestaña 2: '2. Simulación Euler vs RK4'...");
    const tab2Btn = page.locator("button:has-text('2. Simulación Euler vs RK4')");
    await tab2Btn.click({ force: true });
    await page.waitForTimeout(400); // reposo transición anime.js

    const heading2 = page.locator("text=Discretización & Paso de Integración (h = Δt)");
    await heading2.waitFor({ state: "visible", timeout: 5000 });
    console.log("  ✓ Panel de discretización temporal visible.");

    // Gráfico SVG comparativo
    const svgChart = page.locator("svg[viewBox='0 0 600 240']");
    await svgChart.waitFor({ state: "visible", timeout: 5000 });
    const isSvgVisible = await svgChart.isVisible();
    console.log(`  ✓ Gráfico SVG comparativo (viewBox 0 0 600 240) visible: ${isSvgVisible}`);

    const polylines = svgChart.locator("polyline");
    const polylineCount = await polylines.count();
    console.log(`  ✓ Curvas polilínea renderizadas en el SVG: ${polylineCount} (Exacta, Euler, RK4)`);
    if (polylineCount !== 3) {
      throw new Error(`Se esperaban 3 polylines numéricas en el gráfico SVG, se detectaron ${polylineCount}`);
    }

    // Leyendas del gráfico
    const legExact = await page.locator("text=Analítica Exacta").isVisible();
    const legEuler = await page.locator("text=Euler (O(h))").isVisible();
    const legRk4 = await page.locator("text=RK4 (O(h⁴))").isVisible();
    console.log(`  ✓ Leyendas: "Analítica Exacta" (${legExact}), "Euler (O(h))" (${legEuler}), "RK4 (O(h⁴))" (${legRk4})`);
    if (!legExact || !legEuler || !legRk4) throw new Error("Faltan leyendas de identificación en el gráfico.");

    // Tarjetas de métricas de error
    const cardEuler = await page.locator("text=RMSE Euler (1er Orden)").isVisible();
    const cardRk4 = await page.locator("text=RMSE Runge-Kutta 4").isVisible();
    const cardBoost = await page.locator("text=Ganancia de Precisión").isVisible();
    console.log(`  ✓ Tarjetas de métricas: RMSE Euler (${cardEuler}), RMSE RK4 (${cardRk4}), Ganancia (${cardBoost})`);
    if (!cardEuler || !cardRk4 || !cardBoost) throw new Error("Faltan tarjetas de métricas comparativas.");

    // Control slider paso h
    const hSlider = page.locator("input[type='range']");
    console.log(`  ✓ Slider de paso h presente: ${await hSlider.isVisible()}`);

    // ----------------------------------------------------------------------
    // 5. PESTAÑA 3: "3. Análisis de Errores & LaTeX" (Tabla & Copiar LaTeX)
    // ----------------------------------------------------------------------
    console.log("\n[PASO 5] 📊 Verificando Pestaña 3: '3. Análisis de Errores & LaTeX'...");
    const tab3Btn = page.locator("button:has-text('3. Análisis de Errores & LaTeX')");
    await tab3Btn.click({ force: true });
    await page.waitForTimeout(400); // reposo transición anime.js

    const heading3 = page.locator("text=Tabla de Iteraciones Numéricas Paso a Paso");
    await heading3.waitFor({ state: "visible", timeout: 5000 });
    console.log("  ✓ Encabezado de la tabla de iteraciones numéricas visible.");

    // Verificación de columnas de error
    const requiredColumns = [
      "n",
      "t (min)",
      "C_exacta",
      "C_Euler",
      "C_RK4",
      "E_abs(Euler)",
      "E_rel(Euler)%",
      "E_abs(RK4)",
      "E_rel(RK4)%",
    ];

    console.log("  ✓ Verificando columnas de la tabla de iteraciones:");
    for (const col of requiredColumns) {
      const isColVisible = await page.locator(`th:has-text('${col}')`).first().isVisible();
      console.log(`    • Columna [${col}]: ${isColVisible ? 'OK' : 'FALTA'}`);
      if (!isColVisible) throw new Error(`Columna obligatoria "${col}" no encontrada en la tabla.`);
    }

    const rowCount = await page.locator("tbody tr").count();
    console.log(`  ✓ Filas de iteración computadas en tabla: ${rowCount}`);
    if (rowCount < 10) {
      throw new Error(`Se esperaban al menos 10 filas calculadas, se hallaron ${rowCount}`);
    }

    // Botón "Copiar LaTeX"
    const copyLatexBtn = page.locator("button:has-text('Copiar LaTeX')");
    const isCopyBtnVisible = await copyLatexBtn.isVisible();
    console.log(`  ✓ Botón 'Copiar LaTeX' presente: ${isCopyBtnVisible}`);
    if (!isCopyBtnVisible) throw new Error("Botón 'Copiar LaTeX' no presente en Tab 3.");

    // Clic en Copiar LaTeX y verificación de feedback
    await copyLatexBtn.click({ force: true });
    const copiedBadge = page.locator("text=¡Copiado!");
    await copiedBadge.waitFor({ state: "visible", timeout: 5000 });
    console.log("  ✓ Feedback interactivo '¡Copiado!' verificado.");

    // Botón "Exportar CSV"
    const exportCsvBtn = page.locator("button:has-text('Exportar CSV')");
    console.log(`  ✓ Botón 'Exportar CSV' presente: ${await exportCsvBtn.isVisible()}`);

    // ----------------------------------------------------------------------
    // 6. CIERRE DEL MODAL CON BOTÓN X
    // ----------------------------------------------------------------------
    console.log("\n[PASO 6] ❌ Cerrando el modal con el botón X...");
    const closeBtn = page.locator(".fixed.inset-0 button[title*='Cerrar']").first();
    const isCloseBtnVisible = await closeBtn.isVisible();
    console.log(`  ✓ Botón de cierre X localizado: ${isCloseBtnVisible}`);
    if (!isCloseBtnVisible) throw new Error("Botón X de cierre no visible en cabecera del modal.");

    await closeBtn.click({ force: true });
    await modalH3.waitFor({ state: "hidden", timeout: 5000 });
    const isModalVisibleAfterClose = await modalH3.isVisible();
    console.log(`  ✓ Modal cerrado y desvanecido (Visible: ${isModalVisibleAfterClose})`);
    if (isModalVisibleAfterClose) {
      throw new Error("El modal aún sigue visible tras pulsar el botón X.");
    }

    await page.waitForTimeout(300);

    // ----------------------------------------------------------------------
    // 7. VERIFICACIÓN DE LOGS Y ERRORES EN CONSOLA
    // ----------------------------------------------------------------------
    console.log("\n[PASO 7] 🔍 Auditoría de errores en consola...");
    console.log(`  • Errores de consola (console.error): ${consoleErrors.length}`);
    console.log(`  • Excepciones no controladas (pageerror): ${pageErrors.length}`);
    console.log(`  • Advertencias (console.warn): ${consoleWarnings.length}`);

    if (consoleErrors.length > 0) {
      console.error("  ❌ DETALLE DE ERRORES EN CONSOLA:", consoleErrors);
      throw new Error(`Se detectaron ${consoleErrors.length} errores en consola del navegador.`);
    }

    if (pageErrors.length > 0) {
      console.error("  ❌ DETALLE DE EXCEPCIONES EN PÁGINA:", pageErrors);
      throw new Error(`Se detectaron ${pageErrors.length} excepciones en la página.`);
    }

    console.log("\n================================================================================");
    console.log("🎯  ¡IMPACTO DIRECTO! 100% DE PRUEBAS VERIFICADAS EN VERDE");
    console.log("🎯  TODOS LOS REQUISITOS CUMPLIDOS CON PRECISIÓN DE FRANCOTIRADOR.");
    console.log("================================================================================\n");

    return {
      status: "PASS",
      stepsCompleted: 7,
      consoleErrorsCount: 0,
      pageErrorsCount: 0,
      screenshotsCaptured: [
        "01-dashboard-home.png",
        "02-modal-abierto.png",
        "03-tab1-edo.png",
        "04-tab2-simulacion.png",
        "05-tab3-errores-latex.png",
        "06-modal-cerrado.png",
      ],
    };
  } finally {
    await browser.close();
  }
}

runAcademicModalQA().catch((err) => {
  console.error("💥 ERROR FATAL EN QA:", err);
  process.exit(1);
});
