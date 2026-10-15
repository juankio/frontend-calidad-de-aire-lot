import { ref, computed, shallowRef, onScopeDispose } from 'vue'

export interface SerialLogItem {
  id: number
  text: string
  time: string
  type: 'rx' | 'tx' | 'sys'
}

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
  const isSupported = computed(() => {
    return typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'serial' in navigator
  })

  function getTimestamp(): string {
    const now = new Date()
    return now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0')
  }

  function addLog(text: string, type: 'rx' | 'tx' | 'sys') {
    logs.value.push({ id: ++logSeq, text, time: getTimestamp(), type })
    if (logs.value.length > 300) logs.value.shift()
  }

  function clearLogs() {
    logs.value = []
  }

  function onSerialLine(listener: (line: string) => void): () => void {
    lineListeners.add(listener)
    return () => {
      lineListeners.delete(listener)
    }
  }

  function emitSerialLine(rawLine: string) {
    const trimmed = rawLine.trim()
    if (!trimmed) return
    for (const listener of lineListeners) {
      try {
        listener(trimmed)
      } catch {}
    }
    const isStatusPollPacket = trimmed.startsWith('{') && trimmed.includes('"cmd":"STATUS"')
    if (isStatusPollPacket) {
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
      try {
        (navigator as any).serial.removeEventListener('disconnect', onSerialDisconnect)
      } catch {}
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
      const existingPorts = await serial.getPorts()
      const selectedPort = existingPorts?.length
        ? existingPorts[0]
        : await serial.requestPort({
            filters: [{ usbVendorId: 0x10c4 }, { usbVendorId: 0x1a86 }, { usbVendorId: 0x303a }]
          })

      await selectedPort.open({ baudRate })
      port.value = selectedPort
      isConnected.value = true
      keepReading = true
      addLog(`Enlace USB abierto a ${baudRate} baudios (8N1). Listo para recibir datos.`, 'sys')

      // Escuchar desconexión física de hardware en el navegador
      if (serial && 'addEventListener' in serial) {
        if (onSerialDisconnect) {
          serial.removeEventListener('disconnect', onSerialDisconnect)
        }
        onSerialDisconnect = (event: any) => {
          if (port.value && (event.target === port.value || event.port === port.value)) {
            handleConnectionLoss()
          }
        }
        serial.addEventListener('disconnect', onSerialDisconnect)
      }

      readLoop()
      return true
    } catch (err: any) {
      if (err?.name === 'NotFoundError') {
        addLog('Selección de puerto USB cancelada por el operador.', 'sys')
      } else {
        addLog(`Error al inicializar enlace USB: ${err?.message || err}`, 'sys')
      }
      return false
    } finally {
      isConnecting.value = false
    }
  }

  async function readLoop() {
    const decoder = new TextDecoder()
    let errorOccurred = false

    while (port.value && port.value.readable && keepReading) {
      try {
        const currentReader = port.value.readable.getReader()
        reader = currentReader
        while (keepReading) {
          const { value, done } = await currentReader.read()
          if (done) break
          if (value) {
            rxBuffer += decoder.decode(value, { stream: true })
            const lines = rxBuffer.split(/\r?\n/)
            for (let i = 0; i < lines.length - 1; i++) {
              if (lines[i].trim().length > 0) emitSerialLine(lines[i])
            }
            rxBuffer = lines[lines.length - 1]
          }
        }
      } catch {
        errorOccurred = true
        break
      } finally {
        if (reader) {
          try { reader.releaseLock() } catch {}
          reader = null
        }
      }
    }

    if (rxBuffer.trim().length > 0) {
      emitSerialLine(rxBuffer.trim())
      rxBuffer = ''
    }

    if (errorOccurred) {
      await handleConnectionLoss()
    }
  }

  async function sendLine(line: string, silent = false): Promise<boolean> {
    if (!isConnected.value || !port.value || !port.value.writable) {
      if (!silent) addLog('No hay canal USB activo para transmitir.', 'sys')
      return false
    }

    let writer: any = null
    try {
      if (port.value.writable.locked) {
        if (!silent) addLog('Canal de transmisión USB ocupado.', 'sys')
        return false
      }
      writer = port.value.writable.getWriter()
      const dataToSend = line.endsWith('\n') ? line : line + '\n'
      await writer.write(new TextEncoder().encode(dataToSend))
      if (!silent) addLog(line.trim(), 'tx')
      return true
    } catch (err: any) {
      if (!silent) addLog(`Fallo de transmisión: ${err?.message || err}`, 'sys')
      const msg = String(err?.message || err)
      if (msg.includes('device has been lost') || msg.includes('NetworkError') || !port.value?.writable) {
        await handleConnectionLoss()
      }
      return false
    } finally {
      if (writer) {
        try { writer.releaseLock() } catch {}
      }
    }
  }

  async function disconnect(): Promise<void> {
    await cleanupResources('Canal serie USB desacoplado.')
  }

  onScopeDispose(() => {
    if (keepBackgroundAlive) return
    if (typeof navigator !== 'undefined' && 'serial' in navigator && onSerialDisconnect) {
      try {
        (navigator as any).serial.removeEventListener('disconnect', onSerialDisconnect)
      } catch {}
      onSerialDisconnect = null
    }
    if (isConnected.value) disconnect()
  })

  return { isSupported, isConnected, isConnecting, logs, connect, disconnect, sendLine, clearLogs, onSerialLine }
}
