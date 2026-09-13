import { ref, computed } from 'vue'

export interface AcademicStep {
  n: number
  t: number
  exact: number
  euler: number
  rk4: number
  errAbsEuler: number
  errRelEulerPct: number
  errAbsRk4: number
  errRelRk4Pct: number
}

export function useNumericalAcademic() {
  const c0 = ref(420)        // Concentración inicial (PPM)
  const cInf = ref(1150)     // Concentración de equilibrio asintótico (PPM)
  const k = ref(0.08)        // Tasa de renovación de aire (min^-1)
  const duration = ref(30)   // Duración de la simulación (minutos)
  const h = ref(1.0)         // Paso de integración (minutos)
  const activeTab = ref<'EDO' | 'NUMERICAL' | 'ERRORS' | 'LATEX'>('EDO')

  // Análisis de Estabilidad Numérica (Criterio de Lipschitz para Euler)
  const criticalStep = computed(() => Number((2.0 / Math.max(0.001, k.value)).toFixed(2)))
  const isEulerStable = computed(() => h.value < criticalStep.value)

  // Función de derivada temporal: dC/dt = k*(C_inf - C)
  const f = (c: number) => k.value * (cInf.value - c)

  // Solución Analítica Exacta continua: C(t) = C_inf + (C0 - C_inf)*e^(-k*t)
  const exactAt = (t: number) => cInf.value + (c0.value - cInf.value) * Math.exp(-k.value * t)

  // Generación reactiva de la simulación completa
  const simulation = computed(() => {
    const steps: AcademicStep[] = []
    const totalSteps = Math.min(200, Math.max(2, Math.floor(duration.value / Math.max(0.05, h.value))))

    let curEuler = c0.value
    let curRk4 = c0.value

    const eulerDiffs: number[] = []
    const rk4Diffs: number[] = []

    for (let i = 0; i <= totalSteps; i++) {
      const t = Number((i * h.value).toFixed(2))
      const exact = Number(exactAt(t).toFixed(2))

      const errAbsEuler = Number(Math.abs(exact - curEuler).toFixed(2))
      const errRelEulerPct = Number(((errAbsEuler / Math.max(1, exact)) * 100).toFixed(3))

      const errAbsRk4 = Number(Math.abs(exact - curRk4).toFixed(4))
      const errRelRk4Pct = Number(((errAbsRk4 / Math.max(1, exact)) * 100).toFixed(4))

      eulerDiffs.push(errAbsEuler)
      rk4Diffs.push(errAbsRk4)

      steps.push({
        n: i,
        t,
        exact,
        euler: Number(curEuler.toFixed(2)),
        rk4: Number(curRk4.toFixed(2)),
        errAbsEuler,
        errRelEulerPct,
        errAbsRk4,
        errRelRk4Pct
      })

      // Paso Euler
      curEuler = curEuler + h.value * f(curEuler)

      // Paso RK4
      const stepH = h.value
      const k1 = f(curRk4)
      const k2 = f(curRk4 + (stepH / 2.0) * k1)
      const k3 = f(curRk4 + (stepH / 2.0) * k2)
      const k4 = f(curRk4 + stepH * k3)
      curRk4 = curRk4 + (stepH / 6.0) * (k1 + 2.0 * k2 + 2.0 * k3 + k4)
    }

    // Métricas globales
    const calcMetrics = (diffs: number[]) => {
      const n = diffs.length || 1
      const mae = Number((diffs.reduce((a, b) => a + b, 0) / n).toFixed(3))
      const rmse = Number(Math.sqrt(diffs.reduce((a, b) => a + b * b, 0) / n).toFixed(3))
      const maxErr = Number(Math.max(...diffs).toFixed(3))
      return { mae, rmse, maxErr }
    }

    const metricsEuler = calcMetrics(eulerDiffs)
    const metricsRk4 = calcMetrics(rk4Diffs)
    const accuracyBoost = metricsRk4.rmse > 0 
      ? Number((metricsEuler.rmse / metricsRk4.rmse).toFixed(1))
      : 999

    return {
      steps,
      metricsEuler,
      metricsRk4,
      accuracyBoost
    }
  })

  // Generador de snippet LaTeX para informe o artículo
  const latexSnippet = computed(() => {
    const rows = simulation.value.steps.slice(0, 10).map(s => 
      `  ${s.n} & ${s.t.toFixed(1)} & ${s.exact.toFixed(1)} & ${s.euler.toFixed(1)} & ${s.rk4.toFixed(1)} & ${s.errAbsEuler.toFixed(2)} & ${s.errAbsRk4.toFixed(4)} \\\\`
    ).join('\n')

    return `% Tabla comparativa generada por Air Guardian IoT
\\begin{table}[h!]
\\centering
\\caption{Análisis Numérico de Calidad de Aire: Solución Analítica vs Euler vs RK4 (h = ${h.value} min, k = ${k.value})}
\\begin{tabular}{|c|c|c|c|c|c|c|}
\\hline
$n$ & $t_n$ (min) & $C_{\\text{exact}}$ & $C_{\\text{Euler}}$ & $C_{\\text{RK4}}$ & $E_{\\text{abs,Euler}}$ & $E_{\\text{abs,RK4}}$ \\\\
\\hline
${rows}
\\hline
\\end{tabular}
\\label{tab:air_guardian_edo_numerico}
\\end{table}`
  })

  function exportCsv() {
    const headers = ['Paso_n', 'Tiempo_min', 'C_Exacta_PPM', 'C_Euler_PPM', 'C_RK4_PPM', 'Err_Abs_Euler', 'Err_Rel_Euler_Pct', 'Err_Abs_RK4', 'Err_Rel_RK4_Pct']
    const lines = simulation.value.steps.map(s => 
      [s.n, s.t, s.exact, s.euler, s.rk4, s.errAbsEuler, s.errRelEulerPct, s.errAbsRk4, s.errRelRk4Pct].join(',')
    )
    const csvContent = headers.join(',') + '\n' + lines.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analisis_numerico_air_guardian_h${h.value}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return {
    c0,
    cInf,
    k,
    duration,
    h,
    activeTab,
    criticalStep,
    isEulerStable,
    simulation,
    latexSnippet,
    exportCsv
  }
}
