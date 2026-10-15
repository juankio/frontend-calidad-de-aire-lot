import { ref, computed, shallowRef, onScopeDispose } from 'vue'
import {
  formatSerialTimestamp, isStatusPollSerialLine, extractSerialLines,
  openEsp32SerialPort, writeSerialLineToStream, formatSerialConnectError,
  isFatalSerialWriteError, type SerialLogItem
} from '~/utils/webSerialProtocol'

export type { SerialLogItem }

const isConnected = ref(false)
const isConnecting = ref(false)
const port = shallowRef<any>(null)
const logs = ref<SerialLogItem[]>([])

let logSeq = 0
let reader: ReadableStreamDefaultReader<Uint8Array> | null = null
let keepReading = false
let rxBuffer = ''
let onSerialDisconnect: ((event: any) => void) | null = null
let lastStatusLogMs = 0
const keepBackgroundAlive = true
const lineListeners = new Set<(line: string) => void>()

export function useWebSerial() {
  const isSupported = computed(() =>
    typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'serial' in navigator
  )

  function addLog(text: string, type: 'rx' | 'tx' | 'sys') {
    logs.value.push({ id: ++logSeq, text, time: formatSerialTimestamp(), type })
    if (logs.value.length > 300) logs.value.shift()
  }

  function clearLogs() { logs.value = [] }

  function onSerialLine(listener: (line: string) => void): () => void {
    lineListeners.add(listener)
    return () => { lineListeners.delete(listener) }
  }

  function emitSerialLine(rawLine: string) {
    const trimmed = rawLine.trim()
    if (!trimmed) return
    for (const listener of lineListeners) {
      try { listener(trimmed) } catch {}
    }
    if (isStatusPollSerialLine(trimmed)) {
      const now = Date.now()
      if (now - lastStatusLogMs >= 4000) {
        lastStatusLogMs = now
        addLog(trimmed, 'rx')
      }
    } else {
      addLog(trimmed, 'rx')
    }
  }

  async function cleanupResources(logMessage: string) {
    keepReading = false
    if (typeof navigator !== 'undefined' && 'serial' in navigator && onSerialDisconnect) {
      try { (navigator as any).serial.removeEventListener('disconnect', onSerialDisconnect) } catch {}
      onSerialDisconnect = null
    }
    if (reader) {
      try { await reader.cancel() } catch {}
      try { reader.releaseLock() } catch {}
      reader = null
    }
    if (port.value) {
      try { await port.value.close() } catch {}
      port.value = null
    }
    isConnected.value = false
    addLog(logMessage, 'sys')
  }

  async function handleConnectionLoss() {
    if (!isConnected.value && !port.value && !reader) return
    await cleanupResources('[SYS] Conexión USB interrumpida. Puerto liberado y listo para reconectar.')
  }

  async function connect(baudRate = 115200): Promise<boolean> {
    if (!isSupported.value) {
      addLog('Tu navegador no soporta la Web Serial API. Usa Chrome, Edge u Opera.', 'sys')
      return false
    }
    if (isConnected.value) {
      addLog('El puerto serie ya se encuentra enlazado.', 'sys')
      return true
    }
    isConnecting.value = true
    try {
      const serial = (navigator as any).serial
      port.value = await openEsp32SerialPort(serial, baudRate)
      isConnected.value = true
      keepReading = true
      addLog(`Enlace USB abierto a ${baudRate} baudios (8N1). Listo para recibir datos.`, 'sys')
      if (serial && 'addEventListener' in serial) {
        if (onSerialDisconnect) serial.removeEventListener('disconnect', onSerialDisconnect)
        onSerialDisconnect = (event: any) => {
          if (port.value && (event.target === port.value || event.port === port.value)) handleConnectionLoss()
        }
        serial.addEventListener('disconnect', onSerialDisconnect)
      }
      readLoop()
      return true
    } catch (err: any) {
      addLog(formatSerialConnectError(err), 'sys')
      return false
    } finally {
      isConnecting.value = false
    }
  }

  async function readLoop() {
    const decoder = new TextDecoder()
    let errorOccurred = false
    while (port.value?.readable && keepReading) {
      try {
        reader = port.value.readable.getReader()
        while (keepReading && reader) {
          const { value, done } = await reader.read()
          if (done) break
          if (value) {
            const parsed = extractSerialLines(rxBuffer, decoder.decode(value, { stream: true }))
            for (const line of parsed.lines) emitSerialLine(line)
            rxBuffer = parsed.remainingBuffer
          }
        }
      } catch {
        errorOccurred = true
        break
      } finally {
        if (reader) { try { reader.releaseLock() } catch {}; reader = null }
      }
    }
    if (rxBuffer.trim().length > 0) { emitSerialLine(rxBuffer.trim()); rxBuffer = '' }
    if (errorOccurred) await handleConnectionLoss()
  }

  async function sendLine(line: string, silent = false): Promise<boolean> {
    if (!isConnected.value || !port.value?.writable) {
      if (!silent) addLog('No hay canal USB activo para transmitir.', 'sys')
      return false
    }
    if (port.value.writable.locked) {
      if (!silent) addLog('Canal de transmisión USB ocupado.', 'sys')
      return false
    }
    try {
      await writeSerialLineToStream(port.value.writable, line)
      if (!silent) addLog(line.trim(), 'tx')
      return true
    } catch (err: any) {
      if (!silent) addLog(`Fallo de transmisión: ${err?.message || err}`, 'sys')
      if (isFatalSerialWriteError(err, Boolean(port.value?.writable))) await handleConnectionLoss()
      return false
    }
  }

  async function disconnect(): Promise<void> {
    await cleanupResources('Canal serie USB desacoplado.')
  }

  onScopeDispose(() => {
    if (keepBackgroundAlive) return
    if (typeof navigator !== 'undefined' && 'serial' in navigator && onSerialDisconnect) {
      try { (navigator as any).serial.removeEventListener('disconnect', onSerialDisconnect) } catch {}
      onSerialDisconnect = null
    }
    if (isConnected.value) disconnect()
  })

  return { isSupported, isConnected, isConnecting, logs, connect, disconnect, sendLine, clearLogs, onSerialLine }
}
