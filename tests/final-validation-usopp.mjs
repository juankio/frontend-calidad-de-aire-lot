import { chromium } from "playwright";

const CHROMIUM_PATH = "/home/juankio/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome";

async function runUsoppValidation() {
  console.log("================================================================================");
  console.log("🎯  [USOPP SNIPER QA] VALIDACIÓN FINAL AIR GUARDIAN IOT");
  console.log("🎯  DISPARO DE ALTA PRECISIÓN: E2E BROWSER & HARDCORE TEST VERIFICATION");
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
    // 1. CARGA INICIAL Y TÍTULO
    // ----------------------------------------------------------------------
    logStep("🎯 TIRO 1: Carga de página y verificación de título...");
    await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(400); // reposo para hidratación inicial de Nuxt

    const pageTitle = await page.title();
    const expectedTitle = "Air Guardian IoT • Laboratorio del Científico Loco";
    const isTitleMatch = pageTitle.trim() === expectedTitle;
    recordResult(
      "Título de la Página",
      isTitleMatch,
      `Esperado: "${expectedTitle}" | Obtenido: "${pageTitle}"`
    );

    // ----------------------------------------------------------------------
    // 2. SELECTOR DE MODO DUAL (🧪 Modo Local vs 📡 En Vivo)
    // ----------------------------------------------------------------------
    logStep("🎯 TIRO 2: Conmutación del Selector de Modo Dual...");
    const localBtnStateInitial = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const localBtn = btns.find((b) => b.textContent?.includes("Modo Local"));
      const liveBtn = btns.find((b) => b.textContent?.includes("En Vivo"));
      return {
        localFound: !!localBtn,
        liveFound: !!liveBtn,
        localActive: localBtn?.className.includes("bg-[#d97706]"),
        liveActive: liveBtn?.className.includes("bg-emerald-600"),
      };
    });

    recordResult(
      "Detección de botones de Modo Dual",
      localBtnStateInitial.localFound && localBtnStateInitial.liveFound,
      `Modo Local presente: ${localBtnStateInitial.localFound}, En Vivo presente: ${localBtnStateInitial.liveFound}`
    );

    // Conmutar a En Vivo (1-a-1) mediante evaluate click directo
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const liveBtn = btns.find((b) => b.textContent?.includes("En Vivo"));
      liveBtn?.click();
    });
    await page.waitForTimeout(150);

    const liveStateAfterClick = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const liveBtn = btns.find((b) => b.textContent?.includes("En Vivo"));
      return liveBtn?.className.includes("bg-emerald-600");
    });
    recordResult(
      "Conmutación a '📡 En Vivo (1-a-1)'",
      !!liveStateAfterClick,
      "Clase bg-emerald-600 activada"
    );

    // Conmutar de nuevo a Modo Local
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const localBtn = btns.find((b) => b.textContent?.includes("Modo Local"));
      localBtn?.click();
    });
    await page.waitForTimeout(150);

    const localStateAfterClick = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const localBtn = btns.find((b) => b.textContent?.includes("Modo Local"));
      return localBtn?.className.includes("bg-[#d97706]");
    });
    recordResult(
      "Conmutación a '🧪 Modo Local'",
      !!localStateAfterClick,
      "Clase bg-[#d97706] reactivada"
    );

    // ----------------------------------------------------------------------
    // 3. MAPA LEAFLET CARTODB Y BITÁCORA "LUGARES DONDE ESTUVIMOS"
    // ----------------------------------------------------------------------
    logStep("🎯 TIRO 3: Mapa Leaflet CartoDB y Bitácora de Expedición...");
    const mapDetails = await page.evaluate(() => {
      const leafletContainer = document.querySelector(".leaflet-container");
      const text = document.body.textContent || "";
      const cartoBadgeFound = text.includes("OpenStreetMap CartoDB");
      const bitacoraFound = text.includes("Lugares Donde Estuvimos");
      const sessionCards = document.querySelectorAll(".overflow-y-auto .cursor-pointer");
      return {
        leafletFound: !!leafletContainer,
        cartoBadgeFound,
        bitacoraFound,
        sessionCount: sessionCards.length,
      };
    });

    recordResult(
      "Mapa Táctico Leaflet CartoDB",
      mapDetails.leafletFound && mapDetails.cartoBadgeFound,
      `Contenedor Leaflet: ${mapDetails.leafletFound}, Badge CartoDB: ${mapDetails.cartoBadgeFound}`
    );

    recordResult(
      "Bitácora 'Lugares Donde Estuvimos'",
      mapDetails.bitacoraFound && mapDetails.sessionCount > 0,
      `Encabezado presente: ${mapDetails.bitacoraFound}, Puntos registrados: ${mapDetails.sessionCount}`
    );

    // ----------------------------------------------------------------------
    // 4. APERTURA DEL MODAL "🎓 Cátedra EDO & Numérico"
    // ----------------------------------------------------------------------
    logStep("🎯 TIRO 4: Apertura del Modal '🎓 Cátedra EDO & Numérico'...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const academicBtn = btns.find((b) => b.textContent?.includes("Cátedra EDO & Numérico"));
      academicBtn?.click();
    });
    await page.waitForTimeout(300);

    const modalState = await page.evaluate(() => {
      const modalH3 = Array.from(document.querySelectorAll("h3")).find((h) =>
        h.textContent?.includes("Auditorio Académico")
      );
      const text = document.body.textContent || "";
      const hasBadge = text.includes("Cátedra Interdisciplinar");
      const hasSubtitle = text.includes("Ecuaciones Diferenciales Ordinarias");
      return {
        isOpen: !!modalH3,
        titleText: modalH3?.textContent?.trim() || "",
        hasBadge,
        hasSubtitle,
      };
    });

    recordResult(
      "Despliegue del Modal 'AcademicAuditoriumModal'",
      modalState.isOpen && modalState.hasBadge && modalState.hasSubtitle,
      `Título: "${modalState.titleText}" | Badge Interdisciplinar: ${modalState.hasBadge}`
    );

    // ----------------------------------------------------------------------
    // 5. PESTAÑA 1 (EDO): FÓRMULAS DE BALANCE DE MASA Y SLIDERS
    // ----------------------------------------------------------------------
    logStep("🎯 TIRO 5: Pestaña 1 (EDO) - Fórmulas y Sliders...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const tab1 = btns.find((b) => b.textContent?.includes("1. Ecuaciones Diferenciales"));
      tab1?.click();
    });
    await page.waitForTimeout(150);

    const tab1Data = await page.evaluate(() => {
      const text = document.body.textContent || "";
      const f1 = text.includes("V · dC/dt = G - Q · C(t)");
      const f2 = text.includes("μ(t) = e^(∫ k dt) = e^(kt)");
      const f3 = text.includes("C(t) = C_inf + (C0 - C_inf)e^(-kt)");
      const sliders = document.querySelectorAll("input[type='range']");
      const c0Label = text.includes("C0 (PPM Inicial)");
      const cInfLabel = text.includes("C_inf (Equilibrio Saturación)");
      const kLabel = text.includes("k (Tasa Renovación Q/V)");
      return {
        f1,
        f2,
        f3,
        slidersCount: sliders.length,
        hasLabels: c0Label && cInfLabel && kLabel,
      };
    });

    recordResult(
      "Pestaña 1: Fórmulas Matemáticas de Balance de Masa",
      tab1Data.f1 && tab1Data.f2 && tab1Data.f3,
      `Base EDO: ${tab1Data.f1} | Factor Integrante: ${tab1Data.f2} | Analítica Exacta: ${tab1Data.f3}`
    );

    recordResult(
      "Pestaña 1: Controles Deslizantes de Variables Físicas",
      tab1Data.slidersCount >= 3 && tab1Data.hasLabels,
      `Sliders detectados: ${tab1Data.slidersCount}, Etiquetas C0/C_inf/k: ${tab1Data.hasLabels}`
    );

    // ----------------------------------------------------------------------
    // 6. PESTAÑA 2: SIMULACIÓN EULER VS RK4 (GRÁFICO SVG & MÉTRICAS)
    // ----------------------------------------------------------------------
    logStep("🎯 TIRO 6: Pestaña 2 - Simulación Euler vs RK4 (Gráfico SVG & RMSE)...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const tab2 = btns.find((b) => b.textContent?.includes("2. Simulación Euler vs RK4"));
      tab2?.click();
    });
    await page.waitForTimeout(200);

    const tab2Data = await page.evaluate(() => {
      const svg = document.querySelector("svg[viewBox='0 0 600 240']");
      const polylines = svg ? svg.querySelectorAll("polyline") : [];
      const text = document.body.textContent || "";
      const legExacta = text.includes("Analítica Exacta");
      const legEuler = text.includes("Euler (O(h))");
      const legRk4 = text.includes("RK4 (O(h⁴))");
      const rmseEuler = text.includes("RMSE Euler (1er Orden)");
      const rmseRk4 = text.includes("RMSE Runge-Kutta 4");
      const boost = text.includes("Ganancia de Precisión");
      return {
        svgPresent: !!svg,
        polylinesCount: polylines.length,
        legendsOk: legExacta && legEuler && legRk4,
        metricsOk: rmseEuler && rmseRk4 && boost,
      };
    });

    recordResult(
      "Pestaña 2: Gráfico SVG Comparativo y Curvas Numéricas",
      tab2Data.svgPresent && tab2Data.polylinesCount === 3 && tab2Data.legendsOk,
      `SVG viewBox 600x240: ${tab2Data.svgPresent}, Curvas renderizadas: ${tab2Data.polylinesCount}/3, Leyendas: ${tab2Data.legendsOk}`
    );

    recordResult(
      "Pestaña 2: Tarjetas de Métricas de Error RMSE y Ganancia",
      tab2Data.metricsOk,
      "RMSE Euler, RMSE RK4 y Ganancia de Precisión verificados"
    );

    // ----------------------------------------------------------------------
    // 7. PESTAÑA 3: ANÁLISIS DE ERRORES & LATEX (TABLA & BOTONES)
    // ----------------------------------------------------------------------
    logStep("🎯 TIRO 7: Pestaña 3 - Análisis de Errores, Tabla Numérica & LaTeX...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const tab3 = btns.find((b) => b.textContent?.includes("3. Análisis de Errores & LaTeX"));
      tab3?.click();
    });
    await page.waitForTimeout(200);

    const tab3Data = await page.evaluate(() => {
      const tableHeaders = Array.from(document.querySelectorAll("thead th")).map((th) =>
        th.textContent?.trim()
      );
      const rows = document.querySelectorAll("tbody tr");
      const text = document.body.textContent || "";
      const copyBtn = Array.from(document.querySelectorAll("button")).find((b) =>
        b.textContent?.includes("Copiar LaTeX")
      );
      const exportBtn = Array.from(document.querySelectorAll("button")).find((b) =>
        b.textContent?.includes("Exportar CSV")
      );

      const requiredCols = [
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
      const colsMatch = requiredCols.every((col) => tableHeaders.includes(col));

      return {
        colsMatch,
        rowCount: rows.length,
        copyBtnExists: !!copyBtn,
        exportBtnExists: !!exportBtn,
      };
    });

    recordResult(
      "Pestaña 3: Tabla de Iteraciones con Columnas Científicas",
      tab3Data.colsMatch && tab3Data.rowCount >= 10,
      `Columnas requeridas presentes: ${tab3Data.colsMatch}, Filas computadas: ${tab3Data.rowCount}`
    );

    recordResult(
      "Pestaña 3: Botones de Exportación CSV y LaTeX",
      tab3Data.copyBtnExists && tab3Data.exportBtnExists,
      `Botón Copiar LaTeX: ${tab3Data.copyBtnExists} | Botón Exportar CSV: ${tab3Data.exportBtnExists}`
    );

    // Probar clic en Copiar LaTeX y verificar feedback reactivo
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const copyBtn = btns.find((b) => b.textContent?.includes("Copiar LaTeX"));
      copyBtn?.click();
    });
    await page.waitForTimeout(150);

    const feedbackCopied = await page.evaluate(() => {
      const text = document.body.textContent || "";
      return text.includes("¡Copiado!");
    });
    recordResult(
      "Feedback Reactivo '¡Copiado!'",
      feedbackCopied,
      "El botón cambió transitoriamente a '¡Copiado!'"
    );

    // ----------------------------------------------------------------------
    // 8. CIERRE DEL MODAL CON BOTÓN X
    // ----------------------------------------------------------------------
    logStep("🎯 TIRO 8: Cierre del Modal con Botón X...");
    await page.evaluate(() => {
      const closeBtn = document.querySelector(".fixed.inset-0 button[title*='Cerrar']");
      if (closeBtn) closeBtn.click();
    });

    let isModalClosed = false;
    for (let i = 0; i < 15; i++) {
      await page.waitForTimeout(100);
      const isStillOpen = await page.evaluate(() => {
        const modalH3 = Array.from(document.querySelectorAll("h3")).find((h) =>
          h.textContent?.includes("Auditorio Académico")
        );
        return !!modalH3;
      });
      if (!isStillOpen) {
        isModalClosed = true;
        break;
      }
    }

    recordResult(
      "Cierre del Modal con Botón X",
      isModalClosed,
      `Modal completamente cerrado tras animación Anime.js (Cerrado: ${isModalClosed})`
    );

    // ----------------------------------------------------------------------
    // 9. AUDITORÍA DE CONSOLA Y ESTABILIDAD
    // ----------------------------------------------------------------------
    logStep("🎯 TIRO 9: Auditoría de Errores de Consola...");
    recordResult(
      "Cero Errores de Consola (console.error)",
      consoleErrors.length === 0,
      `Errores: ${consoleErrors.length}`
    );
    recordResult(
      "Cero Excepciones no controladas (pageerror)",
      pageErrors.length === 0,
      `Excepciones: ${pageErrors.length}`
    );

    const allPassed = testResults.every((r) => r.passed);
    console.log("\n================================================================================");
    if (allPassed) {
      console.log("🎯🎯🎯 ¡TIRO PERFECTO AL CENTRO DE LA DIANA! 100% GREEN 🎯🎯🎯");
      console.log("🎯 EL GRAN CAPITÁN USOPP DECLARA ESTE PROYECTO LIBRE DE BUGS Y APTO PARA DESPLIEGUE.");
    } else {
      console.log("💥 ALERTA: UNO O MÁS DISPAROS FALLARON.");
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

runUsoppValidation()
  .then((res) => {
    if (!res.allPassed) {
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error("💥 ERROR CATASTRÓFICO EN SCRIPT DE QA:", err);
    process.exit(1);
  });
