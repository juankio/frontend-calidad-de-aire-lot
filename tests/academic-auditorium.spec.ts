import { test, expect } from "bun:test";
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

test("Auditorio Académico (EDO & Numérico) - Suite Completa de QA Playwright", async () => {
  const screenshotsDir = path.join(import.meta.dir, "screenshots");
  await mkdir(screenshotsDir, { recursive: true });

  const consoleErrors: string[] = [];
  const consoleWarnings: string[] = [];
  const pageErrors: string[] = [];

  // Lanzar navegador Chromium con Playwright
  const browser = await chromium.launch({
    headless: true,
    args: ["--remote-debugging-port=9222"],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    permissions: ["clipboard-read", "clipboard-write"],
  });
  const page = await context.newPage();

  // Monitoreo estricto de la consola del navegador
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
    // -------------------------------------------------------------
    // PASO 1: Navegar a http://localhost:3000 y verificar dashboard
    // -------------------------------------------------------------
    console.log("[QA Step 1] Navegando a http://localhost:3000...");
    await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded", timeout: 15000 });
    await page.waitForTimeout(1000); // Permitir hidratación completa de Vue 3 / Pinia

    const title = await page.title();
    expect(title).toContain("Air Guardian");

    // Verificar botón de la Cátedra en la cabecera
    const academicButton = page.locator("button:has-text('Cátedra EDO & Numérico')");
    await academicButton.waitFor({ state: "visible", timeout: 10000 });
    expect(await academicButton.isVisible()).toBe(true);

    // Verificar que el modal no está abierto inicialmente
    const modalTitleLocator = page.locator("h3:has-text('Auditorio Académico')");
    expect(await modalTitleLocator.isVisible()).toBe(false);

    await page.screenshot({ path: path.join(screenshotsDir, "01-dashboard-inicial.png") });

    // -------------------------------------------------------------
    // PASO 2: Abrir modal y verificar título "Auditorio Académico"
    // -------------------------------------------------------------
    console.log("[QA Step 2] Abriendo modal '🎓 Cátedra EDO & Numérico'...");
    await academicButton.click({ force: true });

    await modalTitleLocator.waitFor({ state: "visible", timeout: 5000 });
    expect(await modalTitleLocator.isVisible()).toBe(true);

    // Verificar subtítulo y badge de cátedra
    const subtitle = page.locator("text=Ecuaciones Diferenciales Ordinarias (EDO) & Análisis Numérico");
    expect(await subtitle.isVisible()).toBe(true);

    const badge = page.locator("text=Cátedra Interdisciplinar");
    expect(await badge.isVisible()).toBe(true);

    await page.waitForTimeout(400); // reposo para la animación anime.js
    await page.screenshot({ path: path.join(screenshotsDir, "02-modal-abierto.png") });

    // -------------------------------------------------------------
    // PASO 3: Pestaña 1 - Ecuaciones Diferenciales (fórmulas & sliders)
    // -------------------------------------------------------------
    console.log("[QA Step 3] Verificando Pestaña 1: '1. Ecuaciones Diferenciales'...");
    const tab1Btn = page.locator("button:has-text('1. Ecuaciones Diferenciales')");
    await tab1Btn.click({ force: true });

    // Verificar cabecera de deducción física
    const section1Heading = page.locator("text=1. Deducción del Modelo Físico (Balance de Masa en Recintos)");
    await section1Heading.waitFor({ state: "visible", timeout: 5000 });
    expect(await section1Heading.isVisible()).toBe(true);

    // Verificar las 3 fórmulas exactas
    const formulaBase = page.locator("text=V · dC/dt = G - Q · C(t)");
    expect(await formulaBase.isVisible()).toBe(true);

    const formulaIntegrating = page.locator("text=μ(t) = e^(∫ k dt) = e^(kt)");
    expect(await formulaIntegrating.isVisible()).toBe(true);

    const formulaExact = page.locator("text=C(t) = C_inf + (C0 - C_inf)e^(-kt)");
    expect(await formulaExact.isVisible()).toBe(true);

    // Verificar los 3 sliders de variables físicas (C0, C_inf, k)
    const sliders = page.locator("input[type='range']");
    const sliderCount = await sliders.count();
    expect(sliderCount).toBeGreaterThanOrEqual(3);

    expect(await page.locator("text=C0 (PPM Inicial)").isVisible()).toBe(true);
    expect(await page.locator("text=C_inf (Equilibrio Saturación)").isVisible()).toBe(true);
    expect(await page.locator("text=k (Tasa Renovación Q/V)").isVisible()).toBe(true);

    // Probar interactividad reactiva en slider C0
    const firstSlider = sliders.nth(0);
    await firstSlider.fill("920");
    expect(await page.locator("text=920 PPM").isVisible()).toBe(true);

    await page.screenshot({ path: path.join(screenshotsDir, "03-pestana1-edo.png") });

    // -------------------------------------------------------------
    // PASO 4: Pestaña 2 - Simulación Euler vs RK4 (Gráfico SVG)
    // -------------------------------------------------------------
    console.log("[QA Step 4] Verificando Pestaña 2: '2. Simulación Euler vs RK4'...");
    const tab2Btn = page.locator("button:has-text('2. Simulación Euler vs RK4')");
    await tab2Btn.click({ force: true });

    const section2Heading = page.locator("text=Discretización & Paso de Integración (h = Δt)");
    await section2Heading.waitFor({ state: "visible", timeout: 5000 });
    expect(await section2Heading.isVisible()).toBe(true);

    // Verificar el gráfico SVG y sus curvas
    const svgChart = page.locator("svg[viewBox='0 0 600 240']");
    await svgChart.waitFor({ state: "visible", timeout: 5000 });
    expect(await svgChart.isVisible()).toBe(true);

    const polylines = svgChart.locator("polyline");
    expect(await polylines.count()).toBe(3); // Curva Exacta, Euler, RK4

    // Verificar leyendas del gráfico
    expect(await page.locator("text=Analítica Exacta").isVisible()).toBe(true);
    expect(await page.locator("text=Euler (O(h))").isVisible()).toBe(true);
    expect(await page.locator("text=RK4 (O(h⁴))").isVisible()).toBe(true);

    // Verificar tarjetas de métricas
    expect(await page.locator("text=RMSE Euler (1er Orden)").isVisible()).toBe(true);
    expect(await page.locator("text=RMSE Runge-Kutta 4").isVisible()).toBe(true);
    expect(await page.locator("text=Ganancia de Precisión").isVisible()).toBe(true);

    // Verificar control del paso temporal h
    const hSlider = page.locator("input[type='range']");
    expect(await hSlider.isVisible()).toBe(true);

    await page.screenshot({ path: path.join(screenshotsDir, "04-pestana2-simulacion.png") });

    // -------------------------------------------------------------
    // PASO 5: Pestaña 3 - Análisis de Errores & LaTeX (Tabla & Botón)
    // -------------------------------------------------------------
    console.log("[QA Step 5] Verificando Pestaña 3: '3. Análisis de Errores & LaTeX'...");
    const tab3Btn = page.locator("button:has-text('3. Análisis de Errores & LaTeX')");
    await tab3Btn.click({ force: true });

    const section3Heading = page.locator("text=Tabla de Iteraciones Numéricas Paso a Paso");
    await section3Heading.waitFor({ state: "visible", timeout: 5000 });
    expect(await section3Heading.isVisible()).toBe(true);

    // Verificar todas las columnas requeridas
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

    for (const col of requiredColumns) {
      const th = page.locator(`th:has-text('${col}')`);
      expect(await th.first().isVisible()).toBe(true);
    }

    // Verificar presencia de filas de iteración calculadas
    const rows = page.locator("tbody tr");
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(10);

    // Verificar botón "Copiar LaTeX"
    const copyLatexBtn = page.locator("button:has-text('Copiar LaTeX')");
    expect(await copyLatexBtn.isVisible()).toBe(true);

    // Hacer clic en "Copiar LaTeX" y verificar feedback visual
    await copyLatexBtn.click({ force: true });
    const copiedBadge = page.locator("text=¡Copiado!");
    await copiedBadge.waitFor({ state: "visible", timeout: 5000 });
    expect(await copiedBadge.isVisible()).toBe(true);

    // Verificar botón "Exportar CSV"
    expect(await page.locator("button:has-text('Exportar CSV')").isVisible()).toBe(true);

    await page.screenshot({ path: path.join(screenshotsDir, "05-pestana3-tabla-errores.png") });

    // -------------------------------------------------------------
    // PASO 6: Cierre del modal con botón X
    // -------------------------------------------------------------
    console.log("[QA Step 6] Cerrando modal con botón X...");
    const closeBtn = page.locator(".fixed.inset-0 button[title*='Cerrar']").first();
    expect(await closeBtn.isVisible()).toBe(true);

    await closeBtn.click({ force: true });
    await modalTitleLocator.waitFor({ state: "hidden", timeout: 5000 });
    expect(await modalTitleLocator.isVisible()).toBe(false);

    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(screenshotsDir, "06-modal-cerrado.png") });

    // -------------------------------------------------------------
    // PASO 7: Verificación de CERO errores en consola
    // -------------------------------------------------------------
    console.log("[QA Step 7] Verificando logs de consola y excepciones...");
    if (consoleErrors.length > 0) {
      console.error("❌ ERRORES EN CONSOLA DETECTADOS:", consoleErrors);
    }
    if (pageErrors.length > 0) {
      console.error("❌ ERRORES DE PÁGINA DETECTADOS:", pageErrors);
    }

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);

    console.log("✅ TODAS LAS PRUEBAS DE QA CONCLUIDAS EN VERDE.");
  } finally {
    await browser.close();
  }
}, 30000);
