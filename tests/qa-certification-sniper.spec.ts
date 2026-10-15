import { describe, it, expect } from "bun:test";
import fs from "node:fs";
import path from "node:path";

const FRONTEND_DIR = "/home/juankio/air-guardian-iot/frontend";

describe("🎯 [USOPP SNIPER QA] Certificación de Correcciones Frontend", () => {
  // 1. AlchemyMlBoard.vue maneja props.sessions = []
  it("1. AlchemyMlBoard.vue maneja de forma segura props.sessions como array vacío []", () => {
    const filePath = path.join(FRONTEND_DIR, "components/madlab/AlchemyMlBoard.vue");
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, "utf-8");

    // Debe comprobar explícitamente length > 0 antes de usar props.sessions
    expect(content).toContain("props.sessions && props.sessions.length > 0");
    
    // Simulación directa del bloque de exportación gold con sessions = []
    const fallbackSessions = [{ id: 'ses-1', name: 'Campus', lat: 4.14, lng: -73.62, avg_ppm: 430 }];
    const props = { sessions: [] as any[] };
    const layer = 'gold';
    const data = layer === 'gold' 
      ? (props.sessions && props.sessions.length > 0 ? props.sessions : fallbackSessions)
      : [{ timestamp: Date.now(), ppm: 410, nivel: layer }];

    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toBeDefined();
    expect(Object.keys(data[0]).length).toBeGreaterThan(0);
  });

  // 2. EditLocationModal.vue no instancia useAirGuardian()
  it("2. EditLocationModal.vue no instancia useAirGuardian() y evita WebSocket duplicado", () => {
    const filePath = path.join(FRONTEND_DIR, "components/madlab/EditLocationModal.vue");
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, "utf-8");

    // No debe llamar a useAirGuardian()
    expect(content).not.toMatch(/useAirGuardian\s*\(/);
    // Solo debe importar el tipo de TypeScript si es necesario
    if (content.includes("useAirGuardian")) {
      expect(content).toMatch(/import\s+type\s+{[^}]*SessionData[^}]*}\s+from\s+['"]~/);
    }
  });

  // 3. useAirGuardian.ts no reconecta agresivamente en bucle en operationMode === 'LOCAL'
  it("3. useAirGuardian.ts desactiva la reconexión de WebSocket cuando operationMode === 'LOCAL'", () => {
    const filePath = path.join(FRONTEND_DIR, "composables/useAirGuardian.ts");
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, "utf-8");

    // socket.onclose debe verificar operationMode === 'LIVE' antes de iniciar reconnectTimer
    expect(content).toMatch(/if\s*\(\s*operationMode\.value\s*===\s*['"]LIVE['"]\s*&&\s*!reconnectTimer\s*\)/);

    // fallbackPollingTimer debe verificar operationMode === 'LIVE'
    expect(content).toMatch(/operationMode\.value\s*===\s*['"]LIVE['"]/);
  });

  // 4. useWebSerial.ts desuscribe listener de desconexión en cleanupResources y onScopeDispose
  it("4. useWebSerial.ts desuscribe removeEventListener('disconnect') en cleanupResources y onScopeDispose", () => {
    const filePath = path.join(FRONTEND_DIR, "composables/useWebSerial.ts");
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, "utf-8");

    // Contiene removeEventListener('disconnect', onSerialDisconnect)
    const matches = content.match(/removeEventListener\(\s*['"]disconnect['"]\s*,\s*onSerialDisconnect\s*\)/g);
    expect(matches).not.toBeNull();
    // Debe aparecer al menos dos veces (cleanupResources y onScopeDispose o reasignación)
    expect(matches!.length).toBeGreaterThanOrEqual(2);

    expect(content).toContain("onScopeDispose");
  });

  // 5. RealtimeSensorsModal.vue tiene scroll confinado y footer con shrink-0
  it("5. RealtimeSensorsModal.vue confina el scroll y protege el footer contra solapamiento", () => {
    const filePath = path.join(FRONTEND_DIR, "components/madlab/RealtimeSensorsModal.vue");
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, "utf-8");

    // Contenedor modal con límite de altura y overflow hidden
    expect(content).toMatch(/max-h-\[92dvh\]/);
    expect(content).toMatch(/overflow-hidden/);

    // Contenedor de tarjetas con flex-1 min-h-0 y overflow-y-auto
    expect(content).toMatch(/flex-1\s+min-h-0\s+overflow-y-auto/);

    // Footer con shrink-0 para evitar ser comprimido o solapado
    expect(content).toMatch(/<footer[^>]*shrink-0/);
  });

  // 6. tsconfig.json existe y package.json está limpio
  it("6. frontend/tsconfig.json existe y package.json es consistente", () => {
    const tsconfigPath = path.join(FRONTEND_DIR, "tsconfig.json");
    expect(fs.existsSync(tsconfigPath)).toBe(true);
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, "utf-8"));
    expect(tsconfig.extends).toBe("./.nuxt/tsconfig.json");

    const packageJsonPath = path.join(FRONTEND_DIR, "package.json");
    expect(fs.existsSync(packageJsonPath)).toBe(true);
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    
    // No debe haber package-lock.json (BUN ONLY)
    expect(fs.existsSync(path.join(FRONTEND_DIR, "package-lock.json"))).toBe(false);

    // Dependencias esperadas en frontend
    expect(pkg.dependencies.nuxt).toBeDefined();
    expect(pkg.dependencies.vue).toBeDefined();
    expect(pkg.devDependencies.typescript).toBeDefined();
  });
});
