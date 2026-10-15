export interface SerialLogItem {
  id: number
  text: string
  time: string
  type: 'rx' | 'tx' | 'sys'
}

export const ESP32_USB_FILTERS = [
  { usbVendorId: 0x10c4 },
  { usbVendorId: 0x1a86 },
  { usbVendorId: 0x303a }
]

export function formatSerialTimestamp(now = new Date()): string {
  return now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0')
}

export function isStatusPollSerialLine(trimmedLine: string): boolean {
  return trimmedLine.startsWith('{') && trimmedLine.includes('"cmd":"STATUS"')
}

export function extractSerialLines(
  currentBuffer: string,
  decodedChunk: string
): { lines: string[]; remainingBuffer: string } {
  const parts = (currentBuffer + decodedChunk).split(/\r?\n/)
  const completedLines: string[] = []
  for (let i = 0; i < parts.length - 1; i++) {
    const trimmed = parts[i].trim()
    if (trimmed.length > 0) completedLines.push(trimmed)
  }
  return { lines: completedLines, remainingBuffer: parts[parts.length - 1] ?? '' }
}

export function encodeSerialFrame(line: string): Uint8Array {
  return new TextEncoder().encode(line.endsWith('\n') ? line : `${line}\n`)
}

export async function openEsp32SerialPort(serialApi: any, baudRate: number): Promise<any> {
  const existingPorts = await serialApi.getPorts()
  const selectedPort = existingPorts?.length
    ? existingPorts[0]
    : await serialApi.requestPort({ filters: ESP32_USB_FILTERS })
  await selectedPort.open({ baudRate })
  return selectedPort
}

export async function writeSerialLineToStream(writable: any, line: string): Promise<void> {
  const writer = writable.getWriter()
  try {
    await writer.write(encodeSerialFrame(line))
  } finally {
    try { writer.releaseLock() } catch {}
  }
}

export function formatSerialConnectError(err: any): string {
  return err?.name === 'NotFoundError'
    ? 'Selección de puerto USB cancelada por el operador.'
    : `Error al inicializar enlace USB: ${err?.message || err}`
}

export function parseSerialJsonPacket(line: string): Record<string, unknown> | null {
  const trimmed = line.trim()
  if (!trimmed.startsWith('{')) return null
  try {
    const parsed = JSON.parse(trimmed)
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null
  } catch {
    return null
  }
}

export function buildGetStatusCommand(): string {
  return JSON.stringify({ cmd: 'GET_STATUS' })
}

export function buildSetWifiCommand(ssid: string, pass: string, server: string): string {
  return JSON.stringify({ cmd: 'SET_WIFI', ssid: ssid.trim(), pass, server: server.trim() })
}

export function buildEmotionSerialCommand(emotion: string, viewMode: 'FACE' | 'HUD' = 'FACE'): string {
  return JSON.stringify({ cmd: 'SET_EMOTION', emotion, view_mode: viewMode })
}

export function isFatalSerialWriteError(err: unknown, hasWritableStream: boolean): boolean {
  const msg = String((err as { message?: string })?.message || err)
  return msg.includes('device has been lost') || msg.includes('NetworkError') || !hasWritableStream
}
