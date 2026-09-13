import { chromium } from "playwright";

async function runQA() {
  console.log("🎯 [USOPP SNIPER QA] Iniciando Batería de Pruebas Automatizadas Playwright (Node runner)...");

  const consoleErrors = [];
  const consoleWarnings = [];
  const pageErrors = [];

  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    permissions: ["clipboard-read", "clipboard-write"],
  });

  const page = await context.newPage();

  // Escucha activa de la consola del navegador
  page.on("console", (msg) => {
    const type = msg.type();
    const text = msg.text();
    if (type === "error") {
      consoleErrors.push(text);
      console.log(`  [BROWSER ERROR] ${text}`);
    } else if (type === "warning") {
      consoleWarnings.push(text);
    }
  });

  page.on("pageerror", (err) => {
    pageErrors.push(err.message);
    console.log(`  [PAGE EXCEPTION] ${err.message}`);
  });

  try {
    // -------------------------------------------------------------
    // 1. NAVEGACIÓN Y CARGA INICIAL
    // -------------------------------------------------------------
    console.log("➡️  Paso 1: Navegando a http://localhost:3000...");
    await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });

    const title = await page.title();
    console.log(`   ✓ Título de la página: "${title}"`);
    if (!title.includes("Air Guardian")) {
      throw new Error(`Título no esperado: ${title}`);
    }

    const academicBtn = page.locator("button:has-text('Cátedra EDO & Numérico')");
    await academicBtn.waitFor({ state: "visible", timeout: 10000 });
    console.log("   ✓ Botón '🎓 Cátedra EDO & Numérico' detectado en cabecera.");

    // Modal no debe estar abierto
    const modalH3 = page.locator("h3:has-text('Auditorio Académico')");
    const isModalOpenInitially = await modalH3.isVisible();
    if (isModalOpenInitially) throw new Error("El modal no debería estar abierto al inicio.");
    console.log("   ✓ Modal inicialmente cerrado.");

    // -------------------------------------------------------------
    // 2. APERTURA DEL MODAL
    // -------------------------------------------------------------
    console.log("➡️  Paso 2: Clic en botón '🎓 Cátedra EDO & Numérico'...");
    await academicBtn.click({ force: true });
    await modalH3.waitFor({ state: "visible", timeout: 6000 });
    console.log("   ✓ Modal 'AcademicAuditoriumModal' desplegado exitosamente.");

    // Subtítulo y badge
    const subtitle = page.locator("text=Ecuaciones Diferenciales Ordinarias (EDO) & Análisis Numérico");
    const badge = page.locator("text=Cátedra Interdisciplinar");
    if (!(await subtitle.isVisible()) || !(await badge.isVisible())) {
      throw new Error("Subtítulo o badge interdisciplinar no visibles en cabecera del modal.");
    }
    console.log("   ✓ Título 'Auditorio Académico', subtítulo y badge verificados.");
    await page.waitForTimeout(400);

    // -------------------------------------------------------------
    // 3. PESTAÑA 1: ECUACIONES DIFERENCIALES
    // -------------------------------------------------------------
    console.log("➡️  Paso 3: Clic en Pestaña 1: '1. Ecuaciones Diferenciales'...");
    const tab1Btn = page.locator("button:has-text('1. Ecuaciones Diferenciales')");
    await tab1Btn.evaluate((b) => b.click());
    await page.waitForTimeout(400); // reposo para transición Anime.js
    console.log("DEBUG - PASO 3 H3s:", await page.locator("h3").allInnerTexts());
    console.log("DEBUG - PASO 3 H4s:", await page.locator("h4").allInnerTexts());

    const heading1 = page.locator("text=1. Deducción del Modelo Físico (Balance de Masa en Recintos)");
    await heading1.waitFor({ state: "visible", timeout: 5000 });

    // Fórmulas matemáticas
    const f1 = await page.locator("text=V · dC/dt = G - Q · C(t)").isVisible();
    const f2 = await page.locator("text=μ(t) = e^(∫ k dt) = e^(kt)").isVisible();
    const f3 = await page.locator("text=C(t) = C_inf + (C0 - C_inf)e^(-kt)").isVisible();
    console.log(`   ✓ Fórmulas verificadas: Base EDO (${f1}), Factor Integrante (${f2}), Analítica Exacta (${f3})`);
    if (!f1 || !f2 || !f3) throw new Error("Faltan fórmulas matemáticas en la Pestaña 1.");

    // Sliders de variables físicas
    const sliders = page.locator("input[type='range']");
    const sliderCount = await sliders.count();
    console.log(`   ✓ Controles de rango (Sliders) encontrados: ${sliderCount}`);
    if (sliderCount < 3) throw new Error(`Se esperaban al menos 3 sliders, se encontraron ${sliderCount}`);

    // Interacción slider C0
    await sliders.nth(0).fill("880");
    await page.waitForTimeout(100);
    const updatedC0 = await page.locator("text=880 PPM").isVisible();
    console.log(`   ✓ Reactividad de slider probada (C0 actualizado a 880 PPM): ${updatedC0}`);
    if (!updatedC0) throw new Error("Fallo en la reactividad del slider C0.");

    // -------------------------------------------------------------
    // 4. PESTAÑA 2: SIMULACIÓN EULER VS RK4
    // -------------------------------------------------------------
    await page.waitForTimeout(400);
    console.log("➡️  Paso 4: Clic en Pestaña 2: '2. Simulación Euler vs RK4'...");
    const tab2Btn = page.locator("button:has-text('2. Simulación Euler vs RK4')");
    await tab2Btn.evaluate((b) => b.click());
    await page.waitForTimeout(500); // reposo para transición Anime.js
    console.log("DEBUG - AFTER TAB2 CLICK, H4s:", await page.locator("h4").allInnerTexts());
    console.log("DEBUG - AFTER TAB2 CLICK, ALL BUTTONS:", await page.evaluate(() => Array.from(document.querySelectorAll("button")).map(b => b.textContent?.trim())));

    const heading2 = page.locator("text=Discretización & Paso de Integración (h = Δt)");
    await heading2.waitFor({ state: "visible", timeout: 5000 });

    const svg = page.locator("svg[viewBox='0 0 600 240']");
    await svg.waitFor({ state: "visible", timeout: 5000 });
    const polyCount = await svg.locator("polyline").count();
    console.log(`   ✓ Gráfico SVG comparativo detectado con ${polyCount} polylines (Exacta, Euler, RK4).`);
    if (polyCount !== 3) throw new Error(`Se esperaban 3 polylines en el gráfico SVG, se encontraron ${polyCount}`);

    // Leyendas y tarjetas
    const l1 = await page.locator("text=Analítica Exacta").isVisible();
    const l2 = await page.locator("text=Euler (O(h))").isVisible();
    const l3 = await page.locator("text=RK4 (O(h⁴))").isVisible();
    console.log(`   ✓ Leyendas del gráfico: Exacta (${l1}), Euler (${l2}), RK4 (${l3})`);
    if (!l1 || !l2 || !l3) throw new Error("Faltan leyendas en el gráfico.");

    const mEuler = await page.locator("text=RMSE Euler (1er Orden)").isVisible();
    const mRk4 = await page.locator("text=RMSE Runge-Kutta 4").isVisible();
    const mBoost = await page.locator("text=Ganancia de Precisión").isVisible();
    console.log(`   ✓ Tarjetas de error: RMSE Euler (${mEuler}), RMSE RK4 (${mRk4}), Ganancia (${mBoost})`);
    if (!mEuler || !mRk4 || !mBoost) throw new Error("Faltan métricas de error en la Pestaña 2.");

    // -------------------------------------------------------------
    // 5. PESTAÑA 3: ANÁLISIS DE ERRORES & LATEX
    // -------------------------------------------------------------
    await page.waitForTimeout(400);
    console.log("➡️  Paso 5: Clic en Pestaña 3: '3. Análisis de Errores & LaTeX'...");
    const tab3Btn = page.locator("button:has-text('3. Análisis de Errores & LaTeX')");
    await tab3Btn.evaluate((b) => b.click());
    await page.waitForTimeout(400); // reposo para transición Anime.js

    const heading3 = page.locator("text=Tabla de Iteraciones Numéricas Paso a Paso");
    try {
      await heading3.waitFor({ state: "visible", timeout: 5000 });
    } catch (err) {
      console.log("DEBUG - ACTIVE BUTTONS:", await page.evaluate(() => {
        return Array.from(document.querySelectorAll("button")).map(b => ({ text: b.textContent?.trim(), class: b.className }));
      }));
      console.log("DEBUG - MODAL H4s:", await page.locator("h4").allInnerTexts());
      throw err;
    }

    const requiredHeaders = [
      "n", "t (min)", "C_exacta", "C_Euler", "C_RK4",
      "E_abs(Euler)", "E_rel(Euler)%", "E_abs(RK4)", "E_rel(RK4)%"
    ];

    for (const hdr of requiredHeaders) {
      const isHeaderPresent = await page.locator(`th:has-text('${hdr}')`).first().isVisible();
      if (!isHeaderPresent) throw new Error(`Columna requerida "${hdr}" no encontrada en la tabla.`);
    }
    console.log(`   ✓ Todas las 9 columnas de iteración y error presentes en la tabla.`);

    const rowsCount = await page.locator("tbody tr").count();
    console.log(`   ✓ Filas de iteración computadas en tabla: ${rowsCount}`);
    if (rowsCount < 10) throw new Error(`Filas insuficientes en tabla de errores (${rowsCount}).`);

    // Botón Copiar LaTeX
    const copyLatexBtn = page.locator("button:has-text('Copiar LaTeX')");
    if (!(await copyLatexBtn.isVisible())) throw new Error("Botón 'Copiar LaTeX' no visible.");
    console.log("   ✓ Botón 'Copiar LaTeX' presente. Probando acción de copiado...");
    await copyLatexBtn.dispatchEvent("click");

    const copiedFeedback = page.locator("text=¡Copiado!");
    await copiedFeedback.waitFor({ state: "visible", timeout: 5000 });
    console.log("   ✓ Feedback visual '¡Copiado!' activado con éxito.");

    // Botón Exportar CSV
    const exportCsvBtn = page.locator("button:has-text('Exportar CSV')");
    if (!(await exportCsvBtn.isVisible())) throw new Error("Botón 'Exportar CSV' no visible.");
    console.log("   ✓ Botón 'Exportar CSV' verificado.");

    // -------------------------------------------------------------
    // 6. CIERRE DEL MODAL CON BOTÓN X
    // -------------------------------------------------------------
    console.log("➡️  Paso 6: Cerrando modal con botón X...");
    const closeBtn = page.locator(".fixed.inset-0 button[title*='Cerrar']").first();
    await closeBtn.dispatchEvent("click");

    await modalH3.waitFor({ state: "hidden", timeout: 5000 });
    const isModalVisibleAfterClose = await modalH3.isVisible();
    console.log(`   ✓ Modal cerrado correctamente (Visible: ${isModalVisibleAfterClose})`);
    if (isModalVisibleAfterClose) throw new Error("El modal aún sigue visible después de pulsar X.");

    // -------------------------------------------------------------
    // 7. AUDITORÍA DE ERRORES EN CONSOLA
    // -------------------------------------------------------------
    console.log("➡️  Paso 7: Evaluando estado de la consola...");
    console.log(`   • Errores de consola (console.error): ${consoleErrors.length}`);
    console.log(`   • Excepciones no controladas (pageerror): ${pageErrors.length}`);
    console.log(`   • Advertencias (console.warn): ${consoleWarnings.length}`);

    if (consoleErrors.length > 0) {
      throw new Error(`Se detectaron ${consoleErrors.length} errores en consola:\n${consoleErrors.join('\n')}`);
    }
    if (pageErrors.length > 0) {
      throw new Error(`Se detectaron ${pageErrors.length} excepciones en página:\n${pageErrors.join('\n')}`);
    }

    console.log("\n🎯🎯🎯 [DISPARO CERTERO DE USOPP: 100% GREEN] 🎯🎯🎯");
    console.log("Todas las aserciones pasaron limpiamente. Cero bugs, cero errores en consola.");
  } catch (error) {
    console.error("💥 ERROR DURANTE LA EJECUCIÓN DEL QA:", error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runQA();
