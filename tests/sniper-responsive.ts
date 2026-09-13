import { chromium, type Browser, type Page } from 'playwright'

interface ViewportConfig {
  name: string
  device: string
  width: number
  height: number
}

interface TestResult {
  viewport: string
  device: string
  scrollWidth: number
  innerWidth: number
  hasHorizontalScroll: boolean
  headerButtons: {
    name: string
    visible: boolean
    clickable: boolean
    box: { x: number; y: number; width: number; height: number } | null
    error?: string
  }[]
  usbModal: {
    opened: boolean
    closed: boolean
    dimensions: { width: number; height: number } | null
    fitsViewport: boolean
    overflowX: boolean
    error?: string
  }
  academicModal: {
    opened: boolean
    closed: boolean
    dimensions: { width: number; height: number } | null
    fitsViewport: boolean
    overflowX: boolean
    error?: string
  }
  frankensteinSwitch?: {
    initialChecked: boolean
    toggledChecked: boolean
    restoredChecked: boolean
    success: boolean
    error?: string
  }
  consoleErrors: string[]
  pageErrors: string[]
}

const VIEWPORTS: ViewportConfig[] = [
  { name: 'Móvil', device: 'iPhone 14', width: 390, height: 844 },
  { name: 'Tablet', device: 'iPad', width: 768, height: 1024 },
  { name: 'Desktop', device: 'Desktop 1440p', width: 1440, height: 900 }
]

async function runSniperSuite() {
  console.log('🏹 [USOPP SNIPER QA] ¡Iniciando tiro al blanco de Responsividad y Modales!')
  console.log('========================================================================\n')

  const browser: Browser = await chromium.launch({
    headless: true
  })

  const results: TestResult[] = []

  for (const vp of VIEWPORTS) {
    console.log(`🎯 Calibrando mira para Viewport: ${vp.name} (${vp.device}) -> ${vp.width}x${vp.height}`)
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2
    })

    const page: Page = await context.newPage()
    const consoleErrors: string[] = []
    const pageErrors: string[] = []

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
        console.log(`   [Console Error] ${msg.text()}`)
      }
    })

    page.on('pageerror', (err) => {
      pageErrors.push(err.message)
      console.log(`   [Page Error] ${err.message}`)
    })

    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 15000 })
    await page.waitForTimeout(600) // tiempo para montaje y animaciones iniciales

    // 1. Verificación de scroll horizontal
    const scrollInfo = await page.evaluate(() => {
      const bodyScrollWidth = document.body.scrollWidth
      const docScrollWidth = document.documentElement.scrollWidth
      const innerWidth = window.innerWidth
      const effectiveScrollWidth = Math.max(bodyScrollWidth, docScrollWidth)
      return {
        bodyScrollWidth,
        docScrollWidth,
        innerWidth,
        effectiveScrollWidth,
        hasHorizontalScroll: effectiveScrollWidth > innerWidth
      }
    })

    console.log(`   📏 Ancho de ventana: ${scrollInfo.innerWidth}px | Ancho de scroll: ${scrollInfo.effectiveScrollWidth}px`)
    console.log(`   ${scrollInfo.hasHorizontalScroll ? '❌ OVERFLOW HORIZONTAL DETECTADO' : '✅ CERO scroll horizontal indeseado'}`)

    // 2. Verificación de botones de la cabecera
    const targetButtons = [
      { name: 'Modo Local', selector: "button:has-text('Modo Local')" },
      { name: 'En Vivo', selector: "button:has-text('En Vivo')" },
      { name: 'USB ESP32', selector: "button:has-text('USB ESP32')" },
      { name: 'Cátedra EDO', selector: "button:has-text('Cátedra EDO')" },
      { name: 'Marcar Lugar', selector: "button:has-text('Marcar Lugar')" }
    ]

    const headerButtonsResult: TestResult['headerButtons'] = []

    for (const btnInfo of targetButtons) {
      const locator = page.locator(btnInfo.selector).first()
      const isVis = await locator.isVisible()
      let clickable = false
      let box: { x: number; y: number; width: number; height: number } | null = null
      let errStr: string | undefined = undefined

      if (isVis) {
        box = await locator.boundingBox()
        if (box) {
          const withinBounds = box.x >= 0 && (box.x + box.width) <= vp.width + 2 // 2px margin tolerance
          if (!withinBounds) {
            errStr = `Desbordado del viewport horizontal: x=${box.x}, width=${box.width}, viewportWidth=${vp.width}`
          }
        }
        try {
          // Probar hover y clicabilidad sin romper el flujo
          await locator.hover({ timeout: 2000 })
          clickable = true
        } catch (e: any) {
          errStr = e.message
        }
      } else {
        errStr = 'Elemento no visible en el DOM'
      }

      headerButtonsResult.push({
        name: btnInfo.name,
        visible: isVis,
        clickable,
        box,
        error: errStr
      })

      console.log(`   🔘 Botón "${btnInfo.name}": ${isVis ? 'VISIBLE' : 'OCULTO'} | Clicable: ${clickable ? 'SÍ' : 'NO'}${errStr ? ` (Nota: ${errStr})` : ''}`)
    }

    // Probar click en Modo Local y En Vivo para asegurar interactividad
    try {
      const liveBtn = page.locator("button:has-text('En Vivo')").first()
      await liveBtn.click()
      await page.waitForTimeout(200)
      const localBtn = page.locator("button:has-text('Modo Local')").first()
      await localBtn.click()
      await page.waitForTimeout(200)
    } catch (e) {
      console.log(`   ⚠️ Nota al conmutar Modo Local/En Vivo:`, e)
    }

    // 3. Prueba de UsbWifiModal
    console.log(`   🪟 Probando UsbWifiModal...`)
    let usbModalResult: TestResult['usbModal'] = {
      opened: false,
      closed: false,
      dimensions: null,
      fitsViewport: false,
      overflowX: false
    }

    try {
      const usbBtn = page.locator("button:has-text('USB ESP32')").first()
      await usbBtn.click()
      const usbModalHeader = page.locator("h3:has-text('Aprovisionamiento Wi-Fi por USB')")
      await usbModalHeader.waitFor({ state: 'visible', timeout: 5000 })
      usbModalResult.opened = true

      // Medir modal card
      const modalCard = page.locator("div.fixed.inset-0 div.rounded-2xl").first()
      const box = await modalCard.boundingBox()

      if (box) {
        usbModalResult.dimensions = { width: Math.round(box.width), height: Math.round(box.height) }
        usbModalResult.fitsViewport = box.width <= vp.width && box.height <= vp.height
        console.log(`      📐 Dimensiones UsbWifiModal: ${box.width}x${box.height}px (Viewport: ${vp.width}x${vp.height}px)`)
      }

      // Chequear si modal indujo overflow horizontal
      const modalScrollCheck = await page.evaluate(() => {
        return Math.max(document.body.scrollWidth, document.documentElement.scrollWidth) > window.innerWidth
      })
      usbModalResult.overflowX = modalScrollCheck

      // Cerrar modal
      const closeBtn = page.locator("button[aria-label='Cerrar modal']").first()
      await closeBtn.click()
      await usbModalHeader.waitFor({ state: 'hidden', timeout: 3000 })
      usbModalResult.closed = true
      console.log(`      ✓ UsbWifiModal cerrado: CORRECTO`)
    } catch (e: any) {
      usbModalResult.error = e.message
      console.log(`      ❌ Error con UsbWifiModal: ${e.message}`)
    }

    // 4. Prueba de AcademicAuditoriumModal
    console.log(`   🎓 Probando AcademicAuditoriumModal...`)
    let academicModalResult: TestResult['academicModal'] = {
      opened: false,
      closed: false,
      dimensions: null,
      fitsViewport: false,
      overflowX: false
    }

    try {
      const acadBtn = page.locator("button:has-text('Cátedra EDO')").first()
      await acadBtn.click()
      const acadHeader = page.locator("h3:has-text('Auditorio Académico')")
      await acadHeader.waitFor({ state: 'visible', timeout: 5000 })
      academicModalResult.opened = true

      // Medir modal
      const acadCard = page.locator("div.fixed.inset-0 div.rounded-2xl").first()
      const box = await acadCard.boundingBox()

      if (box) {
        academicModalResult.dimensions = { width: Math.round(box.width), height: Math.round(box.height) }
        academicModalResult.fitsViewport = box.width <= vp.width && box.height <= vp.height
        console.log(`      📐 Dimensiones AcademicAuditoriumModal: ${box.width}x${box.height}px (Viewport: ${vp.width}x${vp.height}px)`)
      }

      const modalScrollCheck = await page.evaluate(() => {
        return Math.max(document.body.scrollWidth, document.documentElement.scrollWidth) > window.innerWidth
      })
      academicModalResult.overflowX = modalScrollCheck

      // Probar pestañas dentro del modal para verificar fluidez de animaciones
      const tab2 = page.locator("button:has-text('2. Simulación Euler vs RK4')").first()
      if (await tab2.isVisible()) {
        await tab2.click()
        await page.waitForTimeout(300)
      }

      // Cerrar modal
      const closeBtn = page.locator("button[aria-label='Cerrar ventana académica']").first()
      await closeBtn.click()
      await acadHeader.waitFor({ state: 'hidden', timeout: 3000 })
      academicModalResult.closed = true
      console.log(`      ✓ AcademicAuditoriumModal cerrado: CORRECTO`)
    } catch (e: any) {
      academicModalResult.error = e.message
      console.log(`      ❌ Error con AcademicAuditoriumModal: ${e.message}`)
    }

    // 5. FrankensteinSwitch (especialmente en Desktop, pero lo testeamos según corresponda)
    let switchResult: TestResult['frankensteinSwitch'] = undefined
    if (vp.name === 'Desktop') {
      console.log(`   ⚡ Probando FrankensteinSwitch en Desktop...`)
      try {
        const switchEl = page.locator("div[role='switch']").first()
        await switchEl.waitFor({ state: 'visible', timeout: 5000 })
        const initialChecked = (await switchEl.getAttribute('aria-checked')) === 'true'

        // Accionar palanca
        await switchEl.click()
        await page.waitForTimeout(600) // tiempo para animación Anime.js y chispas
        const toggledChecked = (await switchEl.getAttribute('aria-checked')) === 'true'

        // Accionar de nuevo para regresar
        await switchEl.click()
        await page.waitForTimeout(600)
        const restoredChecked = (await switchEl.getAttribute('aria-checked')) === 'true'

        const success = initialChecked !== toggledChecked && restoredChecked === initialChecked
        switchResult = {
          initialChecked,
          toggledChecked,
          restoredChecked,
          success
        }
        console.log(`      ✓ Palanca accionada: Inicial=${initialChecked} -> Toggled=${toggledChecked} -> Restaurado=${restoredChecked}`)
      } catch (e: any) {
        switchResult = {
          initialChecked: false,
          toggledChecked: false,
          restoredChecked: false,
          success: false,
          error: e.message
        }
        console.log(`      ❌ Error en FrankensteinSwitch: ${e.message}`)
      }
    }

    results.push({
      viewport: vp.name,
      device: vp.device,
      scrollWidth: scrollInfo.effectiveScrollWidth,
      innerWidth: scrollInfo.innerWidth,
      hasHorizontalScroll: scrollInfo.hasHorizontalScroll,
      headerButtons: headerButtonsResult,
      usbModal: usbModalResult,
      academicModal: academicModalResult,
      frankensteinSwitch: switchResult,
      consoleErrors,
      pageErrors
    })

    await context.close()
    console.log(`------------------------------------------------------------------------\n`)
  }

  await browser.close()
  return results
}

// Ejecutar si se llama directamente
runSniperSuite()
  .then((res) => {
    console.log('✅ Batería completada. Resumen JSON:')
    console.log(JSON.stringify(res, null, 2))
    process.exit(0)
  })
  .catch((err) => {
    console.error('💥 Error fatal en sniper suite:', err)
    process.exit(1)
  })
