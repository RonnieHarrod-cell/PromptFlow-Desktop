import React from 'react'

/* global __APP_VERSION__ */

/**
 * Slim banner that always appears below the titlebar showing update status.
 */
export function UpdateBanner({ status, version, percent, error, onDownload, onInstall }) {
    const bar = {
        base: {
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '5px 14px', fontSize: 11, flexShrink: 0,
            borderBottom: '0.5px solid rgba(255,255,255,0.06)',
        },
        idle:        { background: 'rgba(62,207,142,0.06)',  color: 'rgba(62,207,142,0.6)' },
        checking:    { background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.3)' },
        available:   { background: 'rgba(124,108,252,0.12)', color: '#c4beff' },
        downloading: { background: 'rgba(245,158,11,0.1)',   color: '#fbbf24' },
        downloaded:  { background: 'rgba(62,207,142,0.1)',   color: '#3ecf8e' },
        error:       { background: 'rgba(248,113,113,0.1)',  color: '#f87171' },
    }

    const style = { ...bar.base, ...(bar[status] ?? bar.idle) }

    return (
        <div style={style}>
            {status === 'idle' && (
                <span>PromptFlow v{__APP_VERSION__} — up to date</span>
            )}

            {status === 'checking' && (
                <span>Checking for updates…</span>
            )}

            {status === 'available' && (
                <>
                    <span style={{ flex: 1 }}>
                        PromptFlow {version ? `v${version}` : 'update'} is available
                    </span>
                    <button onClick={onDownload} style={btnStyle}>
                        Download update
                    </button>
                </>
            )}

            {status === 'downloading' && (
                <>
                    <span>Downloading update…</span>
                    <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${percent}%`, background: '#f59e0b', borderRadius: 2, transition: 'width 0.3s' }} />
                    </div>
                    <span style={{ minWidth: 32, textAlign: 'right', fontFamily: 'monospace' }}>{percent}%</span>
                </>
            )}

            {status === 'downloaded' && (
                <>
                    <span style={{ flex: 1 }}>
                        PromptFlow {version ? `v${version}` : ''} is ready — restart to install
                    </span>
                    <button onClick={onInstall} style={{ ...btnStyle, background: 'rgba(62,207,142,0.2)', color: '#3ecf8e', borderColor: 'rgba(62,207,142,0.4)' }}>
                        Restart &amp; install
                    </button>
                </>
            )}

            {status === 'error' && (
                <>
                    <span style={{ flex: 1 }}>
                        Update check failed: {error?.message || (typeof error === 'string' ? error : 'Unknown error')}
                    </span>
                    <button onClick={() => window.electron?.updater.check()} style={{ ...btnStyle, background: 'rgba(248,113,113,0.2)', color: '#f87171', borderColor: 'rgba(248,113,113,0.35)' }}>
                        Retry
                    </button>
                </>
            )}
        </div>
    )
}

const btnStyle = {
    fontSize: 11, fontWeight: 500,
    padding: '3px 12px', borderRadius: 5, cursor: 'pointer',
    background: 'rgba(124,108,252,0.2)', color: '#9d91fd',
    border: '0.5px solid rgba(124,108,252,0.35)',
}
