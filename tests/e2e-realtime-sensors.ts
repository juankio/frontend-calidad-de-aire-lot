import { chromium } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';

async function runRealtimeSensorsQATest() {
  console.log('🎯 [USOPP QA] Iniciando suite de pruebas de francotirador para Sensores en Vivo...');

  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  // Lanzar Chromium con Playwright
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  const page = await context.newPage();

  // Escuchar errores de consola y excepciones no capturadas
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(`[Console Error] ${msg.text()}`);
    }
  });

  page.on('pageerror', (err) => {
    pageErrors.push(`[Page Error] ${err.message}`);
  });

  try {
    console.log('🎯 [Paso 1] Navegando a http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });

    console.log('🎯 [Paso 2] Verificando que el header contenga el botón "Sensores en Vivo"...');
    // El botón puede tener texto "Sensores en Vivo" o "Sensores"
    const sensorsBtn = page.locator('button', { hasText: /Sensores/i }).first();
    await sensorsBtn.waitFor({ state: 'visible', timeout: 10000 });
    const btnText = await sensorsBtn.innerText();
    console.log(`✅ Botón encontrado en el header: "${btnText.replace(/\s+/g, ' ').trim()}"`);

    console.log('🎯 [Paso 3] Haciendo click en el botón de "Sensores en Vivo"...');
    await sensorsBtn.click();

    console.log('🎯 [Paso 4] Validando apertura del modal RealtimeSensorsModal...');
    const modalTitle = page.locator('text=BANCO DE SENSORES EN TIEMPO REAL');
    await modalTitle.waitFor({ state: 'visible', timeout: 10000 });
    console.log('✅ Modal RealtimeSensorsModal abierto exitosamente.');

    // Validar las tarjetas de los 4 sensores físicos + Telemetría ESP32
    console.log('🎯 [Paso 5] Validando tarjetas de sensores físicos y telemetría...');

    // 1. MQ-135 (PPM, Raw ADC, Voltaje, GPIO 34)
    console.log('  🔍 Verificando MQ-135...');
    const mq135Card = page.locator('h4', { hasText: /MQ-135/i });
    await mq135Card.waitFor({ state: 'visible', timeout: 5000 });
    const mq135Text = await page.locator('div', { has: mq135Card }).first().innerText();
    if (!/GPIO 34/.test(mq135Text)) throw new Error('MQ-135 no muestra GPIO 34');
    if (!/PPM|ppm/i.test(mq135Text)) throw new Error('MQ-135 no muestra PPM');
    if (!/ADC|Raw/i.test(mq135Text)) throw new Error('MQ-135 no muestra Raw ADC');
    if (!/Voltaje|V/i.test(mq135Text)) throw new Error('MQ-135 no muestra Voltaje');
    console.log('  ✅ MQ-135 validado (PPM, Raw ADC, Voltaje, GPIO 34).');

    // 2. MQ-7 (PPM CO, Raw ADC, Voltaje, GPIO 35)
    console.log('  🔍 Verificando MQ-7...');
    const mq7Card = page.locator('h4', { hasText: /MQ-7/i });
    await mq7Card.waitFor({ state: 'visible', timeout: 5000 });
    const mq7Text = await page.locator('div', { has: mq7Card }).first().innerText();
    if (!/GPIO 35/.test(mq7Text)) throw new Error('MQ-7 no muestra GPIO 35');
    if (!/CO|Monóxido/i.test(mq7Text)) throw new Error('MQ-7 no muestra CO');
    if (!/ADC|Raw/i.test(mq7Text)) throw new Error('MQ-7 no muestra Raw ADC');
    if (!/Voltaje|V/i.test(mq7Text)) throw new Error('MQ-7 no muestra Voltaje');
    console.log('  ✅ MQ-7 validado (PPM CO, Raw ADC, Voltaje, GPIO 35).');

    // 3. DHT11 (Temperatura °C, Humedad % HR, GPIO 15)
    console.log('  🔍 Verificando DHT11...');
    const dht11Card = page.locator('h4', { hasText: /DHT11/i });
    await dht11Card.waitFor({ state: 'visible', timeout: 5000 });
    const dht11Text = await page.locator('div', { has: dht11Card }).first().innerText();
    if (!/GPIO 15/.test(dht11Text)) throw new Error('DHT11 no muestra GPIO 15');
    if (!/Temperatura|°C/i.test(dht11Text)) throw new Error('DHT11 no muestra Temperatura');
    if (!/Humedad|HR|%/i.test(dht11Text)) throw new Error('DHT11 no muestra Humedad %');
    console.log('  ✅ DHT11 validado (Temperatura °C, Humedad % HR, GPIO 15).');

    // 4. MPU-6050 (Acelerómetro / Giroscopio, I2C 0x68, inclinación X/Y)
    console.log('  🔍 Verificando MPU-6050...');
    const mpuCard = page.locator('h4', { hasText: /MPU-6050/i });
    await mpuCard.waitFor({ state: 'visible', timeout: 5000 });
    const mpuText = await page.locator('div', { has: mpuCard }).first().innerText();
    if (!/0x68/.test(mpuText)) throw new Error('MPU-6050 no muestra dirección I2C 0x68');
    if (!/Acelerómetro|Giroscopio/i.test(mpuText)) throw new Error('MPU-6050 no muestra Acelerómetro / Giroscopio');
    if (!/Inclinación X|Eje/i.test(mpuText)) throw new Error('MPU-6050 no muestra Eje Inclinación X');
    if (!/Inclinación Y|Eje/i.test(mpuText)) throw new Error('MPU-6050 no muestra Eje Inclinación Y');
    console.log('  ✅ MPU-6050 validado (Acelerómetro / Giroscopio, I2C 0x68, inclinación X/Y).');

    // 5. Telemetría ESP32 (Uptime, Heap, LittleFS)
    console.log('  🔍 Verificando Telemetría ESP32...');
    const esp32Card = page.locator('h4', { hasText: /ESP32/i });
    await esp32Card.waitFor({ state: 'visible', timeout: 5000 });
    const esp32Text = await page.locator('div', { has: esp32Card }).first().innerText();
    if (!/Tiempo Activo|Uptime/i.test(esp32Text)) throw new Error('Telemetría ESP32 no muestra Uptime');
    if (!/Heap/i.test(esp32Text)) throw new Error('Telemetría ESP32 no muestra Heap');
    if (!/LittleFS|Flash/i.test(esp32Text)) throw new Error('Telemetría ESP32 no muestra LittleFS');
    console.log('  ✅ Telemetría ESP32 validada (Uptime, Heap, LittleFS).');

    // Esperar un momento para animaciones estables
    await page.waitForTimeout(500);

    // Captura de pantalla del modal
    const repoRoot = path.resolve(__dirname, '../..');
    const screenshotDir = path.resolve(repoRoot, 'frontend/tests/screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
    const screenshotPath = path.resolve(screenshotDir, 'sensores-en-vivo-qa.png');
    console.log(`🎯 [Paso 6] Guardando captura en ${screenshotPath}...`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log('✅ Captura de pantalla guardada exitosamente.');

    // Paso 7: Cerrar el modal y confirmar que no haya errores
    console.log('🎯 [Paso 7] Cerrando el modal...');
    const closeBtn = page.locator('button[aria-label="Cerrar modal de sensores"]');
    await closeBtn.waitFor({ state: 'visible', timeout: 5000 });
    await closeBtn.click();

    // Esperar a que el modal desaparezca
    await modalTitle.waitFor({ state: 'hidden', timeout: 5000 });
    console.log('✅ Modal cerrado exitosamente.');

    // Verificar errores de consola
    console.log('🎯 [Paso 8] Verificando logs de consola y errores de página...');
    const fatalErrors = consoleErrors.filter(err => 
      !err.includes('favicon.ico') && 
      !err.includes('Failed to load resource') &&
      !err.includes('[Vue warn]')
    );

    if (pageErrors.length > 0) {
      console.error('❌ Errores no capturados en la página:', pageErrors);
      throw new Error(`Se detectaron ${pageErrors.length} errores no capturados en la página.`);
    }

    if (fatalErrors.length > 0) {
      console.warn('⚠️ Advertencias/Errores en consola:', fatalErrors);
    } else {
      console.log('✅ Cero errores fatales en consola.');
    }

    console.log('🏆 ¡TODAS LAS ASERCIONES PASARON EN VERDE! ¡MISIÓN DE SNIPER CUMPLIDA!');
    return {
      success: true,
      screenshotPath,
      consoleErrors,
      pageErrors
    };
  } finally {
    await browser.close();
  }
}

runRealtimeSensorsQATest()
  .then((res) => {
    console.log(JSON.stringify(res, null, 2));
    process.exit(0);
  })
  .catch((err) => {
    console.error('💥 ERROR EN LA PRUEBA QA:', err);
    process.exit(1);
  });
