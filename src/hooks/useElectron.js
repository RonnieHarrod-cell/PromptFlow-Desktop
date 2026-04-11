import { useEffect, useCallback } from 'react'

/**
 * Returns true if running inside Electron.
 */
export function isElectron() {
  return typeof window !== 'undefined' && !!window.electron
}

/**
 * Hook for persisting the API key via Electron's main process keystore.
 * Falls back to sessionStorage when running in a plain browser.
 */
export function useApiKey(setApiKey) {
  useEffect(() => {
    async function load() {
      if (isElectron()) {
        const key = await window.electron.keystore.get()
        if (key) setApiKey(key)
      } else {
        const key = sessionStorage.getItem('pf_api_key') || ''
        if (key) setApiKey(key)
      }
    }
    load()
  }, []) // eslint-disable-line

  const save = useCallback(async (key) => {
    setApiKey(key)
    if (isElectron()) {
      await window.electron.keystore.set(key)
    } else {
      sessionStorage.setItem('pf_api_key', key)
    }
  }, [setApiKey])

  return { save }
}

/**
 * Hook that listens to native menu actions forwarded from the main process
 * and calls the matching handler.
 *
 * handlers shape: { run, stop, save, fork, 'new-prompt' }
 */
export function useMenuActions(handlers) {
  useEffect(() => {
    if (!isElectron()) return

    const cleanup = window.electron.onMenuAction((action) => {
      handlers[action]?.()
    })

    return cleanup
  }, [handlers])
}