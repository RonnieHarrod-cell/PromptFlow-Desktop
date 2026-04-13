import React from 'react'

/**
 * Slim banner that appears below the titlebar when an update is available,
 * downloading, or ready to install.
 */
export function UpdateBanner({ status, version, percent, error, onDownload, onInstall }) {
    if (status === 'idle' || status === 'checking' || status === 'error') return null

    const bar = {
        base: {
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '5px 14px', fontSize: 11, flexShrink: 0,
            borderBottom: '0.5px solid rgba(255,255,255,0.06)',
        },
        available: { background: 'rgba(124,108,252,0.12)', color: '#c4beff' },
        downloading: { background: 'rgba(245,158,11,0.1)', color: '#fbbf24' },
        downloaded: { background: 'rgba(62,207,142,0.1)', color: '#3ecf8e' },
    }

    const style = { ...bar.base, ...(bar[status] || bar.available) }

    return (
        <div style={style}>
            {status === 'available' && (
                <>
                    <span style={{ flex: 1 }}>
                        PromptFlow {version} is available
                    </span>
                    <button onClick={onDownload} style={btnStyle}>
                        Download update
                    </button>
                    <button onClick={() => { }} style={{ ...btnStyle, background: 'transparent', border: 'none', opacity: 0.5 }}>
                        ✕
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
                        Update ready — restart to install PromptFlow {version}
                    </span>
                    <button onClick={onInstall} style={{ ...btnStyle, background: 'rgba(62,207,142,0.2)', color: '#3ecf8e', borderColor: 'rgba(62,207,142,0.4)' }}>
                        Restart &amp; install
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