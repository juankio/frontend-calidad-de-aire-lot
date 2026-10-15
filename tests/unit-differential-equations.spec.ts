import { describe, it, expect } from "bun:test";
import { useNumericalAcademic } from "../composables/useNumericalAcademic";
import { DEDUCTION_STEPS, EQUATION_VARIABLES } from "../components/academic/deductionModel";

describe("🎯 [USOPP SNIPER QA] - Suite Unitaria de Ecuaciones Diferenciales & Métodos Numéricos", () => {
  describe("1. Motor Matemático EDO (useNumericalAcademic)", () => {
    it("1.1 Parámetros iniciales por defecto calibrados correctamente", () => {
      const { c0, cInf, k, duration, h, activeTab } = useNumericalAcademic();

      expect(c0.value).toBe(420);
      expect(cInf.value).toBe(1150);
      expect(k.value).toBe(0.08);
      expect(duration.value).toBe(30);
      expect(h.value).toBe(1.0);
      expect(activeTab.value).toBe("EDO");
    });

    it("1.2 Criterio de estabilidad numérica de Dahlquist para Euler (h_crit = 2/k)", () => {
      const { k, h, criticalStep, isEulerStable } = useNumericalAcademic();

      // Para k = 0.08, h_crit = 2 / 0.08 = 25.0
      expect(criticalStep.value).toBe(25.0);
      expect(isEulerStable.value).toBe(true);

      // Si k aumenta a 2.0, h_crit = 1.0. Con h = 1.2 debe ser inestable
      k.value = 2.0;
      expect(criticalStep.value).toBe(1.0);
      h.value = 1.2;
      expect(isEulerStable.value).toBe(false);

      // Con h = 0.8 debe ser estable
      h.value = 0.8;
      expect(isEulerStable.value).toBe(true);
    });

    it("1.3 Solución Analítica Exacta continua: C(t) = C_inf + (C0 - C_inf)e^(-kt)", () => {
      const { c0, cInf, k, duration, h, simulation } = useNumericalAcademic();

      c0.value = 420;
      cInf.value = 1150;
      k.value = 0.08;
      h.value = 1.0;
      duration.value = 30;

      const steps = simulation.value.steps;
      expect(steps.length).toBe(31); // De t=0 a t=30 en pasos de 1

      // Paso t = 0
      const step0 = steps[0];
      expect(step0.t).toBe(0);
      expect(step0.exact).toBe(420);
      expect(step0.euler).toBe(420);
      expect(step0.rk4).toBe(420);
      expect(step0.errAbsEuler).toBe(0);
      expect(step0.errAbsRk4).toBe(0);

      // Paso t = 10 min: C(10) = 1150 + (420 - 1150)*e^(-0.8) = 1150 - 730*0.449329 = 821.99
      const step10 = steps[10];
      expect(step10.t).toBe(10);
      const expectedExact10 = Number((1150 + (420 - 1150) * Math.exp(-0.08 * 10)).toFixed(2));
      expect(step10.exact).toBe(expectedExact10);
      expect(step10.exact).toBe(821.99);

      // Paso t = 30 min: C(30) = 1150 + (420 - 1150)*e^(-2.4) = 1150 - 730*0.090718 = 1083.78
      const step30 = steps[30];
      expect(step30.t).toBe(30);
      const expectedExact30 = Number((1150 + (420 - 1150) * Math.exp(-0.08 * 30)).toFixed(2));
      expect(step30.exact).toBe(expectedExact30);
      expect(step30.exact).toBe(1083.78);
    });

    it("1.4 Aproximación numérica Euler de 1er orden vs Runge-Kutta 4 (RK4)", () => {
      const { c0, cInf, k, h, duration, simulation } = useNumericalAcademic();

      c0.value = 420;
      cInf.value = 1150;
      k.value = 0.08;
      h.value = 1.0;
      duration.value = 10;

      const sim = simulation.value;

      // Paso 1 (t = 1):
      // Euler: C1 = 420 + 1.0 * 0.08 * (1150 - 420) = 420 + 58.4 = 478.4
      const step1 = sim.steps[1];
      expect(step1.t).toBe(1);
      expect(step1.euler).toBe(478.4);

      // RK4 es de 4to orden (O(h^4)), por lo que su error debe ser minúsculo
      expect(step1.errAbsRk4).toBeLessThan(0.01);
      // Euler es de 1er orden (O(h)), su error debe ser medible
      expect(step1.errAbsEuler).toBeGreaterThan(1.0);

      // En toda la simulación, RK4 debe superar a Euler en precisión (RMSE Euler > RMSE RK4)
      expect(sim.metricsEuler.rmse).toBeGreaterThan(sim.metricsRk4.rmse);
      expect(sim.accuracyBoost).toBeGreaterThan(10); // RK4 al menos 10x más preciso
    });

    it("1.5 Régimen de decaimiento y purga (C0 > C_inf): ventilación forzada", () => {
      const { c0, cInf, k, h, duration, simulation } = useNumericalAcademic();

      // Caso aula viciada purgada: C0 = 1600 PPM -> C_inf = 400 PPM
      c0.value = 1600;
      cInf.value = 400;
      k.value = 0.1;
      h.value = 1.0;
      duration.value = 20;

      const steps = simulation.value.steps;
      expect(steps[0].exact).toBe(1600);

      // La concentración debe decrecer monótonamente
      for (let i = 1; i < steps.length; i++) {
        expect(steps[i].exact).toBeLessThan(steps[i - 1].exact);
        expect(steps[i].euler).toBeLessThan(steps[i - 1].euler);
        expect(steps[i].rk4).toBeLessThan(steps[i - 1].rk4);
      }

      // En t = 20 min, debe estar muy cerca de 400 PPM
      const lastStep = steps[steps.length - 1];
      expect(lastStep.exact).toBeLessThan(600);
      expect(lastStep.exact).toBeGreaterThan(400);
    });

    it("1.6 Generación de snippet de tabla LaTeX lista para Overleaf", () => {
      const { latexSnippet, h, k } = useNumericalAcademic();

      h.value = 1.0;
      k.value = 0.08;

      const latex = latexSnippet.value;
      expect(latex).toContain("\\begin{table}[h!]");
      expect(latex).toContain("\\caption{Análisis Numérico de Calidad de Aire");
      expect(latex).toContain("h = 1 min, k = 0.08");
      expect(latex).toContain("\\begin{tabular}{|c|c|c|c|c|c|c|}");
      expect(latex).toContain("$C_{\\text{exact}}$ & $C_{\\text{Euler}}$ & $C_{\\text{RK4}}$");
      expect(latex).toContain("\\label{tab:air_guardian_edo_numerico}");
      expect(latex).toContain("\\end{tabular}");
      expect(latex).toContain("\\end{table}");
    });
  });

  describe("2. Modelo de Deducción Teórica (deductionModel.ts)", () => {
    it("2.1 La secuencia de deducción contiene exactamente 6 pasos ordenados", () => {
      expect(DEDUCTION_STEPS.length).toBe(6);

      DEDUCTION_STEPS.forEach((step, idx) => {
        expect(step.step).toBe(idx + 1);
        expect(step.badge).toContain(`Paso ${idx + 1}`);
        expect(step.title.length).toBeGreaterThan(0);
        expect(step.subhead.length).toBeGreaterThan(0);
        expect(step.explanation.length).toBeGreaterThan(0);
        expect(step.physicalInsight.length).toBeGreaterThan(0);
      });

      // Títulos conceptuales
      expect(DEDUCTION_STEPS[0].title).toBe("Separación de Variables");
      expect(DEDUCTION_STEPS[1].title).toBe("Integración de Ambos Miembros");
      expect(DEDUCTION_STEPS[2].title).toBe("Exponenciación Natural");
      expect(DEDUCTION_STEPS[3].title).toBe("Solución General de la EDO");
      expect(DEDUCTION_STEPS[4].title).toBe("Problema de Valor Inicial (PVI)");
      expect(DEDUCTION_STEPS[5].title).toBe("Solución Particular del Sistema");
    });

    it("2.2 Las 8 variables de la EDO están catalogadas con física y matemáticas", () => {
      expect(EQUATION_VARIABLES.length).toBe(8);

      const symbols = EQUATION_VARIABLES.map(v => v.symbol);
      expect(symbols).toContain("C(t)");
      expect(symbols).toContain("t");
      expect(symbols).toContain("dC/dt");
      expect(symbols).toContain("k");
      expect(symbols).toContain("C_ext");
      expect(symbols).toContain("C_0");
      expect(symbols).toContain("c");
      expect(symbols).toContain("e");

      EQUATION_VARIABLES.forEach(v => {
        expect(v.name.length).toBeGreaterThan(0);
        expect(v.unit.length).toBeGreaterThan(0);
        expect(v.typeLabel.length).toBeGreaterThan(0);
        expect(v.hardwareOrigin.length).toBeGreaterThan(0);
        expect(v.mathRole.length).toBeGreaterThan(0);
      });
    });
  });
});
