// Debug logger — silent by default, so logs can stay in the code.
//
// Enable:  add `?debug` to the page URL (remembered in localStorage)
// Disable: add `?debug=off` to the page URL
//
// Usage:
//   import { createLogger } from '../utils/logger'
//   const logger = createLogger('my-animation')
//   logger.log('init', { elements })
//   logger.warn('missing element')
//   logger.error('something broke')       // always shown, even without debug
//   ScrollTrigger.create({ markers: logger.markers, ... })

const STORAGE_KEY = 'psg:debug'
const QUERY_PARAM = 'debug'

function readStorage() {
    try {
        return localStorage.getItem(STORAGE_KEY) === 'true'
    } catch {
        return false
    }
}

function writeStorage(enabled) {
    try {
        if (enabled) localStorage.setItem(STORAGE_KEY, 'true')
        else localStorage.removeItem(STORAGE_KEY)
    } catch {
        // Storage unavailable (private mode, blocked cookies): URL flag still works.
    }
}

function resolveDebug() {
    const param = new URLSearchParams(window.location.search).get(QUERY_PARAM)
    if (param === null) return readStorage()

    const enabled = param !== 'off' && param !== 'false' && param !== '0'
    writeStorage(enabled)
    return enabled
}

export const isDebug = resolveDebug()

if (isDebug) {
    console.info(`[debug] enabled — add ?${QUERY_PARAM}=off to the URL to disable`)
}

export function createLogger(namespace) {
    const prefix = `[${namespace}]`

    return {
        log: (...args) => isDebug && console.log(prefix, ...args),
        warn: (...args) => isDebug && console.warn(prefix, ...args),
        error: (...args) => console.error(prefix, ...args),
        // Logs a grouped table of named values, e.g. logger.table({ start, end })
        table: (label, data) => {
            if (!isDebug) return
            console.groupCollapsed(`${prefix} ${label}`)
            console.table(data)
            console.groupEnd()
        },
        // Pass to ScrollTrigger `markers` to show them only in debug mode.
        markers: isDebug
    }
}
