export interface DeductionStep {
  step: number
  badge: string
  title: string
  subhead: string
  explanation: string
  physicalInsight: string
}

export interface VariableDoc {
  symbol: string
  name: string
  unit: string
  type: 'variable' | 'param' | 'condition' | 'constant'
  typeLabel: string
  hardwareOrigin: string
  mathRole: string
  liveKey?: 'c0' | 'cInf' | 'k' | 'c'
}

export const DEDUCTION_STEPS: DeductionStep[] = [
  {
    step: 1,
    badge: 'Paso 1: Álgebra',
    title: 'Separación de Variables',
    subhead: 'Aislamiento de diferenciales en miembros opuestos',
    explanation: 'Dividimos ambos miembros entre el factor (C - C_ext) y multiplicamos por el diferencial dt. Así, el miembro izquierdo depende exclusivamente de la concentración C y el derecho del tiempo t.',
    physicalInsight: 'Aislar dC/(C - C_ext) representa normalizar la variación con respecto al gradiente remanente hacia el equilibrio.'
  },
  {
    step: 2,
    badge: 'Paso 2: Cálculo',
    title: 'Integración de Ambos Miembros',
    subhead: 'Aplicación del operador integral indefinido',
    explanation: 'Integramos ∫ dC / (C - C_ext) como un logaritmo natural inmediato ln|C - C_ext|, mientras que en el miembro derecho la integral de la constante -k produce -k·t más la constante de integración c_1.',
    physicalInsight: 'La integral suma las micro-variaciones temporales de contaminación acumuladas durante la ventilación.'
  },
  {
    step: 3,
    badge: 'Paso 3: Trascendente',
    title: 'Exponenciación Natural',
    subhead: 'Cancelación del logaritmo mediante función inversa',
    explanation: 'Aplicamos la base de Euler e^(...) a ambos miembros. Por leyes de los exponentes e^(-kt + c_1) = e^(c_1) · e^(-kt). Renombramos la constante arbitraria real c = ±e^(c_1).',
    physicalInsight: 'La función exponencial modela físicamente el amortiguamiento asintótico natural del flujo de aire.'
  },
  {
    step: 4,
    badge: 'Paso 4: Solución',
    title: 'Solución General de la EDO',
    subhead: 'Familia infinita de trayectorias posibles',
    explanation: 'Despejamos C(t) sumando la concentración exterior C_ext en ambos miembros: C(t) = C_ext + c · e^(-kt). La constante c define qué curva específica sigue el recinto.',
    physicalInsight: 'Representa el comportamiento general de cualquier aula o habitación antes de conocer las lecturas iniciales.'
  },
  {
    step: 5,
    badge: 'Paso 5: Telemetría IoT',
    title: 'Problema de Valor Inicial (PVI)',
    subhead: 'Acoplamiento con la telemetría del sensor en t = 0',
    explanation: 'Evaluamos en t = 0 cuando el sensor MQ-135 registra la lectura inicial C(0) = C_0. Dado que e^0 = 1, la ecuación queda C_ext + c = C_0, despejando c = C_0 - C_ext.',
    physicalInsight: 'La constante c queda anclada físicamente a la diferencia entre el aire viciado inicial y el aire limpio exterior.'
  },
  {
    step: 6,
    badge: 'Paso 6: Modelo Exacto',
    title: 'Solución Particular del Sistema',
    subhead: 'Ecuación analítica final calibrada para el laboratorio',
    explanation: 'Sustituyendo el valor de c obtenido en el PVI, alcanzamos la fórmula exacta: C(t) = C_ext + (C_0 - C_ext) · e^(-kt), permitiendo predecir la curva continua en cualquier instante t.',
    physicalInsight: 'Esta es la ecuación analítica exacta contra la cual se comparan las aproximaciones numéricas de Euler y Runge-Kutta 4.'
  }
]

export const EQUATION_VARIABLES: VariableDoc[] = [
  {
    symbol: 'C(t)',
    name: 'Concentración Temporal',
    unit: 'PPM',
    type: 'variable',
    typeLabel: 'Variable Dependiente',
    hardwareOrigin: 'Medición continua en tiempo real calculada o predicha para el gas en el aula.',
    mathRole: 'Función incógnita principal de la ecuación diferencial ordinaria.'
  },
  {
    symbol: 't',
    name: 'Tiempo Transcurrido',
    unit: 'min',
    type: 'variable',
    typeLabel: 'Variable Independiente',
    hardwareOrigin: 'Cronómetro interno del microcontrolador ESP32 desde el inicio del ensayo.',
    mathRole: 'Parámetro temporal sobre el cual se evalúa la evolución del sistema continuo.'
  },
  {
    symbol: 'dC/dt',
    name: 'Tasa de Variación Instantánea',
    unit: 'PPM/min',
    type: 'variable',
    typeLabel: 'Derivada Temporal',
    hardwareOrigin: 'Rapidez instantánea con que sube o baja la concentración en el recinto.',
    mathRole: 'Derivada de primer orden que define la dinámica del balance de masa.'
  },
  {
    symbol: 'k',
    name: 'Tasa de Renovación (Q/V)',
    unit: 'min⁻¹',
    type: 'param',
    typeLabel: 'Parámetro Físico',
    hardwareOrigin: 'Caudal del extractor Q (m³/min) dividido entre el volumen del aula V (m³).',
    mathRole: 'Constante de proporcionalidad cinético-física. Su inversa τ = 1/k es el tiempo característico.',
    liveKey: 'k'
  },
  {
    symbol: 'C_ext',
    name: 'Concentración Exterior',
    unit: 'PPM',
    type: 'param',
    typeLabel: 'Límite Asintótico',
    hardwareOrigin: 'Nivel basal de gas en el aire fresco de entrada (ambiente exterior limpio ~400 PPM).',
    mathRole: 'Asíntota horizontal de equilibrio hacia la cual converge el sistema cuando t → ∞.',
    liveKey: 'cInf'
  },
  {
    symbol: 'C_0',
    name: 'Concentración Inicial en t=0',
    unit: 'PPM',
    type: 'condition',
    typeLabel: 'Condición Inicial (PVI)',
    hardwareOrigin: 'Primera muestra leída por el sensor MQ-135 en el pin ADC al iniciar la prueba.',
    mathRole: 'Valor de frontera que determina la constante arbitraria c = C_0 - C_ext.',
    liveKey: 'c0'
  },
  {
    symbol: 'c',
    name: 'Constante de Integración',
    unit: 'PPM',
    type: 'condition',
    typeLabel: 'Amplitud de Perturbación',
    hardwareOrigin: 'Diferencia física (C_0 - C_ext) entre el recinto viciado y la referencia externa.',
    mathRole: 'Constante que escala la amplitud del término exponencial transitorio.',
    liveKey: 'c'
  },
  {
    symbol: 'e',
    name: 'Número de Euler',
    unit: 'Adimensional',
    type: 'constant',
    typeLabel: 'Constante Universal',
    hardwareOrigin: 'Constante matemática natural e ≈ 2.7182818...',
    mathRole: 'Base canónica de procesos donde la tasa de cambio es proporcional al estado actual.'
  }
]
