import { useState, useEffect } from "react"

const isElectron = () => typeof window !== 'undefined' && !!window.electron

export function useUpdater() {
    const [state, setState] = useState({
        status: 'idle',
        version: null,
        percent: 0,
        error: null,
    })

    useEffect(() => {
        if (!isElectron()) return

        const cleanup = window.electron.updater.onChange((event, data) => {
            switch (event) {
                case 'checking':
                    setState(s => ({ ...s, status: 'checking' }))
                    break
                case 'available':
                    setState(s => ({ ...s, status: 'available', version: data?.version }))
                    break
                case 'not-available':
                    setState(s => ({ ...s, status: 'idle' }))
                    break
                case 'progress':
                    setState(s => ({ ...s, status: 'downloading', percent: data?.percent ?? 0 }))
                    break
                case 'downloaded':
                    setState(s => ({ ...s, status: 'downloaded' }))
                    break
                case 'error':
                    setState(s => ({ ...s, status: 'error', error: data }))
                    break
                case 'manual-check':
                    window.electron.updater.check()
                    setState(s => ({ ...s, status: 'checking' }))
                    break
            }
        })

        return cleanup
    }, [])

    const download = () => {
        if (!isElectron()) return
        setState(s => ({ ...s, status: 'downloading', percent: 0 }))
        window.electron.updater.download()
    }

    const install = () => {
        if (!isElectron()) return
        window.electron.updater.install()
    }

    return { ...state, download, install }
}